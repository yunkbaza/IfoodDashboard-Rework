# 🍔 iFood Dashboard Pro | Enterprise Delivery SaaS

<img width="1440" height="898" alt="Captura de Tela 2026-03-31 às 15 42 21" src="https://github.com/user-attachments/assets/7e08f915-1cb5-45a3-ac7e-b972ec229b7c" />

> **Plataforma de Gestão Multi-Loja, Inteligência Operacional e Análise de Sentimento com IA para Delivery.**

## 📑 Índice

1.  [Visão Executiva (Business Value)](https://www.google.com/search?q=%23-1-vis%C3%A3o-executiva-business-value)
2.  [Arquitetura do Sistema](https://www.google.com/search?q=%23-2-arquitetura-do-sistema)
3.  [Módulos Principais](https://www.google.com/search?q=%23-3-m%C3%B3dulos-principais)
4.  [Stack Tecnológica](https://www.google.com/search?q=%23-4-stack-tecnol%C3%B3gica)
5.  [Infraestrutura e CI/CD](https://www.google.com/search?q=%23-5-infraestrutura-e-cicd)
6.  [Instruções de Execução (Deploy Local)](https://www.google.com/search?q=%23-6-instru%C3%A7%C3%B5es-de-execu%C3%A7%C3%A3o)

-----

## 💼 1. Visão Executiva (Business Value)

O **iFood Dashboard Pro** é um Software as a Service (SaaS) B2B projetado para resolver a dor da fragmentação de dados em operações de delivery de médio a grande porte.

Ao invés de depender de relatórios estáticos, a plataforma centraliza múltiplas lojas (CNPJs) em um único painel em tempo real, integrando **Inteligência Artificial** para interpretar o sentimento do cliente e **WebSockets** para gestão do fluxo operacional da cozinha.

### Diferenciais Competitivos:

  * **Escalabilidade Multi-Loja:** Visão consolidada de rede ou detalhamento por unidade.
  * **Redução de Atrito Operacional:** O Kanban em tempo real substitui a confusão dos tickets de papel.
  * **Economia de Tempo Analítico:** A IA lê, interpreta e propõe soluções para centenas de avaliações em segundos.
  * **Internacionalização (i18n):** Sistema preparado nativamente para expansão global (PT-BR / EN-US).

-----

## 🏛️ 2. Arquitetura do Sistema

O sistema segue uma arquitetura baseada em microsserviços totalmente desacoplada, garantindo alta disponibilidade e manutenção modular.

  * **Frontend (Apresentação):** Renderização Híbrida (SSR + CSR) garantindo SEO para a Landing Page e interatividade ultrarrápida no Dashboard.
  * **Backend (Lógica de Negócios):** API RESTful assíncrona, suportando alta concorrência para processamento massivo de pedidos.
  * **Comunicação Real-Time:** Estabelecida via WebSockets bidirecionais (cozinha ↔ servidor).
  * **Banco de Dados:** Estrutura relacional normalizada utilizando ORM, prevenindo injeções de SQL e garantindo integridade transacional.

-----

## 🧩 3. Módulos Principais

### A. Dashboard de Inteligência de Negócios (BI)

Painel central configurável focado em KPIs financeiros e logísticos.

  * **Alertas Inteligentes:** Cards mudam dinamicamente de estado visual (glow vermelho) se a taxa de cancelamento ultrapassar limites toleráveis ou margens caírem.
  * **Gráficos Dinâmicos (Recharts):**
      * *Evolução de Vendas:* Acompanhamento diário de faturamento bruto vs. lucro líquido.
      * *Campeões de Vendas (Curva ABC):* Top produtos com cruzamento de volume e receita gerada.
      * *Heatmap Logístico:* Volume de pedidos segmentado por bairro/região.
      * *Métricas de Pico:* Análise de carga de trabalho por faixas de horário.
      * *Distribuição Financeira:* Receita segmentada por método de pagamento (Pix, Crédito, etc.).
   
    <img width="1440" height="900" alt="Captura de Tela 2026-03-31 às 15 55 13" src="https://github.com/user-attachments/assets/995e6d24-6c64-4fe6-ab4e-96ea44240473" />


### B. Módulo de Operação (Kanban Real-Time)

Gestão do fluxo da cozinha projetada para redução de stress cognitivo.

  * Integração WebSockets: Novos pedidos surgem instantaneamente sem necessidade de atualizar a página (F5).
  * Drag-and-Drop: Transição fluida de pedidos entre "Pendentes" ➔ "Em Preparo" ➔ "Concluídos".

### C. Módulo de Voz do Cliente (IA Gemini)

O diferencial tecnológico da plataforma.

  * Em vez de exibir apenas estrelas, a aplicação consome a API do Google Gemini para varrer o banco de dados de avaliações.
  * **Saída da IA:** Gera um relatório de "Contexto" (ex: "Atrasos recorrentes aos sábados") e "Recomendação" acionável (ex: "Alocar mais um motoboy entre as 19h e 21h").

### D. Exportação e Configuração

  * Exportação de relatórios contextuais em tela.
  * Sistema de metas anuais configurável.
  * Layout elástico: o utilizador pode redimensionar e reordenar a prioridade dos gráficos na tela.

-----

## 🛠️ 4. Stack Tecnológica

### Frontend (App Web)

| Tecnologia | Propósito |
| :--- | :--- |
| **Next.js 14/15** | Framework React (App Router) para roteamento, SSR e performance. |
| **Tailwind CSS** | Design system utilitário, suportando Dark/Light mode nativo. |
| **Recharts** | Biblioteca de renderização vetorial de gráficos de alta performance. |
| **Lucide React** | Padronização iconográfica. |
| **Playwright** | Testes End-to-End (E2E) simulando comportamento de usuário real. |

### Backend (API REST)

| Tecnologia | Propósito |
| :--- | :--- |
| **Python 3.11+** | Linguagem robusta e padrão da indústria para análise de dados e IA. |
| **FastAPI** | Framework assíncrono extremamente rápido para criação de APIs genéricas e WebSockets. |
| **SQLAlchemy** | Mapeamento Objeto-Relacional (ORM) para modelagem do banco. |
| **Google Generative AI** | LLM (Gemini 1.5) para processamento de linguagem natural nos feedbacks. |
| **Pytest** | Testes unitários para validar a lógica de rotas e segurança. |

-----

## ⚙️ 5. Infraestrutura e CI/CD

O projeto adota práticas avançadas de DevOps para garantir estabilidade contínua.

  * **Containerização:** Uso de `Docker` e `Docker Compose` isolando ambientes de Dev/Prod.
  * **Integração Contínua (CI):** Pipeline configurada via `.github/workflows/ci.yml`. A cada novo *Push*, o GitHub Actions automaticamente:
    1.  Constrói o ambiente.
    2.  Roda a suíte de testes (Pytest).
    3.  Bloqueia deploys defeituosos.
  * **Deploy Cloud-Native:** Frontend hospedado em borda global (Vercel/Netlify) e Backend em contêineres gerenciados (Render/Railway).

-----

## 🚀 6. Instruções de Execução

Qualquer engenheiro ou auditor pode subir o projeto localmente com as instruções abaixo.

### Pré-requisitos

  * Node.js (v18+)
  * Python (3.11+)
  * Docker (Opcional, mas recomendado)

### Subindo via Docker (Método Rápido)

Na raiz do projeto, execute:

```bash
docker-compose up --build
```

*A API estará disponível na porta `8000` e o Frontend na porta `3000`.*

### Subindo Manualmente (Modo Desenvolvimento)

**1. Backend (FastAPI):**

```bash
cd backend
python -m venv venv
source venv/bin/activate  # (No Windows: venv\Scripts\activate)
pip install -r requirements.txt
uvicorn main:app --reload
```

*(Para gerar dados de teste iniciais, rode `python seed_db.py`)*

**2. Frontend (Next.js):**

```bash
cd frontend
npm install
npm run dev
```

Abra `http://localhost:3000` no seu navegador para acessar a Landing Page e o Dashboard.
