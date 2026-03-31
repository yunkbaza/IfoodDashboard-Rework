export const pt = {
  header: {
    overview: "Visão Geral da Loja",
    orderTracking: "Acompanhamento de Pedidos",
    reviews: "Avaliações e Análise de IA",
    realTime: "Sistema atualizado em tempo real"
  },
  menu: {
    overview: "Visão Geral",
    management: "Gestão de Pedidos",
    reviews: "Avaliações de Clientes",
    logout: "Sair"
  },
  cards: {
    revenue: "Faturamento Bruto",
    profit: "Lucro Estimado",
    orders: "Total de Pedidos",
    margin: "Margem de Lucro"
  },
  charts: {
    sales: { 
      title: "Evolução de Vendas", 
      subtitle: "Performance Financeira", 
      tooltip: "Receita Diária", 
      footer: "Faturamento Bruto", 
      badge: "Cálculo Exato" 
    },
    topProducts: { 
      title: "Campeões de Vendas", 
      subtitle: "Métricas de Menu", 
      tooltip: "Dados do Campeão", 
      sold: "unidades vendidas", 
      footer: "Volume de pedidos no período" 
    },
    bairros: { 
      title: "Pedidos por Região", 
      subtitle: "Distribuição Geográfica", 
      tooltip: "Análise de Logística", 
      total: "Pedidos Totais", 
      badge: "Zona de Alta Demanda", 
      footer: "Mapeamento de Calor Logístico" 
    },
    horarios: { 
      title: "Fluxo Operacional", 
      subtitle: "Inteligência de Pico", 
      tooltip: "Janela de Tempo", 
      orders: "Pedidos", 
      high: "Momento de Alta Demanda", 
      low: "Momento de Baixa Demanda", 
      footer: "Monitoramento de Carga de Trabalho", 
      badge: "Sincronizado" 
    },
    pagamentos: { 
      title: "Faturamento por Método", 
      subtitle: "Canais Financeiros", 
      total: "Receita Total", 
      tooltip: "Distribuição Detalhada", 
      share: "{percent}% do volume total", 
      footer: "Dados auditados via API iFood", 
      methods: { 
        credit: "Cartão de Crédito", 
        debit: "Cartão de Débito", 
        cash: "Dinheiro", 
        pix: "Pix" 
      } 
    }
  },
  kanban: {
    orderId: "ID do Pedido",
    totalValue: "Valor Total",
    tickets: "pedidos",
    dropHere: "Solte os pedidos aqui",
    limit: "Apenas os últimos 10 pedidos são visíveis",
    columns: { 
      pending: "Novos Pedidos", 
      preparing: "Na Cozinha", 
      completed: "Despachados" 
    },
    toasts: { 
      moved: "Pedido movido para", 
      syncError: "Falha ao sincronizar pedidos da cozinha.",
      updateError: "Erro ao atualizar servidor. Revertendo ação." 
    },
    status: { 
      live: "Link Cozinha: Ativo", 
      offline: "Link Cozinha: Offline", 
      workstation: "Preparando Estação de Trabalho" 
    }
  },
  simulate: {
    button: "Simular Pedido",
    processing: "Processando...",
    success: "Transação simulada com sucesso!",
    errorApi: "Falha na comunicação com a API.",
    errorUnknown: "Erro desconhecido ao simular transação."
  },
  feedbacks: {
    title: "Voz do Cliente",
    subtitle: "Feedbacks reais extraídos do banco de dados e analisados pelo Assistente de IA.",
    newSimulation: "Nova Simulação",
    empty: "O banco de dados está vazio. Use o botão acima para simular.",
    positive: "Positivo",
    negative: "Negativo",
    aiAssistant: "Assistente de IA",
    analyzing: "Analisando banco de dados...",
    insightsTitle: "Insights gerados com base em feedbacks recentes:",
    context: "Contexto",
    recommendation: "Recomendação",
    acknowledge: "Ciente"
  },
  settings: {
    title: "Configurações do Dashboard",
    description: "Personalize a visibilidade e o tamanho dos seus gráficos.",
    orderTitle: "Organização",
    orderSub: "Arraste para reordenar",
    visibility: "Visibilidade",
    size: "Tamanho",
    close: "Fechar"
  },
  metaModal: {
    title: "Definir Meta Anual",
    label: "Valor da Meta (R$)",
    placeholder: "Ex: 500000",
    save: "Salvar Meta",
    cancel: "Cancelar",
    success: "Meta atualizada com sucesso!"
  },
  common: {
    export: "Exportar Relatório",
    today: "Hoje",
    last7Days: "7 Dias",
    last30Days: "30 Dias"
  },
  landing: {
    nav: {
      login: "Entrar",
      startFree: "Começar Grátis"
    },
    hero: {
      aiTag: "Inteligência Artificial Integrada",
      titlePart1: "O Controle Absoluto",
      titlePart2: "Da Sua Operação",
      description: "Escale o seu delivery com o único dashboard Multi-loja que analisa os seus feedbacks com IA e organiza os seus pedidos num Kanban em tempo real.",
      button: "Acessar Dashboard"
    },
    features: {
      title: "Recursos de Nível Enterprise",
      subtitle: "Desenvolvido para operações de alto volume.",
      multiStore: {
        title: "Multi-loja Nativo",
        desc: "Gira todas as unidades do seu restaurante (CNPJs diferentes) a partir de um único ecrã consolidado."
      },
      ai: {
        title: "Análise com Gemini IA",
        desc: "Não perca tempo a ler centenas de reviews. A nossa IA extrai os problemas críticos e recomenda soluções automáticas."
      },
      kanban: {
        title: "Kanban Operacional",
        desc: "Acompanhe o fluxo de pedidos da cozinha à entrega num quadro interativo desenhado para reduzir o stress."
      }
    },
    footer: {
      title: "Pronto para dominar o seu mercado?",
      button: "Criar Conta Gratuita"
    }
  }
};