# 🚀 Dashboard iFood Analytics

<img width="1904" height="952" alt="image" src="https://github.com/user-attachments/assets/2bd69506-9b50-4e55-975d-e04419a77ebb" />


**Dashboard Pro** é uma plataforma SaaS full-stack de alta performance desenvolvida para proporcionar controle total e insights inteligentes sobre operações de delivery (focada no ecossistema iFood). O sistema utiliza Inteligência Artificial generativa para transformar feedbacks brutos de clientes em decisões estratégicas de negócio.

-----

## 🛠️ Stack Tecnológica

### **Frontend (Core & UI)**

  * **Next.js 15+ & React:** Estrutura SSR/SSG para performance otimizada.
  * **Tailwind CSS v4:** Estilização moderna e responsiva com suporte nativo a Dark Mode.
  * **Lucide React:** Iconografia consistente.
  * **Recharts:** Visualização de dados analíticos através de gráficos interativos.

### **Backend (API & Logic)**

  * **FastAPI (Python):** Backend assíncrono de alta velocidade.
  * **WebSockets:** Atualizações de pedidos em tempo real (Live Updates).
  * **SQLAlchemy:** ORM para manipulação robusta de dados.
  * **Google Gemini AI (2.5 Flash):** Motor de IA para análise de sentimentos e geração de insights de feedbacks.

### **Infraestrutura & DevOps**

  * **Docker & Docker Compose:** Conteinerização completa da aplicação (Frontend, Backend, DB).
  * **GitHub Actions:** Pipeline de Integração Contínua (CI) para validação automática de código.
  * **PostgreSQL:** Banco de dados relacional para persistência de dados críticos.
  * **Cloud Hosting:** Deploy estratégico utilizando Vercel (Frontend), Render (Backend) e Neon.tech (DB).

-----

## 🌟 Funcionalidades Principais

  * **📊 Dashboard Executivo:** Métricas de faturamento, ticket médio e volume de vendas em tempo real.
  * **🤖 Assistente iFood (IA):** Análise automática de avaliações de clientes utilizando o modelo Gemini, sugerindo melhorias operacionais.
  * **📋 Kanban de Pedidos:** Gerenciamento visual do fluxo de pedidos via WebSockets.
  * **📈 Análise Geográfica & Temporal:** Gráficos detalhados sobre bairros com maior demanda e horários de pico.
  * **🔐 Autenticação Robusta:** Sistema de login seguro utilizando OAuth2 e JWT.

-----

## 🐳 Execução via Docker (Local)

Para rodar o projeto completo (Frontend, Backend e Banco) com apenas um comando:

```bash
# 1. Clone o repositório
git clone https://github.com/yunkbaza/IfoodDashboard-Rework

# 2. Configure suas chaves no .env na raiz
GEMINI_API_KEY=sua_chave_aqui

# 3. Suba a orquestração
docker-compose up --build
```

Acesse:

  * Frontend: `http://localhost:3000`
  * Backend (Docs): `http://localhost:8000/docs`

  * Login: allan@dashboard.com
  * Senha: admin123

-----

## 📁 Estrutura do Projeto

```text
.
├── frontend/          # Aplicação Next.js (Interface)
├── backend/           # API FastAPI (Negócio e IA)
├── .github/workflows/ # Automação de CI/CD
├── docker-compose.yml # Orquestração de contêineres
└── k8s/               # (Opcional) Manifestos de Kubernetes para escala Enterprise
```

-----

## 👨‍💻 Autor

**Allan Gabriel Baeza Amirati Silva**

  * *Analista de Projetos Jr @ Claro*
  * *Graduado em Análise e Desenvolvimento de Sistemas (FIAP)*
