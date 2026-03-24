import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Carrega as variáveis do arquivo .env
load_dotenv()

# Pega a URL do banco de dados
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

# Cria o "motor" que vai conectar com o PostgreSQL
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# Cria as sessões (as "conversas" individuais com o banco)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base para criar nossos modelos (tabelas) depois
Base = declarative_base()

# Função para injetar o banco de dados nas rotas
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()