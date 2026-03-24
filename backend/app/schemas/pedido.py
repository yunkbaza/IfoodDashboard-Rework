from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

class ItemPedidoSchema(BaseModel):
    nome_produto: str
    quantidade: int
    preco_unitario: float

    class Config:
        from_attributes = True

class PedidoSchema(BaseModel):
    id_pedido: str
    status: str
    valor_total: float
    taxa_entrega: Optional[float] = 0.0
    forma_pagamento: str
    bairro_destino: str = "Não Informado"
    itens: List[ItemPedidoSchema]

    class Config:
        from_attributes = True