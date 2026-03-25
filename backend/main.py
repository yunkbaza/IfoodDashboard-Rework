import os
import json
import requests
import re
from datetime import datetime, timedelta
from typing import List

from fastapi import FastAPI, Depends, Query, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func, cast, Date, desc
from pydantic import BaseModel
import uvicorn
from dotenv import load_dotenv

from app.core.database import get_db, engine
from app.models.pedido import Pedido, ItemPedido, Usuario, Avaliacao, Base 
from app.schemas.pedido import PedidoSchema
from app.core.auth import verificar_senha, obter_hash_senha, criar_token_acesso, ACCESS_TOKEN_EXPIRE_MINUTES

# Carrega variáveis do arquivo .env
load_dotenv()

# Inicialização automática do Banco de Dados
Base.metadata.create_all(bind=engine)

app = FastAPI(title="iFood Dashboard Pro API", version="2.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"], 
)

# --- SCHEMAS DE DADOS ---
class StatusUpdate(BaseModel):
    status: str

class FeedbackRequest(BaseModel):
    feedbacks: List[str]

class AvaliacaoCreate(BaseModel):
    cliente: str
    nota: int
    texto: str
    sentimento: str

# --- FUNÇÕES AUXILIARES ---

def apply_date_filter(query, periodo: str):
    hoje = datetime.now().date()
    if periodo == 'hoje':
        return query.filter(cast(Pedido.data_hora, Date) == hoje)
    elif periodo == 'mensal':
        trinta_dias_atras = hoje - timedelta(days=30)
        return query.filter(cast(Pedido.data_hora, Date) >= trinta_dias_atras)
    else: # Padrão: 7 dias
        sete_dias_atras = hoje - timedelta(days=7)
        return query.filter(cast(Pedido.data_hora, Date) >= sete_dias_atras)

# --- ROTAS DE AUTENTICAÇÃO ---

@app.post("/api/auth/registrar")
def registrar_admin(db: Session = Depends(get_db)):
    usuario_existente = db.query(Usuario).filter(Usuario.email == "admin@ifood.com").first()
    if usuario_existente:
        return {"message": "Admin já cadastrado."}
        
    novo_admin = Usuario(
        nome="Administrador iFood",
        email="admin@ifood.com",
        senha_hash=obter_hash_senha("senha123")
    )
    db.add(novo_admin)
    db.commit()
    return {"message": "Acesso criado: admin@ifood.com / senha123"}

@app.post("/api/auth/login")
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter(Usuario.email == form_data.username).first()
    if not usuario or not verificar_senha(form_data.password, usuario.senha_hash):
        raise HTTPException(status_code=401, detail="Credenciais incorretas")
        
    access_token = criar_token_acesso(data={"sub": usuario.email})
    return {"access_token": access_token, "token_type": "bearer", "nome": usuario.nome}

@app.get("/")
def read_root():
    return {"status": "Online", "engine": "Gemini 2.5 Flash Ativo"}

# --- ROTAS DE AVALIAÇÕES (DADOS DINÂMICOS) ---

@app.get("/api/avaliacoes")
def listar_avaliacoes(db: Session = Depends(get_db)):
    """Busca todas as avaliações reais salvas no banco de dados."""
    return db.query(Avaliacao).order_by(desc(Avaliacao.data)).all()

@app.post("/api/avaliacoes")
def criar_avaliacao(dados: AvaliacaoCreate, db: Session = Depends(get_db)):
    """Cria uma nova avaliação de cliente no banco de dados."""
    nova_av = Avaliacao(
        cliente=dados.cliente,
        nota=dados.nota,
        texto=dados.texto,
        sentimento=dados.sentimento
    )
    db.add(nova_av)
    db.commit()
    db.refresh(nova_av)
    return nova_av

# --- ROTA DA INTELIGÊNCIA ARTIFICIAL (CONEXÃO DIRETA GEMINI 2.5) ---

@app.post("/api/feedbacks/analise")
def analisar_feedbacks_ia(request: FeedbackRequest):
    # Cole a sua chave REAL aqui dentro das aspas, exatamente assim:
    API_KEY = "AIzaSyBgSbopdaE4uRxgm72uZB1Z9k8DRvYuW8s"
        
    try:
        prompt = f"""
        Você é um consultor especialista em operações de delivery. 
        Analise estes feedbacks de clientes: {request.feedbacks}
        
        Identifique os 2 maiores problemas operacionais e sugira soluções práticas e imediatas.
        Retorne APENAS um JSON (lista de objetos) com estas chaves exatas:
        'tipo' (use 'TrendingDown' ou 'AlertTriangle'), 'titulo', 'reclamacao' e 'dica'.
        Não escreva nenhuma introdução, explicação ou conclusão.
        """
        
        # URL utilizando o modelo 2.5 Flash (v1beta para suporte a JSON estruturado)
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={API_KEY}"
        
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {
                "responseMimeType": "application/json",
                "temperature": 0.2
            }
        }
        
        resposta = requests.post(url, json=payload, timeout=15)
        
        if resposta.status_code != 200:
            raise Exception(f"Google API Error {resposta.status_code}")
            
        dados_ia = resposta.json()
        texto_puro = dados_ia['candidates'][0]['content']['parts'][0]['text']
        
        # Extrator de segurança para isolar o JSON
        match = re.search(r'\[.*\]', texto_puro, re.DOTALL)
        if match:
            return json.loads(match.group(0))
        return json.loads(texto_puro)
            
    except Exception as e:
        print(f"🚨 Erro na IA: {e}")
        return [
            {
                "tipo": "AlertTriangle",
                "titulo": "Análise Indisponível",
                "reclamacao": "Não foi possível processar os sentimentos dos clientes agora.",
                "dica": "Verifique os logs do servidor ou tente novamente em alguns instantes."
            }
        ]

# --- ROTAS DE OPERAÇÃO E DASHBOARD ---

@app.post("/api/pedidos")
def criar_pedido(pedido_data: PedidoSchema, db: Session = Depends(get_db)):
    novo_pedido = Pedido(
        id_pedido=pedido_data.id_pedido, status=pedido_data.status,
        valor_total=pedido_data.valor_total, taxa_entrega=pedido_data.taxa_entrega,
        forma_pagamento=pedido_data.forma_pagamento, bairro_destino=pedido_data.bairro_destino,
        data_hora=pedido_data.data_hora
    )
    db.add(novo_pedido)
    for item in pedido_data.itens:
        db.add(ItemPedido(
            id_pedido=pedido_data.id_pedido, nome_produto=item.nome_produto,
            quantidade=item.quantidade, preco_unitario=item.preco_unitario,
            custo_producao=getattr(item, 'custo_producao', 0.0)
        ))
    db.commit()
    return {"status": "success", "id": novo_pedido.id_pedido}

@app.get("/api/pedidos")
def listar_pedidos(periodo: str = Query("7dias"), db: Session = Depends(get_db)):
    query = db.query(Pedido)
    query = apply_date_filter(query, periodo)
    return query.order_by(desc(Pedido.data_hora)).all()

@app.put("/api/pedidos/{id_pedido}/status")
def atualizar_status(id_pedido: str, status_data: StatusUpdate, db: Session = Depends(get_db)):
    pedido = db.query(Pedido).filter(Pedido.id_pedido == id_pedido).first()
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")
    pedido.status = status_data.status
    db.commit()
    return {"message": "Status atualizado"}

@app.get("/api/dashboard/stats")
def get_dashboard_stats(periodo: str = Query("7dias"), db: Session = Depends(get_db)):
    query = apply_date_filter(db.query(Pedido), periodo)
    total = query.count()
    faturamento = query.with_entities(func.sum(Pedido.valor_total)).scalar() or 0.0
    return {
        "faturamento_total": round(faturamento, 2),
        "total_pedidos": total,
        "ticket_medio": round(faturamento / total, 2) if total > 0 else 0.0
    }

@app.get("/api/dashboard/financeiro")
def get_saude_financeira(periodo: str = Query("7dias"), db: Session = Depends(get_db)):
    query = apply_date_filter(db.query(Pedido).filter(Pedido.status == "CONCLUIDO"), periodo)
    pedidos = query.all()
    if not pedidos:
        return {"bruto": 0.0, "lucro_liquido": 0.0, "margem_percentual": "0%"}
        
    faturamento = sum(p.valor_total for p in pedidos)
    taxas = faturamento * 0.262
    ids = [p.id_pedido for p in pedidos]
    custos = db.query(func.sum(ItemPedido.custo_producao)).filter(ItemPedido.id_pedido.in_(ids)).scalar() or 0.0
    
    lucro = faturamento - taxas - custos
    margem = (lucro / faturamento * 100) if faturamento > 0 else 0
    return {
        "bruto": round(faturamento, 2),
        "lucro_liquido": round(lucro, 2),
        "margem_percentual": f"{round(margem, 1)}%"
    }

@app.get("/api/dashboard/vendas-diarias")
def get_vendas_diarias(periodo: str = Query("7dias"), db: Session = Depends(get_db)):
    query = apply_date_filter(db.query(cast(Pedido.data_hora, Date).label("data"), func.sum(Pedido.valor_total).label("total")).filter(Pedido.status == "CONCLUIDO"), periodo)
    vendas = query.group_by("data").order_by("data").all()
    return [{"data": v.data.strftime("%d/%m"), "valor": float(v.total)} for v in vendas]

@app.get("/api/dashboard/top-produtos")
def get_top_produtos(periodo: str = Query("7dias"), db: Session = Depends(get_db)):
    query = apply_date_filter(db.query(ItemPedido.nome_produto.label("nome"), func.sum(ItemPedido.quantidade).label("qtd"), func.sum(ItemPedido.quantidade * ItemPedido.preco_unitario).label("receita")).join(Pedido).filter(Pedido.status == "CONCLUIDO"), periodo)
    top = query.group_by("nome").order_by(desc("qtd")).limit(5).all()
    return [{"nome": p.nome, "quantidade": p.qtd, "receita": round(p.receita, 2)} for p in top]

@app.get("/api/dashboard/bairros")
def get_stats_bairros(periodo: str = Query("7dias"), db: Session = Depends(get_db)):
    query = apply_date_filter(db.query(Pedido.bairro_destino, func.count(Pedido.id_pedido).label("total")).filter(Pedido.status == "CONCLUIDO"), periodo)
    res = query.group_by(Pedido.bairro_destino).order_by(desc("total")).all()
    return [{"bairro": r[0], "pedidos": r[1]} for r in res]

@app.get("/api/dashboard/horarios")
def get_stats_horarios(periodo: str = Query("7dias"), db: Session = Depends(get_db)):
    query = apply_date_filter(db.query(func.extract('hour', Pedido.data_hora).label("hora"), func.count(Pedido.id_pedido).label("total")), periodo)
    res = query.group_by("hora").order_by("hora").all()
    return [{"hora": f"{int(r[0])}h", "pedidos": r[1]} for r in res]

@app.get("/api/dashboard/pagamentos")
def get_stats_pagamentos(periodo: str = Query("7dias"), db: Session = Depends(get_db)):
    query = apply_date_filter(db.query(Pedido.forma_pagamento, func.count(Pedido.id_pedido).label("total")), periodo)
    res = query.group_by(Pedido.forma_pagamento).all()
    return [{"tipo": r[0], "valor": r[1]} for r in res]

@app.get("/api/dashboard/meta")
def get_meta_anual(db: Session = Depends(get_db)):
    inicio_ano = datetime.now().date().replace(month=1, day=1)
    faturamento_ano = db.query(func.sum(Pedido.valor_total)).filter(Pedido.status == "CONCLUIDO", cast(Pedido.data_hora, Date) >= inicio_ano).scalar() or 0.0
    return {"faturamento_anual": round(faturamento_ano, 2)}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)