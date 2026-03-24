from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text, func, cast, Date, desc
from app.core.database import get_db, engine
from app.models.pedido import Pedido, ItemPedido, Base 
from app.schemas.pedido import PedidoSchema

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
        bairro_destino=pedido_data.bairro_destino
    )
    db.add(novo_pedido)
    
    for item in pedido_data.itens:
        novo_item = ItemPedido(
            id_pedido=pedido_data.id_pedido,
            nome_produto=item.nome_produto,
            quantidade=item.quantidade,
            preco_unitario=item.preco_unitario
        )
        db.add(novo_item)
    
    db.commit()
    db.refresh(novo_pedido)
    return {"message": "Pedido processado", "id": novo_pedido.id_pedido}

# --- ROTAS DE DASHBOARD EXISTENTES ---

@app.get("/api/dashboard/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    total_pedidos = db.query(Pedido).count()
    faturamento_total = db.query(func.sum(Pedido.valor_total)).scalar() or 0.0
    ticket_medio = faturamento_total / total_pedidos if total_pedidos > 0 else 0.0
    return {
        "faturamento_total": round(faturamento_total, 2),
        "total_pedidos": total_pedidos,
        "ticket_medio": round(ticket_medio, 2)
    }

@app.get("/api/dashboard/financeiro")
def get_saude_financeira(db: Session = Depends(get_db)):
    pedidos = db.query(Pedido).filter(Pedido.status == "CONCLUIDO").all()
    faturamento_bruto = sum(p.valor_total for p in pedidos)
    taxas_ifood = faturamento_bruto * 0.262 
    total_custos = db.query(func.sum(ItemPedido.custo_producao)).scalar() or 0.0
    lucro_liquido = faturamento_bruto - taxas_ifood - total_custos
    return {
        "bruto": round(faturamento_bruto, 2),
        "taxas_estimadas": round(taxas_ifood, 2),
        "custo_producao": round(total_custos, 2),
        "lucro_liquido": round(lucro_liquido, 2),
        "margem_percentual": f"{round((lucro_liquido/faturamento_bruto)*100, 1)}%" if faturamento_bruto > 0 else "0%"
    }

@app.get("/api/dashboard/vendas-diarias")
def get_vendas_diarias(db: Session = Depends(get_db)):
    vendas = db.query(
        cast(Pedido.data_hora, Date).label("data"),
        func.sum(Pedido.valor_total).label("total")
    ).filter(Pedido.status == "CONCLUIDO").group_by("data").order_by("data").all()
    return [{"data": v.data.strftime("%d/%m"), "valor": float(v.total)} for v in vendas]

@app.get("/api/dashboard/top-produtos")
def get_top_produtos(db: Session = Depends(get_db)):
    top = db.query(
        ItemPedido.nome_produto.label("nome"),
        func.sum(ItemPedido.quantidade).label("qtd"),
        func.sum(ItemPedido.quantidade * ItemPedido.preco_unitario).label("receita")
    ).join(Pedido).filter(Pedido.status == "CONCLUIDO").group_by("nome").order_by(desc("qtd")).limit(5).all()
    return [{"nome": p.nome, "quantidade": p.qtd, "receita": round(p.receita, 2)} for p in top]

# --- NOVAS ROTAS DE INTELIGÊNCIA MODULAR ---

@app.get("/api/dashboard/bairros")
def get_stats_bairros(db: Session = Depends(get_db)):
    resultado = db.query(
        Pedido.bairro_destino,
        func.count(Pedido.id_pedido).label("total")
    ).filter(Pedido.status == "CONCLUIDO").group_by(Pedido.bairro_destino).order_by(desc("total")).all()
    return [{"bairro": r[0], "pedidos": r[1]} for r in resultado]

@app.get("/api/dashboard/horarios")
def get_stats_horarios(db: Session = Depends(get_db)):
    resultado = db.query(
        func.extract('hour', Pedido.data_hora).label("hora"),
        func.count(Pedido.id_pedido).label("total")
    ).group_by("hora").order_by("hora").all()
    return [{"hora": f"{int(r[0])}h", "pedidos": r[1]} for r in resultado]

@app.get("/api/dashboard/pagamentos")
def get_stats_pagamentos(db: Session = Depends(get_db)):
    resultado = db.query(
        Pedido.forma_pagamento,
        func.count(Pedido.id_pedido).label("total")
    ).group_by(Pedido.forma_pagamento).all()
    return [{"tipo": r[0], "valor": r[1]} for r in resultado]