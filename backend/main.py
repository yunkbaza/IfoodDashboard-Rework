import os
import json
import requests
import re
from datetime import datetime, timedelta
from typing import List

# FastAPI, WebSockets e Segurança
from fastapi import FastAPI, Depends, Query, HTTPException, status, WebSocket, WebSocketDisconnect
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func, cast, Date, desc
from pydantic import BaseModel
import uvicorn
from dotenv import load_dotenv

# Importações do projeto
from app.core.database import get_db, engine
from app.models.pedido import Pedido, ItemPedido, Usuario, Avaliacao, Base 
from app.schemas.pedido import PedidoSchema
from app.core.auth import verificar_senha, obter_hash_senha, criar_token_acesso

# Inicialização
load_dotenv()
Base.metadata.create_all(bind=engine)

app = FastAPI(title="iFood Dashboard Pro API", version="3.0.0")

# ==========================================
# 🛡️ CONFIGURAÇÃO DE CORS
# ==========================================
# Essencial para que o seu frontend (localhost:3000) consiga falar com este backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"], 
)

# ==========================================
# 🔌 SISTEMA DE WEBSOCKET (LIVE ORDERS)
# ==========================================
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        """Envia um aviso para todos os dashboards e telas de cozinha abertas"""
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                pass 

manager = ConnectionManager()

@app.websocket("/ws/pedidos")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Mantém a conexão aberta esperando sinais do cliente
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# ==========================================
# 📊 SCHEMAS E AUXILIARES
# ==========================================
class StatusUpdate(BaseModel):
    status: str

class FeedbackRequest(BaseModel):
    feedbacks: List[str]

class AvaliacaoCreate(BaseModel):
    cliente: str
    nota: int
    texto: str
    sentimento: str

def apply_date_filter(query, periodo: str):
    hoje = datetime.now().date()
    if periodo == 'hoje':
        return query.filter(cast(Pedido.data_hora, Date) == hoje)
    elif periodo == 'mensal':
        return query.filter(cast(Pedido.data_hora, Date) >= (hoje - timedelta(days=30)))
    else: 
        return query.filter(cast(Pedido.data_hora, Date) >= (hoje - timedelta(days=7)))

# ==========================================
# 🤖 ROTA DE IA (GEMINI 2.5 FLASH)
# ==========================================
@app.post("/api/feedbacks/analise")
def analisar_feedbacks_ia(request: FeedbackRequest):
    API_KEY = os.getenv("GEMINI_API_KEY")
    
    if not API_KEY:
        print("🚨 IA: ERRO - Chave não encontrada no .env!")
        return [{"tipo": "AlertTriangle", "titulo": "Erro de Configuração", "reclamacao": "Chave API ausente.", "dica": "Verifique o arquivo .env"}]

    try:
        prompt = f"""
        Analise estes feedbacks de clientes do iFood: {request.feedbacks}
        Identifique os 2 maiores problemas recorrentes.
        Retorne estritamente um JSON (lista de objetos) com:
        'tipo' (TrendingDown ou AlertTriangle), 'titulo', 'reclamacao' e 'dica'.
        """
        
        # Endpoint validado via test_ia.py com Status 200
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={API_KEY}"
        
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {
                "responseMimeType": "application/json",
                "temperature": 0.1
            }
        }
        
        resposta = requests.post(url, json=payload, timeout=15)
        
        if resposta.status_code != 200:
            print(f"🚨 Google API Error {resposta.status_code}: {resposta.text}")
            raise Exception(f"Google API Error {resposta.status_code}")
        
        texto_ia = resposta.json()['candidates'][0]['content']['parts'][0]['text']
        return json.loads(texto_ia)

    except Exception as e:
        print(f"🚨 Falha na IA: {str(e)}")
        return [
            {
                "tipo": "AlertTriangle", 
                "titulo": "Análise Indisponível", 
                "reclamacao": "Erro ao processar dados com Gemini 2.5.", 
                "dica": "Verifique os logs ou a quota da API."
            }
        ]

# ==========================================
# 📦 OPERAÇÃO E DASHBOARD (COM BROADCAST)
# ==========================================
@app.post("/api/pedidos")
async def criar_pedido(pedido_data: PedidoSchema, db: Session = Depends(get_db)):
    novo_pedido = Pedido(
        id_pedido=pedido_data.id_pedido, status=pedido_data.status,
        valor_total=pedido_data.valor_total, taxa_entrega=pedido_data.taxa_entrega,
        forma_pagamento=pedido_data.forma_pagamento, bairro_destino=pedido_data.bairro_destino,
        data_hora=pedido_data.data_hora
    )
    db.add(novo_pedido)
    db.commit()
    
    # ⚡ NOTIFICAÇÃO REAL-TIME: O pedido "pula" na tela da cozinha
    await manager.broadcast({"action": "new_order", "id_pedido": novo_pedido.id_pedido})
    
    return {"status": "success", "id": novo_pedido.id_pedido}

@app.put("/api/pedidos/{id_pedido}/status")
async def atualizar_status(id_pedido: str, status_data: StatusUpdate, db: Session = Depends(get_db)):
    pedido = db.query(Pedido).filter(Pedido.id_pedido == id_pedido).first()
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")
    
    pedido.status = status_data.status
    db.commit()
    
    # ⚡ ATUALIZAÇÃO REAL-TIME: O card se move no Kanban
    await manager.broadcast({"action": "update_status", "id_pedido": id_pedido, "status": status_data.status})
    
    return {"message": "Status atualizado"}

# --- Rotas de Listagem e Estatísticas ---
@app.get("/api/pedidos")
def listar_pedidos(periodo: str = Query("7dias"), db: Session = Depends(get_db)):
    query = db.query(Pedido)
    query = apply_date_filter(query, periodo)
    return query.order_by(desc(Pedido.data_hora)).all()

@app.get("/api/dashboard/stats")
def get_dashboard_stats(periodo: str = Query("7dias"), db: Session = Depends(get_db)):
    query = apply_date_filter(db.query(Pedido), periodo)
    total = query.count()
    faturamento = query.with_entities(func.sum(Pedido.valor_total)).scalar() or 0.0
    return {"faturamento_total": round(faturamento, 2), "total_pedidos": total, "ticket_medio": round(faturamento / total, 2) if total > 0 else 0.0}

@app.get("/api/dashboard/financeiro")
def get_saude_financeira(periodo: str = Query("7dias"), db: Session = Depends(get_db)):
    query = apply_date_filter(db.query(Pedido).filter(Pedido.status == "CONCLUIDO"), periodo)
    pedidos = query.all()
    if not pedidos: return {"bruto": 0.0, "lucro_liquido": 0.0, "margem_percentual": "0%"}
    faturamento = sum(p.valor_total for p in pedidos)
    lucro = faturamento - (faturamento * 0.262) # Taxa iFood + Impostos (Simulado)
    return {"bruto": round(faturamento, 2), "lucro_liquido": round(lucro, 2), "margem_percentual": f"{round((lucro/faturamento*100), 1)}%"}

@app.get("/api/dashboard/vendas-diarias")
def get_vendas_diarias(periodo: str = Query("7dias"), db: Session = Depends(get_db)):
    query = apply_date_filter(db.query(cast(Pedido.data_hora, Date).label("data"), func.sum(Pedido.valor_total).label("total")).filter(Pedido.status == "CONCLUIDO"), periodo)
    vendas = query.group_by("data").order_by("data").all()
    return [{"data": v.data.strftime("%d/%m"), "valor": float(v.total)} for v in vendas]

@app.get("/api/dashboard/top-produtos")
def get_top_produtos(periodo: str = Query("7dias"), db: Session = Depends(get_db)):
    query = apply_date_filter(db.query(ItemPedido.nome_produto.label("nome"), func.sum(ItemPedido.quantidade).label("qtd"), func.sum(ItemPedido.quantidade * ItemPedido.preco_unitario).label("receita")).join(Pedido).filter(Pedido.status == "CONCLUIDO"), periodo)
    return [{"nome": p.nome, "quantidade": p.qtd, "receita": round(p.receita, 2)} for p in query.group_by("nome").order_by(desc("qtd")).limit(5).all()]

@app.get("/api/dashboard/bairros")
def get_stats_bairros(periodo: str = Query("7dias"), db: Session = Depends(get_db)):
    query = apply_date_filter(db.query(Pedido.bairro_destino, func.count(Pedido.id_pedido).label("total")).filter(Pedido.status == "CONCLUIDO"), periodo)
    return [{"bairro": r[0], "pedidos": r[1]} for r in query.group_by(Pedido.bairro_destino).order_by(desc("total")).all()]

@app.get("/api/dashboard/horarios")
def get_stats_horarios(periodo: str = Query("7dias"), db: Session = Depends(get_db)):
    query = apply_date_filter(db.query(func.extract('hour', Pedido.data_hora).label("hora"), func.count(Pedido.id_pedido).label("total")), periodo)
    return [{"hora": f"{int(r[0])}h", "pedidos": r[1]} for r in query.group_by("hora").order_by("hora").all()]

@app.get("/api/dashboard/pagamentos")
def get_stats_pagamentos(periodo: str = Query("7dias"), db: Session = Depends(get_db)):
    query = apply_date_filter(db.query(Pedido.forma_pagamento, func.count(Pedido.id_pedido).label("total")), periodo)
    return [{"tipo": r[0], "valor": r[1]} for r in query.group_by(Pedido.forma_pagamento).all()]

@app.get("/api/avaliacoes")
def listar_avaliacoes(db: Session = Depends(get_db)):
    return db.query(Avaliacao).order_by(desc(Avaliacao.data)).all()

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)