from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

class ItemPedidoSchema(BaseModel):
    nome_produto: str
    quantidade: int
    preco_unitario: float
    custo_producao: Optional[float] = 0.0  # Necessário para o gráfico de Lucro Líquido

    class Config:
        from_attributes = True

class PedidoSchema(BaseModel):
    id_pedido: str
    status: str
    valor_total: float
    taxa_entrega: Optional[float] = 0.0
    forma_pagamento: str
    bairro_destino: str = "Não Informado"
    data_hora: Optional[datetime] = None   # Necessário para o filtro "Hoje" / "Ontem"
    itens: List[ItemPedidoSchema]

    class Config:
        from_attributes = True