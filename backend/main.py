import os
import json
import requests
import random
import re
import csv
import io
from datetime import datetime, timedelta
from typing import List, Optional, Generator

# FastAPI, WebSockets e Segurança
from fastapi import FastAPI, Depends, Query, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer 
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import func, cast, Date, desc, extract 
from pydantic import BaseModel
import uvicorn
from dotenv import load_dotenv

# Importações do projeto
from app.core.database import get_db, engine
from app.models.pedido import Pedido, ItemPedido, Usuario, Avaliacao, Base, Loja
from app.schemas.pedido import PedidoSchema
from app.core.auth import verificar_senha, obter_hash_senha, criar_token_acesso

# ==========================================
# 🚀 INICIALIZAÇÃO E CONFIGURAÇÃO
# ==========================================
# O override=True garante que a chave nova do .env seja lida ignorando o cache
load_dotenv(override=True)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="iFood Dashboard API - Enterprise Edition", 
    version="4.0.0",
    description="Backend otimizado com Streaming de Dados e Auditoria IA."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"], 
)

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
        for connection in list(self.active_connections):
            try:
                await connection.send_json(message)
            except Exception:
                self.disconnect(connection)

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
# 📊 SCHEMAS DE DADOS (PYDANTIC)
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
# 🔍 MOTOR DE FILTROS DINÂMICOS
# ==========================================
def apply_filters(query, model, periodo: str, loja_id: Optional[int] = None):
    hoje = datetime.now().date()
    coluna_data = cast(model.data_hora, Date) if hasattr(model, 'data_hora') else cast(model.data, Date)
    
    if periodo == 'hoje':
        query = query.filter(coluna_data == hoje)
    elif periodo == 'mensal':
        query = query.filter(coluna_data >= (hoje - timedelta(days=30)))
    else: 
        query = query.filter(coluna_data >= (hoje - timedelta(days=7)))
    
    if loja_id:
        query = query.filter(model.loja_id == loja_id)
        
    return query

# ==========================================
# 🔑 MÓDULO DE AUTENTICAÇÃO
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
# 📦 OPERAÇÃO E GESTÃO DE LOJAS
# ==========================================
@app.get("/api/lojas")
def listar_lojas(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    return db.query(Loja).all()

@app.post("/api/pedidos/simular")
async def simular_pedido_random(loja_id: Optional[int] = None, db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    loja = db.query(Loja).first()
    if not loja:
        loja = Loja(nome="Loja Matriz", cnpj="00.000.000/0001-00", cidade="São Paulo")
        db.add(loja)
        db.commit()
        db.refresh(loja)

    id_simulado = f"IFD-{random.randint(10000, 99999)}"
    novo_pedido = Pedido(
        id_pedido=id_simulado,
        loja_id=loja_id or loja.id,
        status="PENDENTE",
        valor_total=random.uniform(35.0, 180.0),
        taxa_entrega=random.uniform(5.0, 15.0),
        forma_pagamento=random.choice(["PIX", "CARTÃO DE CRÉDITO", "CARTÃO DE DÉBITO", "DINHEIRO"]),
        bairro_destino=random.choice(["Centro", "Jardins", "Pinheiros", "Itaim Bibi", "Vila Mariana", "Santana"]),
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

# ==========================================
# 📈 MÓDULO DE ANALYTICS (KPIs)
# ==========================================
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

@app.get("/api/dashboard/vendas-diarias")
def get_vendas_diarias(loja_id: Optional[int] = None, periodo: str = Query("7dias"), db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    query = apply_filters(db.query(cast(Pedido.data_hora, Date).label("data"), func.sum(Pedido.valor_total).label("total")).filter(Pedido.status == "CONCLUIDO"), Pedido, periodo, loja_id)
    vendas = query.group_by("data").order_by("data").all()
    return [{"data": v.data.strftime("%d/%m"), "valor": float(v.total)} for v in vendas]

@app.get("/api/dashboard/top-produtos")
def get_top_produtos(loja_id: Optional[int] = None, periodo: str = Query("7dias"), db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    # ✅ CORREÇÃO: Adicionámos o cálculo da receita multiplicando quantidade pelo preço
    query = db.query(
        ItemPedido.nome_produto.label("nome"), 
        func.sum(ItemPedido.quantidade).label("quantidade"),
        func.sum(ItemPedido.quantidade * ItemPedido.preco_unitario).label("receita")
    ).join(Pedido, Pedido.id_pedido == ItemPedido.id_pedido)
    
    query = apply_filters(query, Pedido, periodo, loja_id).filter(Pedido.status == "CONCLUIDO")
    resultados = query.group_by(ItemPedido.nome_produto).order_by(desc("quantidade")).limit(5).all()
    
    # ✅ Retorna também a receita calculada
    return [
        {
            "nome": r.nome, 
            "quantidade": int(r.quantidade), 
            "receita": float(r.receita or 0)
        } 
        for r in resultados
    ]

@app.get("/api/dashboard/bairros")
def get_stats_bairros(loja_id: Optional[int] = None, periodo: str = Query("7dias"), db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    query = db.query(Pedido.bairro_destino.label("bairro"), func.count(Pedido.id_pedido).label("quantidade"))
    query = apply_filters(query, Pedido, periodo, loja_id).filter(Pedido.status == "CONCLUIDO")
    resultados = query.group_by(Pedido.bairro_destino).order_by(desc("quantidade")).limit(6).all()
    return [{"nome": r.bairro, "valor": int(r.quantidade)} for r in resultados]

@app.get("/api/dashboard/horarios")
def get_stats_horarios(loja_id: Optional[int] = None, periodo: str = Query("7dias"), db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    query = db.query(extract('hour', Pedido.data_hora).label("hora"), func.count(Pedido.id_pedido).label("quantidade"))
    resultados = apply_filters(query, Pedido, periodo, loja_id).group_by("hora").order_by("hora").all()
    return [{"hora": f"{int(r.hora)}h", "pedidos": int(r.quantidade)} for r in resultados]

@app.get("/api/dashboard/pagamentos")
def get_stats_pagamentos(loja_id: Optional[int] = None, periodo: str = Query("7dias"), db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    query = db.query(Pedido.forma_pagamento.label("pagamento"), func.count(Pedido.id_pedido).label("quantidade"))
    resultados = apply_filters(query, Pedido, periodo, loja_id).filter(Pedido.status == "CONCLUIDO").group_by(Pedido.forma_pagamento).order_by(desc("quantidade")).all()
    return [{"nome": r.pagamento, "valor": int(r.quantidade)} for r in resultados]

@app.get("/api/dashboard/meta-anual", response_model=MetaAnualResponse)
def get_meta_anual(loja_id: Optional[int] = None, db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    faturamento = apply_filters(db.query(func.sum(Pedido.valor_total)).filter(Pedido.status == "CONCLUIDO", extract('year', Pedido.data_hora) == datetime.now().year), Pedido, 'mensal', loja_id).scalar() or 0.0
    meta = 150000.0 if loja_id else 500000.0
    percentual = min(round((faturamento / meta) * 100, 1), 100.0) if meta > 0 else 0
    return {"valor_meta": meta, "valor_atual": round(faturamento, 2), "percentual": percentual}

# ==========================================
# 📄 MÓDULO DE EXPORTAÇÃO (STREAMING DE DADOS)
# ==========================================
def gerador_csv_pedidos(pedidos: Generator) -> Generator[str, None, None]:
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID_PEDIDO", "DATA", "STATUS", "VALOR", "PAGAMENTO", "BAIRRO"])
    yield output.getvalue()
    output.seek(0)
    output.truncate(0)

    for p in pedidos:
        writer.writerow([p.id_pedido, p.data_hora.strftime("%Y-%m-%d %H:%M"), p.status, p.valor_total, p.forma_pagamento, p.bairro_destino])
        yield output.getvalue()
        output.seek(0)
        output.truncate(0)

@app.get("/api/dashboard/exportar")
def exportar_dados(loja_id: Optional[int] = None, periodo: str = Query("7dias"), db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    query = apply_filters(db.query(Pedido), Pedido, periodo, loja_id)
    # yield_per evita que o servidor carregue milhares de linhas na RAM de uma vez (Anti-Crash)
    pedidos_generator = query.yield_per(100) 
    
    return StreamingResponse(
        gerador_csv_pedidos(pedidos_generator),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=relatorio_ifood_{periodo}.csv"}
    )

# ==========================================
# 🧠 MÓDULO DE IA E AVALIAÇÕES (GEMINI 2.5)
# ==========================================
@app.get("/api/avaliacoes")
def listar_avaliacoes(loja_id: Optional[int] = None, periodo: str = Query("7dias"), db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    return apply_filters(db.query(Avaliacao), Avaliacao, periodo, loja_id).order_by(desc(Avaliacao.data)).all()

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
        return [{"tipo": "AlertTriangle", "titulo": "Erro", "reclamacao": "API Key ausente.", "dica": "Configure o .env"}]

    # Debug de segurança no terminal
    print(f"\n---> CHAVE LIDA: {str(API_KEY)[:10]}...{str(API_KEY)[-5:]} <---\n")

    try:
        # Prompt blindado para garantir o JSON correto
        prompt = f"""
        Como Analista de Qualidade Sênior, avalie os seguintes feedbacks de clientes: {request.feedbacks}. 
        Retorne APENAS um array JSON válido. É OBRIGATÓRIO que cada objeto do array tenha EXATAMENTE estas 4 chaves:
        - "tipo": use "TrendingDown" para quedas ou "AlertTriangle" para alertas.
        - "titulo": um título muito curto do problema.
        - "reclamacao": o contexto ou resumo do problema relatado.
        - "dica": a sua recomendação prática e direta de ação.
        NÃO retorne texto ou markdown fora do JSON.
        """
        
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={API_KEY}"
        payload = {
            "contents": [{"parts": [{"text": prompt}]}], 
            "generationConfig": {"responseMimeType": "application/json", "temperature": 0.2}
        }
        
        # Timeout aumentado para 45s para evitar erros em grandes análises
        resposta = requests.post(url, json=payload, timeout=45)
        if resposta.status_code != 200:
            print(f"ERRO GOOGLE API: {resposta.status_code} - {resposta.text}") 
            return [{"tipo": "AlertTriangle", "titulo": "Erro API", "reclamacao": "Google API Offline", "dica": "Tente mais tarde"}]

        texto_ia = resposta.json()['candidates'][0]['content']['parts'][0]['text']
        
        # Extração segura do JSON via regex
        match = re.search(r'\[.*\]', texto_ia, re.DOTALL)
        if match:
            return json.loads(match.group(0))
        return [{"tipo": "AlertTriangle", "titulo": "Erro IA", "reclamacao": "Formato inválido.", "dica": "Repita a operação"}]
        
    except Exception as e:
        return [{"tipo": "AlertTriangle", "titulo": "Erro Crítico", "reclamacao": str(e), "dica": "Verifique o servidor"}]

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)