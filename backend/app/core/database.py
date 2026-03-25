import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

# Força o carregamento das variáveis do arquivo .env
load_dotenv()

# Pega a URL do banco de dados
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

# --- TRAVA DE SEGURANÇA ---
# Impede o erro genérico do SQLAlchemy e te avisa exatamente o que faltou
if SQLALCHEMY_DATABASE_URL is None:
    raise ValueError(
        "🚨 ERRO CRÍTICO: A variável DATABASE_URL não foi encontrada!\n"
        "Verifique se o arquivo '.env' foi criado corretamente dentro da pasta 'backend'."
    )

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