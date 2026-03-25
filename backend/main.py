from fastapi import FastAPI, Depends, Query, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text, func, cast, Date, desc
from datetime import datetime, timedelta
import uvicorn

from app.core.database import get_db, engine
# IMPORTANTE: Adicionámos a importação do Usuario aqui
from app.models.pedido import Pedido, ItemPedido, Usuario, Base 
from app.schemas.pedido import PedidoSchema

# Importações do nosso novo motor de segurança
from app.core.auth import verificar_senha, obter_hash_senha, criar_token_acesso, ACCESS_TOKEN_EXPIRE_MINUTES

# Cria as tabelas automaticamente
Base.metadata.create_all(bind=engine)

app = FastAPI(title="iFood Dashboard API", version="1.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"], 
)

# --- ROTAS DE AUTENTICAÇÃO (NOVAS) ---

@app.post("/api/auth/registrar")
def registrar_admin(db: Session = Depends(get_db)):
    usuario_existente = db.query(Usuario).filter(Usuario.email == "admin@ifood.com").first()
    if usuario_existente:
        return {"message": "Admin já existe."}
        
    novo_admin = Usuario(
        nome="Administrador",
        email="admin@ifood.com",
        senha_hash=obter_hash_senha("senha123")
    )
    db.add(novo_admin)
    db.commit()
    return {"message": "Usuário admin@ifood.com criado com a senha: senha123"}

@app.post("/api/auth/login")
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter(Usuario.email == form_data.username).first()
    
    if not usuario or not verificar_senha(form_data.password, usuario.senha_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou palavra-passe incorretos",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = criar_token_acesso(
        data={"sub": usuario.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer", "nome": usuario.nome}


# --- FUNÇÃO AUXILIAR DE FILTRO DE DATA ---
def apply_date_filter(query, periodo: str):
    hoje = datetime.now().date()
    if periodo == 'hoje':
        return query.filter(cast(Pedido.data_hora, Date) == hoje)
    elif periodo == 'ontem':
        ontem = hoje - timedelta(days=1)
        return query.filter(cast(Pedido.data_hora, Date) == ontem)
    else: # 7dias (Padrão)
        sete_dias_atras = hoje - timedelta(days=7)
        return query.filter(cast(Pedido.data_hora, Date) >= sete_dias_atras)

@app.get("/")
def read_root():
    return {"status": "API iFood Pro ativa", "versao": "1.1.0"}

@app.post("/api/pedidos")
def criar_pedido(pedido_data: PedidoSchema, db: Session = Depends(get_db)):
    novo_pedido = Pedido(
        id_pedido=pedido_data.id_pedido,
        status=pedido_data.status,
        valor_total=pedido_data.valor_total,
        taxa_entrega=pedido_data.taxa_entrega,
        forma_pagamento=pedido_data.forma_pagamento,
        bairro_destino=pedido_data.bairro_destino,
        data_hora=pedido_data.data_hora
    )
    db.add(novo_pedido)
    
    for item in pedido_data.itens:
        novo_item = ItemPedido(
            id_pedido=pedido_data.id_pedido,
            nome_produto=item.nome_produto,
            quantidade=item.quantidade,
            preco_unitario=item.preco_unitario,
            # ADICIONADO: Guardar o custo de produção para o gráfico de Lucro funcionar
            custo_producao=getattr(item, 'custo_producao', 0.0) 
        )
        db.add(novo_item)
    
    db.commit()
    db.refresh(novo_pedido)
    return {"message": "Pedido processado", "id": novo_pedido.id_pedido}

# --- ROTAS DE DASHBOARD EXISTENTES ---

@app.get("/api/dashboard/stats")
def get_dashboard_stats(periodo: str = Query("7dias"), db: Session = Depends(get_db)):
    query = db.query(Pedido)
    query = apply_date_filter(query, periodo)
    
    total_pedidos = query.count()
    faturamento_total = query.with_entities(func.sum(Pedido.valor_total)).scalar() or 0.0
    ticket_medio = faturamento_total / total_pedidos if total_pedidos > 0 else 0.0
    
    return {
        "faturamento_total": round(faturamento_total, 2),
        "total_pedidos": total_pedidos,
        "ticket_medio": round(ticket_medio, 2)
    }

@app.get("/api/dashboard/financeiro")
def get_saude_financeira(periodo: str = Query("7dias"), db: Session = Depends(get_db)):
    query = db.query(Pedido).filter(Pedido.status == "CONCLUIDO")
    query = apply_date_filter(query, periodo)
    pedidos = query.all()
    
    faturamento_bruto = sum(p.valor_total for p in pedidos)
    taxas_ifood = faturamento_bruto * 0.262 
    
    # Extrai apenas os custos dos pedidos do período selecionado
    ids_pedidos = [p.id_pedido for p in pedidos]
    total_custos = 0.0
    if ids_pedidos:
        total_custos = db.query(func.sum(ItemPedido.custo_producao)).filter(ItemPedido.id_pedido.in_(ids_pedidos)).scalar() or 0.0
        
    lucro_liquido = faturamento_bruto - taxas_ifood - total_custos
    return {
        "bruto": round(faturamento_bruto, 2),
        "taxas_estimadas": round(taxas_ifood, 2),
        "custo_producao": round(total_custos, 2),
        "lucro_liquido": round(lucro_liquido, 2),
        "margem_percentual": f"{round((lucro_liquido/faturamento_bruto)*100, 1)}%" if faturamento_bruto > 0 else "0%"
    }

@app.get("/api/dashboard/vendas-diarias")
def get_vendas_diarias(periodo: str = Query("7dias"), db: Session = Depends(get_db)):
    query = db.query(
        cast(Pedido.data_hora, Date).label("data"),
        func.sum(Pedido.valor_total).label("total")
    ).filter(Pedido.status == "CONCLUIDO")
    
    query = apply_date_filter(query, periodo)
    vendas = query.group_by("data").order_by("data").all()
    
    return [{"data": v.data.strftime("%d/%m"), "valor": float(v.total)} for v in vendas]

@app.get("/api/dashboard/top-produtos")
def get_top_produtos(periodo: str = Query("7dias"), db: Session = Depends(get_db)):
    query = db.query(
        ItemPedido.nome_produto.label("nome"),
        func.sum(ItemPedido.quantidade).label("qtd"),
        func.sum(ItemPedido.quantidade * ItemPedido.preco_unitario).label("receita")
    ).join(Pedido).filter(Pedido.status == "CONCLUIDO")
    
    query = apply_date_filter(query, periodo)
    top = query.group_by("nome").order_by(desc("qtd")).limit(5).all()
    
    return [{"nome": p.nome, "quantidade": p.qtd, "receita": round(p.receita, 2)} for p in top]

# --- NOVAS ROTAS DE INTELIGÊNCIA MODULAR ---

@app.get("/api/dashboard/bairros")
def get_stats_bairros(periodo: str = Query("7dias"), db: Session = Depends(get_db)):
    query = db.query(
        Pedido.bairro_destino,
        func.count(Pedido.id_pedido).label("total")
    ).filter(Pedido.status == "CONCLUIDO")
    
    query = apply_date_filter(query, periodo)
    resultado = query.group_by(Pedido.bairro_destino).order_by(desc("total")).all()
    
    return [{"bairro": r[0], "pedidos": r[1]} for r in resultado]

@app.get("/api/dashboard/horarios")
def get_stats_horarios(periodo: str = Query("7dias"), db: Session = Depends(get_db)):
    query = db.query(
        func.extract('hour', Pedido.data_hora).label("hora"),
        func.count(Pedido.id_pedido).label("total")
    )
    
    query = apply_date_filter(query, periodo)
    resultado = query.group_by("hora").order_by("hora").all()
    
    return [{"hora": f"{int(r[0])}h", "pedidos": r[1]} for r in resultado]

@app.get("/api/dashboard/pagamentos")
def get_stats_pagamentos(periodo: str = Query("7dias"), db: Session = Depends(get_db)):
    query = db.query(
        Pedido.forma_pagamento,
        func.count(Pedido.id_pedido).label("total")
    )
    
    query = apply_date_filter(query, periodo)
    resultado = query.group_by(Pedido.forma_pagamento).all()
    
    return [{"tipo": r[0], "valor": r[1]} for r in resultado]


if __name__ == "__main__":
    # Tem que ter 4 espaços (ou 1 Tab) antes do uvicorn.run aqui embaixo!
    uvicorn.run(app, host="0.0.0.0", port=8000)