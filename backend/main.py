import os
import json
import requests
import random
import re  # ✅ IMPORT DO REGEX ADICIONADO AQUI
from datetime import datetime, timedelta
from typing import List

# FastAPI, WebSockets e Segurança
from fastapi import FastAPI, Depends, Query, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer 
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

app = FastAPI(title="Ifood Dashboard API", version="3.2.0")

# ==========================================
# 🛡️ CONFIGURAÇÃO DE CORS (CORRIGIDO)
# ==========================================
# Removido os links "quebrados" da formatação markdown
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "https://ifood-dashboard-rework.vercel.app"], # Domínios seguros do Frontend
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
# 📊 SCHEMAS DE DADOS
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

class MetaAnualResponse(BaseModel):
    valor_meta: float
    valor_atual: float
    percentual: float

# ==========================================
# 🔍 FILTROS AUXILIARES
# ==========================================
def apply_date_filter(query, model, periodo: str):
    hoje = datetime.now().date()
    coluna_data = cast(model.data_hora, Date) if hasattr(model, 'data_hora') else cast(model.data, Date)
    
    if periodo == 'hoje':
        return query.filter(coluna_data == hoje)
    elif periodo == 'mensal':
        return query.filter(coluna_data >= (hoje - timedelta(days=30)))
    else: 
        return query.filter(coluna_data >= (hoje - timedelta(days=7)))

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
# 📦 OPERAÇÃO E DASHBOARD
# ==========================================

@app.post("/api/pedidos/simular")
async def simular_pedido_random(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    id_simulado = f"IFD-{random.randint(10000, 99999)}"
    bairros = ["Centro", "Jardins", "Pinheiros", "Itaim Bibi", "Vila Mariana", "Santana", "Bela Vista"]
    pagamentos = ["PIX", "CARTÃO DE CRÉDITO", "CARTÃO DE DÉBITO", "DINHEIRO"]
    
    novo_pedido = Pedido(
        id_pedido=id_simulado,
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
def listar_pedidos(periodo: str = Query("7dias"), db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    query = apply_date_filter(db.query(Pedido), Pedido, periodo)
    return query.order_by(desc(Pedido.data_hora)).all()

# --- Rotas de Analytics ---

@app.get("/api/dashboard/stats")
def get_dashboard_stats(periodo: str = Query("7dias"), db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    query = apply_date_filter(db.query(Pedido), Pedido, periodo)
    total = query.count()
    faturamento = query.with_entities(func.sum(Pedido.valor_total)).scalar() or 0.0
    return {
        "faturamento_total": round(faturamento, 2), 
        "total_pedidos": total, 
        "ticket_medio": round(faturamento / total, 2) if total > 0 else 0.0
    }

@app.get("/api/dashboard/financeiro")
def get_saude_financeira(periodo: str = Query("7dias"), db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    query = apply_date_filter(db.query(Pedido).filter(Pedido.status == "CONCLUIDO"), Pedido, periodo)
    faturamento = query.with_entities(func.sum(Pedido.valor_total)).scalar() or 0.0
    lucro = faturamento * 0.738 
    return {
        "bruto": round(faturamento, 2), 
        "lucro_liquido": round(lucro, 2), 
        "margem_percentual": f"{round((lucro/faturamento*100), 1) if faturamento > 0 else 0}%"
    }

@app.get("/api/dashboard/vendas-diarias")
def get_vendas_diarias(periodo: str = Query("7dias"), db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    query = apply_date_filter(db.query(cast(Pedido.data_hora, Date).label("data"), func.sum(Pedido.valor_total).label("total")).filter(Pedido.status == "CONCLUIDO"), Pedido, periodo)
    vendas = query.group_by("data").order_by("data").all()
    return [{"data": v.data.strftime("%d/%m"), "valor": float(v.total)} for v in vendas]

@app.get("/api/dashboard/top-produtos")
def get_top_produtos(periodo: str = Query("7dias"), db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    query = apply_date_filter(db.query(
        ItemPedido.nome_produto.label("nome"), 
        func.sum(ItemPedido.quantidade).label("qtd"), 
        func.sum(ItemPedido.quantidade * ItemPedido.preco_unitario).label("receita")
    ).join(Pedido), Pedido, periodo).filter(Pedido.status == "CONCLUIDO")
    
    return [{"nome": p.nome, "quantidade": p.qtd, "receita": round(p.receita, 2)} for p in query.group_by("nome").order_by(desc("qtd")).limit(5).all()]

@app.get("/api/dashboard/bairros")
def get_stats_bairros(periodo: str = Query("7dias"), db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    query = apply_date_filter(db.query(Pedido.bairro_destino, func.count(Pedido.id_pedido).label("total")), Pedido, periodo).filter(Pedido.status == "CONCLUIDO")
    return [{"bairro": r[0], "pedidos": r[1]} for r in query.group_by(Pedido.bairro_destino).order_by(desc("total")).all()]

@app.get("/api/dashboard/horarios")
def get_stats_horarios(periodo: str = Query("7dias"), db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    query = apply_date_filter(db.query(func.extract('hour', Pedido.data_hora).label("hora"), func.count(Pedido.id_pedido).label("total")), Pedido, periodo)
    return [{"hora": f"{int(r[0])}h", "pedidos": r[1]} for r in query.group_by("hora").order_by("hora").all()]

@app.get("/api/dashboard/pagamentos")
def get_stats_pagamentos(periodo: str = Query("7dias"), db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    query = apply_date_filter(db.query(Pedido.forma_pagamento, func.count(Pedido.id_pedido).label("total")), Pedido, periodo)
    return [{"tipo": r[0], "valor": r[1]} for r in query.group_by(Pedido.forma_pagamento).all()]

# --- Meta Anual ---
@app.get("/api/dashboard/meta", response_model=MetaAnualResponse)
def get_meta_anual(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    valor_meta = 250000.0 # Meta de R$ 250k
    resultado = db.query(func.sum(Pedido.valor_total)).filter(Pedido.status == "CONCLUIDO").scalar()
    faturamento_total = float(resultado) if resultado else 0.0
    percentual = round((faturamento_total / valor_meta) * 100, 1) if valor_meta > 0 else 0.0
    
    return {
        "valor_meta": valor_meta,
        "valor_atual": round(faturamento_total, 2),
        "percentual": percentual
    }

# --- IA & Avaliações ---

@app.get("/api/avaliacoes")
def listar_avaliacoes(periodo: str = Query("7dias"), db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    query = apply_date_filter(db.query(Avaliacao), Avaliacao, periodo)
    return query.order_by(desc(Avaliacao.data)).all()

@app.post("/api/avaliacoes")
def criar_avaliacao(dados: AvaliacaoCreate, db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    nova_av = Avaliacao(**dados.dict(), data=datetime.now())
    db.add(nova_av)
    db.commit()
    db.refresh(nova_av)
    return nova_av

# ✅ ROTA DE IA COM EXTRAÇÃO BLINDADA (REGEX)
@app.post("/api/feedbacks/analise")
def analisar_feedbacks_ia(request: FeedbackRequest, token: str = Depends(oauth2_scheme)):
    API_KEY = os.getenv("GEMINI_API_KEY")
    if not API_KEY:
        return [{"tipo": "AlertTriangle", "titulo": "Erro de Chave", "reclamacao": "API Key ausente no sistema.", "dica": "Configure a variável GEMINI_API_KEY no arquivo .env"}]

    try:
        # Prompt rigoroso para forçar o output exato
        prompt = f"""
        Como Analista de Qualidade Sênior, avalie ESTES EXATOS feedbacks de clientes de um restaurante: 
        "{request.feedbacks}"
        
        Você DEVE retornar APENAS um array JSON válido, sem NENHUM texto antes ou depois.
        O array deve conter 2 ou 3 insights no máximo.
        
        Formato JSON EXIGIDO e OBRIGATÓRIO:
        [
            {{
                "tipo": "AlertTriangle",
                "titulo": "Resumo curto (ex: Atrasos na Entrega)",
                "reclamacao": "A dor principal mencionada pelo cliente",
                "dica": "Sua sugestão analítica de resolução"
            }},
            {{
                "tipo": "TrendingDown",
                "titulo": "Outro resumo curto",
                "reclamacao": "Outra dor principal",
                "dica": "Outra sugestão analítica"
            }}
        ]
        """
        
        # URL corrigida sem os colchetes do markdown
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
            print(f"\n[ERRO GOOGLE API] Status: {resposta.status_code}")
            print(f"Detalhes: {resposta.text}\n")
            return [{"tipo": "AlertTriangle", "titulo": "Falha no Motor IA", "reclamacao": f"Código {resposta.status_code}", "dica": "A API do Google recusou a requisição."}]

        texto_ia = resposta.json()['candidates'][0]['content']['parts'][0]['text']
        
        # ✅ BLINDAGEM MÁXIMA: Puxa só o que for Array Json [ ... ] e ignora o resto
        match = re.search(r'\[.*\]', texto_ia, re.DOTALL)
        if match:
            texto_limpo = match.group(0)
            return json.loads(texto_limpo)
        else:
             print(f"\n[ALERTA IA] Resposta fora do formato: {texto_ia}\n")
             return [{"tipo": "AlertTriangle", "titulo": "Erro de Formatação", "reclamacao": "A IA não retornou um JSON válido.", "dica": "Tente gerar novamente."}]
        
    except json.JSONDecodeError as e:
        print(f"\n[ERRO DE CONVERSÃO JSON] {e}")
        return [{"tipo": "AlertTriangle", "titulo": "Erro de Conversão", "reclamacao": "A IA gerou um formato inválido.", "dica": "Tente gerar a análise novamente."}]
    except Exception as e:
        print(f"\n[ERRO CRÍTICO IA] {str(e)}\n")
        return [{"tipo": "AlertTriangle", "titulo": "Serviço Indisponível", "reclamacao": "Erro interno de comunicação.", "dica": "Verifique o terminal do Backend."}]

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)