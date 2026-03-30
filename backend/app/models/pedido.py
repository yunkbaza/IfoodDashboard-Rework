from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Integer
from sqlalchemy.orm import relationship
from app.core.database import Base
from datetime import datetime

class Loja(Base):
    __tablename__ = "lojas"
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, nullable=False)
    cnpj = Column(String, unique=True, index=True)
    cidade = Column(String)
    
    pedidos = relationship("Pedido", back_populates="loja")
    avaliacoes = relationship("Avaliacao", back_populates="loja")

class Pedido(Base):
    __tablename__ = "pedidos"

    id_pedido = Column(String, primary_key=True, index=True)
    loja_id = Column(Integer, ForeignKey("lojas.id"), nullable=True) # Elo para Multi-loja
    data_hora = Column(DateTime, default=datetime.utcnow)
    data_entrega = Column(DateTime, nullable=True) # Para cálculo de tempo de entrega (Item 3.3)
    status = Column(String) 
    valor_total = Column(Float)
    taxa_entrega = Column(Float, default=0.0)
    forma_pagamento = Column(String)
    bairro_destino = Column(String, default="Não Informado") 
    
    loja = relationship("Loja", back_populates="pedidos")
    itens = relationship("ItemPedido", back_populates="pedido")

class ItemPedido(Base):
    __tablename__ = "itens_pedido"
    id = Column(Integer, primary_key=True, index=True)
    id_pedido = Column(String, ForeignKey("pedidos.id_pedido"))
    nome_produto = Column(String)
    quantidade = Column(Integer)
    preco_unitario = Column(Float)
    custo_producao = Column(Float, default=0.0)
    pedido = relationship("Pedido", back_populates="itens")

class Usuario(Base):
    __tablename__ = "usuarios"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    senha_hash = Column(String, nullable=False)
    nome = Column(String, nullable=False)

class Avaliacao(Base):
    __tablename__ = "avaliacoes"
    id = Column(Integer, primary_key=True, index=True)
    loja_id = Column(Integer, ForeignKey("lojas.id"), nullable=True) # Elo para Multi-loja
    cliente = Column(String, nullable=False)
    nota = Column(Integer, nullable=False)
    texto = Column(String, nullable=False)
    data = Column(DateTime, default=datetime.utcnow)
    sentimento = Column(String) 

    loja = relationship("Loja", back_populates="avaliacoes")