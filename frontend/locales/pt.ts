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
    sales: { title: "Evolução de Vendas", subtitle: "Performance Financeira", tooltip: "Receita Diária", footer: "Faturamento Bruto", badge: "Cálculo Exato" },
    topProducts: { title: "Campeões de Vendas", subtitle: "Métricas de Menu", tooltip: "Dados do Campeão", sold: "unidades vendidas", footer: "Volume de pedidos no período" },
    bairros: { title: "Pedidos por Região", subtitle: "Distribuição Geográfica", tooltip: "Análise de Logística", total: "Pedidos Totais", badge: "Zona de Alta Demanda", footer: "Mapeamento de Calor Logístico" },
    horarios: { title: "Fluxo Operacional", subtitle: "Inteligência de Pico", tooltip: "Janela de Tempo", orders: "Pedidos", high: "Momento de Alta Demanda", low: "Momento de Baixa Demanda", footer: "Monitoramento de Carga de Trabalho", badge: "Sincronizado" },
    pagamentos: { title: "Faturamento por Método", subtitle: "Canais Financeiros", total: "Receita Total", tooltip: "Distribuição Detalhada", share: "do volume total", footer: "Dados auditados via API iFood", methods: { credit: "Cartão de Crédito", debit: "Cartão de Débito", cash: "Dinheiro", pix: "Pix" } }
  },
  // Adicione dentro do objeto principal
kanban: {
  orderId: "ID do Pedido",
  totalValue: "Valor Total",
  tickets: "pedidos",
  dropHere: "Solte os pedidos aqui",
  limit: "Apenas os últimos 10 pedidos são visíveis",
  columns: { pending: "Novos Pedidos", preparing: "Na Cozinha", completed: "Despachados" },
  toasts: { 
    moved: "Pedido movido para", 
    syncError: "Falha ao sincronizar pedidos da cozinha.",
    updateError: "Erro ao atualizar servidor. Revertendo ação." 
  },
  status: { live: "Link Cozinha: Ativo", offline: "Link Cozinha: Offline", workstation: "Preparando Estação de Trabalho" }
}
};