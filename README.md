-----

# 🍎 iFood Dashboard Pro

> **Status do Projeto:** 🚀 Em produção / Versão 2.0 (Gemini 2.5 Active)

Um ecossistema completo de gestão para restaurantes, combinando uma interface administrativa de alta performance com **Inteligência Artificial Generativa** para análise de sentimentos e insights de negócio em tempo real.

-----

## 📑 Índice

  * [Recursos Principais](https://www.google.com/search?q=%23-recursos-principais)
  * [Tecnologias](https://www.google.com/search?q=%23-tecnologias)
  * [Arquitetura de IA](https://www.google.com/search?q=%23-arquitetura-de-ia)
  * [Instalação e Configuração](https://www.google.com/search?q=%23-instala%C3%A7%C3%A3o-e-configura%C3%A7%C3%A3o)
  * [Variáveis de Ambiente](https://www.google.com/search?q=%23-vari%C3%A1veis-de-ambiente)
  * [Estrutura do Projeto](https://www.google.com/search?q=%23-estrutura-do-projeto)

-----

## ✨ Recursos Principais

### 📊 Painel Financeiro Inteligente

  * Monitorização de faturamento bruto, lucro líquido e ticket médio.
  * Filtros dinâmicos por período (Hoje, 7 Dias, Mensal).
  * Gráficos interativos de evolução de vendas e top produtos com **Recharts**.
  * Visualização de metas anuais com progresso em tempo real.

### 🤖 Assistente Virtual (IA)

  * **Análise de Sentimentos:** Processamento automático de avaliações de clientes utilizando o modelo **Google Gemini 2.5 Flash**.
  * **Consultoria Estratégica:** Identificação automática de falhas operacionais (ex: temperatura de comida, atrasos) e sugestão de soluções práticas.

### 🍳 Tela da Cozinha (Operacional)

  * Sistema de **Kanban Board** com Drag and Drop (`@dnd-kit`).
  * Gestão de status de pedidos: *Pendente*, *Em Preparo* e *Pronto*.
  * Atualização imediata de status no banco de dados PostgreSQL.

### 🌓 UX/UI Premium

  * Interface customizável com Dark Mode nativo.
  * Design responsivo e focado em usabilidade para ambientes de alta pressão (cozinha).

-----

## 🛠 Tecnologias

### **Frontend**

  * **Framework:** Next.js 16.2 (Turbopack)
  * **UI:** React 19 + Tailwind CSS v4
  * **Ícones:** Lucide React
  * **Gráficos:** Recharts
  * **Drag & Drop:** @dnd-kit

### **Backend**

  * **Linguagem:** Python 3.9+
  * **Framework:** FastAPI
  * **ORM:** SQLAlchemy
  * **Banco de Dados:** PostgreSQL
  * **Autenticação:** JWT (JSON Web Tokens)

-----

## 🧠 Arquitetura de IA

Diferente de implementações padrão, este projeto utiliza uma **Conexão Direta (Bypass)** com a API do Google Generative AI via `requests`.

  * **Modelo:** `gemini-2.5-flash`
  * **Segurança:** Sistema de *Fail-Safe* integrado no backend que garante que o dashboard nunca quebre caso a API da Google esteja instável, fornecendo respostas de fallback estruturadas.
  * **Strucutred Output:** Forçamos o `responseMimeType: "application/json"` para garantir integridade total dos dados consumidos pelo React.

-----

## 🚀 Instalação e Configuração

### **1. Backend**

```bash
# Entre na pasta
cd backend

# Crie e ative o ambiente virtual
python3 -m venv venv
source venv/bin/activate  # Mac/Linux

# Instale as dependências
pip install fastapi uvicorn sqlalchemy requests pydantic python-dotenv

# Inicie o servidor
python3 main.py
```

### **2. Frontend**

```bash
# Entre na pasta
cd frontend

# Instale os pacotes
npm install

# Inicie o ambiente de desenvolvimento
npm run dev
```

-----

## 🔑 Variáveis de Ambiente

Crie um arquivo `.env` na raiz da pasta `backend`:

```env
DATABASE_URL=postgresql://user:pass@localhost:5432/ifood_db
SECRET_KEY=sua_chave_secreta_jwt
GEMINI_API_KEY=sua_chave_do_google_ai_studio
```

-----

## 📂 Estrutura do Projeto

```text
├── backend
│   ├── app
│   │   ├── core        # Configurações de Auth e Banco
│   │   ├── models      # Modelos SQLAlchemy (PostgreSQL)
│   │   └── schemas     # Schemas Pydantic
│   └── main.py         # Entrypoint e Rotas da API e IA
├── frontend
│   ├── app             # Páginas Next.js (Login, Dashboard)
│   ├── components      # Componentes React (Gráficos, Kanban, IA)
│   └── services        # Integração com Axios/Fetch
```

-----

## 👤 Autor

**Allan Gabriel Baeza Amirati Silva** *Analista de Projetos Jr @ Claro | Desenvolvedor Fullstack*

-----
