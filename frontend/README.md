# 🍎 iFood Dashboard Pro | Business Intelligence System

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)
![FastAPI](https://img.shields.io/badge/FastAPI-v0.100+-05998b?style=for-the-badge&logo=fastapi)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_v4-38B2AC?style=for-the-badge&logo=tailwind-css)

O **iFood Dashboard Pro** é uma solução avançada de BI (Business Intelligence) desenvolvida para transformar dados brutos de delivery em decisões estratégicas. O sistema oferece uma visão 360º da performance financeira, logística e operacional de lojas dentro da plataforma iFood.

---

## 🚀 Diferenciais do Projeto

Diferente de dashboards genéricos, esta aplicação foi construída com foco em **modularidade** e **experiência do usuário (UX)**:

* **Painel Customizável:** O usuário tem total controle sobre o que prioriza. Através do menu "Personalizar", é possível ativar ou desativar widgets em tempo real com ajustes automáticos de layout.
* **Inteligência Geográfica:** Análise detalhada de pedidos por bairro/região para otimização de logística e marketing local.
* **Gestão de Cozinha:** Gráficos de horários de pico para auxiliar no planejamento de escala de funcionários e tempo de preparo.
* **Engenharia de Menu:** Ranking dinâmico dos produtos mais vendidos e faturamento por item.
* **Fluxo de Caixa:** Visão clara dos métodos de pagamento (PIX, Cartão, Dinheiro) e impacto das taxas oficiais iFood.

---

## 🛠️ Stack Tecnológica

### Frontend
- **Framework:** Next.js 16.2 (utilizando as mais novas convenções de APIs)
- **Biblioteca Base:** React 19 (Hooks modernos e performance otimizada)
- **Estilização:** Tailwind CSS v4
- **Gráficos:** Recharts (Data Visualization customizada)
- **Icons:** Lucide-React

### Backend
- **API:** FastAPI (Python 3.9+)
- **ORM:** SQLAlchemy
- **Banco de Dados:** PostgreSQL
- **Containerização:** Docker & Docker Compose

---

## 📊 Indicadores e Gráficos

1.  **Cards de Performance:** Faturamento Bruto, Lucro Líquido, Total de Pedidos e Margem Real (pós-taxas).
2.  **Evolução de Vendas:** Gráfico de linha mostrando a saúde financeira diária.
3.  **Top Produtos:** Lista de ranking de performance por volume e receita.
4.  **Mapa de Pedidos por Região:** Gráfico de barras horizontais para inteligência regional.
5.  **Fluxo por Horário:** Gráfico de área para detecção de janelas de oportunidade.
6.  **Métodos de Pagamento:** Gráfico de rosca (Donut) para análise de formas de recebimento.

---

## 🏁 Como Rodar o Projeto

### Pré-requisitos
- Node.js 20+
- Python 3.9+
- Docker & Docker Compose

### 1. Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
docker-compose up -d
python main.py
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 🗺️ Roadmap de Melhorias (Coming Soon...)

O projeto está em constante evolução. As próximas atualizações incluem:
- [ ] **IA Insights:** Implementação de um assistente de IA que sugere promoções baseadas nos dados.
- [ ] **Exportação de Relatórios:** Geração de PDFs e planilhas de fechamento mensal.
- [ ] **Live Orders:** Integração com WebSockets para atualização de pedidos em tempo real sem refresh.
- [ ] **Multi-loja:** Suporte para gestão de redes de franquias em um único login.

---

## 👤 Autor

**Allan Gabriel Baeza Amirati Silva** *Junior Project Analyst na Claro | Graduate in Systems Analysis and Development (FIAP)*

---