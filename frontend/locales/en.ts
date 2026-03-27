export const en = {
  header: {
    overview: "Store Overview",
    orderTracking: "Live Order Tracking",
    reviews: "Reviews & AI Analysis",
    realTime: "System updated in real-time"
  },
  menu: {
    overview: "Overview",
    management: "Order Management",
    reviews: "Customer Reviews",
    logout: "Logout"
  },
  cards: {
    revenue: "Total Revenue",
    profit: "Estimated Profit",
    orders: "Total Orders",
    margin: "Profit Margin"
  },
  charts: {
    sales: { 
      title: "Sales Trend", 
      subtitle: "Financial Performance", 
      tooltip: "Daily Revenue", 
      footer: "Gross Revenue", 
      badge: "Exact Calculation" 
    },
    topProducts: { 
      title: "Top Sellers", 
      subtitle: "Menu Metrics", 
      tooltip: "Product Insights", 
      sold: "units sold", 
      footer: "Order volume over period" 
    },
    bairros: { 
      title: "Orders by Region", 
      subtitle: "Geographic Distribution", 
      tooltip: "Logistics Analysis", 
      total: "Total Orders", 
      badge: "High Demand Zone", 
      footer: "Logistics Heatmap" 
    },
    horarios: { 
      title: "Operational Flow", 
      subtitle: "Peak Time Analytics", 
      tooltip: "Time Window", 
      orders: "Orders", 
      high: "High Demand Period", 
      low: "Low Demand Period", 
      footer: "Workload Monitoring", 
      badge: "Live Sync" 
    },
    pagamentos: { 
      title: "Revenue by Method", 
      subtitle: "Financial Channels", 
      total: "Total Revenue", 
      tooltip: "Detailed Distribution", 
      share: "{percent}% of total volume", 
      footer: "Audited data via iFood API", 
      methods: { 
        credit: "Credit Card", 
        debit: "Debit Card", 
        cash: "Cash", 
        pix: "Pix" 
      } 
    }
  },
  kanban: {
    orderId: "Order ID",
    totalValue: "Total Value",
    tickets: "tickets",
    dropHere: "Drop orders here",
    limit: "Only the latest 10 tickets are visible",
    columns: { 
      pending: "New Orders", 
      preparing: "In Kitchen", 
      completed: "Dispatched" 
    },
    toasts: { 
      moved: "Order moved to", 
      syncError: "Failed to sync kitchen orders.",
      updateError: "Failed to update server. Reverting action." 
    },
    status: { 
      live: "Kitchen Link: Active", 
      offline: "Kitchen Link: Offline", 
      workstation: "Preparing Workstation" 
    }
  },
  simulate: {
    button: "Simulate Order",
    processing: "Processing...",
    success: "Transaction simulated successfully!",
    errorApi: "Failed to communicate with the API.",
    errorUnknown: "Unknown error while simulating transaction."
  },
  feedbacks: {
    title: "Customer Voice",
    subtitle: "Real feedback extracted from the database and analyzed by the AI Assistant.",
    newSimulation: "New Simulation",
    empty: "The database is empty. Use the button above to simulate.",
    positive: "Positive",
    negative: "Negative",
    aiAssistant: "AI Assistant",
    analyzing: "Analyzing database...",
    insightsTitle: "Insights generated based on recent feedback:",
    context: "Context",
    recommendation: "Recommendation",
    acknowledge: "Acknowledge"
  },
  settings: {
    title: "Dashboard Settings",
    description: "Customize chart visibility and sizing.",
    orderTitle: "Organization",
    orderSub: "Drag to reorder",
    visibility: "Visibility",
    size: "Size",
    close: "Close"
  },
  metaModal: {
    title: "Set Annual Target",
    label: "Target Value ($)",
    placeholder: "e.g.: 500000",
    save: "Save Target",
    cancel: "Cancel",
    success: "Target updated successfully!"
  },
  common: {
    export: "Export Report",
    today: "Today",
    last7Days: "7 Days",
    last30Days: "30 Days"
  }
};