from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import List, Optional

# --- SCHEMAS DE LOJA (Essencial para Multi-loja) ---
class LojaBase(BaseModel):
    nome: str
    cnpj: Optional[str] = None
    cidade: Optional[str] = None

class LojaResponse(LojaBase):
    id: int
    class Config:
        from_attributes = True

# --- SCHEMAS DE ITENS ---
class ItemPedidoSchema(BaseModel):
    nome_produto: str
    quantidade: int
    preco_unitario: float
    custo_producao: Optional[float] = 0.0

    class Config:
        from_attributes = True

# --- SCHEMAS DE PEDIDO (Atualizado com Loja e Tempo) ---
class PedidoSchema(BaseModel):
    id_pedido: str
    loja_id: Optional[int] = None  # Vinculação com a unidade
    status: str
    valor_total: float
    taxa_entrega: Optional[float] = 0.0
    forma_pagamento: str
    bairro_destino: str = "Não Informado"
    data_hora: Optional[datetime] = None
    data_entrega: Optional[datetime] = None  # Necessário para calcular o KPI de tempo
    itens: List[ItemPedidoSchema]

    class Config:
        from_attributes = True

# --- SCHEMAS DE USUÁRIO (Corrigido) ---
class UsuarioCreate(BaseModel):
    nome: str
    email: EmailStr
    senha: str

class UsuarioResponse(BaseModel):
    id: int
    nome: str
    email: str

    class Config:
        from_attributes = True

# --- SCHEMAS DE AVALIAÇÃO (Vinculado à Loja) ---
class AvaliacaoBase(BaseModel):
    cliente: str
    nota: int
    texto: str
    sentimento: Optional[str] = None

class AvaliacaoCreate(AvaliacaoBase):
    loja_id: int

class AvaliacaoResponse(AvaliacaoBase):
    id: int
    loja_id: int
    data: datetime

    class Config:
        from_attributes = True

# --- SCHEMAS DE DASHBOARD / RELATÓRIOS ---
class DashboardStats(BaseModel):
    faturamento_total: float
    total_pedidos: int
    ticket_medio: float
    taxa_cancelamento: str  # Ex: "5.2%"