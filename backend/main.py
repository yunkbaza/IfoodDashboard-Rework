import os
import json
import requests
import random
import re
import csv
import io
from datetime import datetime, timedelta
from typing import List, Optional

# FastAPI, WebSockets e Segurança
from fastapi import FastAPI, Depends, Query, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer 
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import func, cast, Date, desc
from pydantic import BaseModel
import uvicorn
from uvicorn.config import LOGGING_CONFIG
from dotenv import load_dotenv

# Importações do projeto
from app.core.database import get_db, engine
from app.models.pedido import Pedido, ItemPedido, Usuario, Avaliacao, Base, Loja # Loja adicionada
from app.schemas.pedido import PedidoSchema
from app.core.auth import verificar_senha, obter_hash_senha, criar_token_acesso

# Inicialização
load_dotenv()
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Ifood Dashboard API", version="3.5.0")

# ==========================================
# 🛡️ CONFIGURAÇÃO DE CORS
# ==========================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"], 
)

# ==========================================
# 🔐 O CADEADO (OAuth2)
# ==========================================
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

# ==========================================
# 🔌 SISTEMA DE WEBSOCKET (LIVE UPDATES)
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
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# ==========================================
# 📊 SCHEMAS DE DADOS (Mantendo os seus + Adições)
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
    loja_id: Optional[int] = None

class MetaAnualResponse(BaseModel):
    valor_meta: float
    valor_atual: float
    percentual: float

# ==========================================
# 🔍 FILTROS AUXILIARES (ATUALIZADO PARA MULTI-LOJA)
# ==========================================
def apply_filters(query, model, periodo: str, loja_id: Optional[int] = None):
    hoje = datetime.now().date()
    coluna_data = cast(model.data_hora, Date) if hasattr(model, 'data_hora') else cast(model.data, Date)
    
    # Filtro de Data
    if periodo == 'hoje':
        query = query.filter(coluna_data == hoje)
    elif periodo == 'mensal':
        query = query.filter(coluna_data >= (hoje - timedelta(days=30)))
    else: 
        query = query.filter(coluna_data >= (hoje - timedelta(days=7)))
    
    # Filtro de Loja (Requisito 3.3 do Guia)
    if loja_id:
        query = query.filter(model.loja_id == loja_id)
        
    return query

# ==========================================
# 🔑 AUTENTICAÇÃO
# ==========================================
@app.post("/api/auth/login")
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter(Usuario.email == form_data.username).first()
    if not usuario or not verificar_senha(form_data.password, usuario.senha_hash):
        raise HTTPException(status_code=401, detail="Credenciais incorretas")
    
    access_token = criar_token_acesso(data={"sub": usuario.email})
    return {"access_token": access_token, "token_type": "bearer", "nome": usuario.nome}

@app.post("/api/auth/registrar")
def registrar_usuario(usuario_data: dict, db: Session = Depends(get_db)):
    if db.query(Usuario).filter(Usuario.email == usuario_data.get("email")).first():
        raise HTTPException(status_code=400, detail="Email já cadastrado")
        
    novo_usuario = Usuario(
        nome=usuario_data.get("nome"),
        email=usuario_data.get("email"),
        senha_hash=obter_hash_senha(usuario_data.get("senha"))
    )
    db.add(novo_usuario)
    db.commit()
    return {"message": "Utilizador criado com sucesso!"}

# ==========================================
# 📦 OPERAÇÃO E DASHBOARD (AJUSTADO MULTI-LOJA)
# ==========================================

@app.get("/api/lojas")
def listar_lojas(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    return db.query(Loja).all()

@app.post("/api/pedidos/simular")
async def simular_pedido_random(loja_id: Optional[int] = None, db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    id_simulado = f"IFD-{random.randint(10000, 99999)}"
    bairros = ["Centro", "Jardins", "Pinheiros", "Itaim Bibi", "Vila Mariana", "Santana", "Bela Vista"]
    pagamentos = ["PIX", "CARTÃO DE CRÉDITO", "CARTÃO DE DÉBITO", "DINHEIRO"]
    
    # Se não houver lojas cadastradas, cria uma padrão para teste
    loja = db.query(Loja).first()
    if not loja:
        loja = Loja(nome="Loja Matriz", cnpj="00.000.000/0001-00", cidade="São Paulo")
        db.add(loja)
        db.commit()
        db.refresh(loja)

    novo_pedido = Pedido(
        id_pedido=id_simulado,
        loja_id=loja_id or loja.id,
        status="PENDENTE",
        valor_total=random.uniform(35.0, 180.0),
        taxa_entrega=random.uniform(5.0, 15.0),
        forma_pagamento=random.choice(pagamentos),
        bairro_destino=random.choice(bairros),
        data_hora=datetime.now()
    )
    db.add(novo_pedido)
    db.commit()
    
    await manager.broadcast({"action": "new_order", "id_pedido": id_simulado})
    return {"message": "Pedido simulado com sucesso", "id": id_simulado}

@app.put("/api/pedidos/{id_pedido}/status")
async def atualizar_status(id_pedido: str, status_data: StatusUpdate, db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    pedido = db.query(Pedido).filter(Pedido.id_pedido == id_pedido).first()
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")
    
    pedido.status = status_data.status
    db.commit()
    await manager.broadcast({"action": "update_status", "id_pedido": id_pedido, "status": status_data.status})
    return {"message": "Status atualizado"}

@app.get("/api/pedidos")
def listar_pedidos(loja_id: Optional[int] = None, periodo: str = Query("7dias"), db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    query = apply_filters(db.query(Pedido), Pedido, periodo, loja_id)
    return query.order_by(desc(Pedido.data_hora)).all()

# --- Rotas de Analytics (Ajustadas para o Escopo iFood) ---

@app.get("/api/dashboard/stats")
def get_dashboard_stats(loja_id: Optional[int] = None, periodo: str = Query("7dias"), db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    query = apply_filters(db.query(Pedido), Pedido, periodo, loja_id)
    total = query.count()
    faturamento = query.with_entities(func.sum(Pedido.valor_total)).scalar() or 0.0
    cancelados = query.filter(Pedido.status == "CANCELADO").count()
    
    return {
        "faturamento_total": round(faturamento, 2), 
        "total_pedidos": total, 
        "ticket_medio": round(faturamento / total, 2) if total > 0 else 0.0,
        "taxa_cancelamento": f"{round((cancelados/total*100), 1) if total > 0 else 0}%"
    }

@app.get("/api/dashboard/financeiro")
def get_saude_financeira(loja_id: Optional[int] = None, periodo: str = Query("7dias"), db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    query = apply_filters(db.query(Pedido).filter(Pedido.status == "CONCLUIDO"), Pedido, periodo, loja_id)
    faturamento = query.with_entities(func.sum(Pedido.valor_total)).scalar() or 0.0
    lucro = faturamento * 0.738 
    return {
        "bruto": round(faturamento, 2), 
        "lucro_liquido": round(lucro, 2), 
        "margem_percentual": f"{round((lucro/faturamento*100), 1) if faturamento > 0 else 0}%"
    }

@app.get("/api/dashboard/exportar")
def exportar_dados(loja_id: Optional[int] = None, periodo: str = Query("7dias"), db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    query = apply_filters(db.query(Pedido), Pedido, periodo, loja_id)
    pedidos = query.all()
    
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID_PEDIDO", "DATA", "STATUS", "VALOR", "PAGAMENTO", "BAIRRO"])
    
    for p in pedidos:
        writer.writerow([p.id_pedido, p.data_hora.strftime("%Y-%m-%d %H:%M"), p.status, p.valor_total, p.forma_pagamento, p.bairro_destino])
    
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=relatorio_ifood_{periodo}.csv"}
    )

# --- IA & Avaliações (Sua Lógica Original com Blindagem Regex) ---

@app.get("/api/avaliacoes")
def listar_avaliacoes(loja_id: Optional[int] = None, periodo: str = Query("7dias"), db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    query = apply_filters(db.query(Avaliacao), Avaliacao, periodo, loja_id)
    return query.order_by(desc(Avaliacao.data)).all()

@app.post("/api/avaliacoes")
def criar_avaliacao(dados: AvaliacaoCreate, db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    nova_av = Avaliacao(**dados.dict(), data=datetime.now())
    db.add(nova_av)
    db.commit()
    db.refresh(nova_av)
    return nova_av

@app.post("/api/feedbacks/analise")
def analisar_feedbacks_ia(request: FeedbackRequest, token: str = Depends(oauth2_scheme)):
    API_KEY = os.getenv("GEMINI_API_KEY")
    if not API_KEY:
        return [{"tipo": "AlertTriangle", "titulo": "Erro de Chave", "reclamacao": "API Key ausente.", "dica": "Configure o .env"}]

    try:
        prompt = f"Como Analista de Qualidade Sênior, avalie ESTES feedbacks: '{request.feedbacks}'. Retorne APENAS um array JSON válido."
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={API_KEY}"
        
        payload = {
            "contents": [{"parts": [{"text": prompt}]}], 
            "generationConfig": {"responseMimeType": "application/json", "temperature": 0.2}
        }
        
        resposta = requests.post(url, json=payload, timeout=15)
        if resposta.status_code != 200:
            return [{"tipo": "AlertTriangle", "titulo": "Erro API", "reclamacao": "Google API Offline", "dica": "Tente mais tarde"}]

        texto_ia = resposta.json()['candidates'][0]['content']['parts'][0]['text']
        
        # ✅ SUA BLINDAGEM POR REGEX MANTIDA
        match = re.search(r'\[.*\]', texto_ia, re.DOTALL)
        if match:
            return json.loads(match.group(0))
        return [{"tipo": "AlertTriangle", "titulo": "Erro IA", "reclamacao": "Formato inválido", "dica": "Repita a operação"}]
        
    except Exception as e:
        return [{"tipo": "AlertTriangle", "titulo": "Serviço Indisponível", "reclamacao": str(e), "dica": "Verifique o Backend"}]

# --- Rotas Adicionais de Gráficos (Ajustadas) ---
@app.get("/api/dashboard/vendas-diarias")
def get_vendas_diarias(loja_id: Optional[int] = None, periodo: str = Query("7dias"), db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    query = apply_filters(db.query(cast(Pedido.data_hora, Date).label("data"), func.sum(Pedido.valor_total).label("total")).filter(Pedido.status == "CONCLUIDO"), Pedido, periodo, loja_id)
    vendas = query.group_by("data").order_by("data").all()
    return [{"data": v.data.strftime("%d/%m"), "valor": float(v.total)} for v in vendas]

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)