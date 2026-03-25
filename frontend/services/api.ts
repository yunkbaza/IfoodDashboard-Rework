const API_URL = "http://127.0.0.1:8000/api"; // <-- A MÁGICA ESTÁ NESTES NÚMEROS

// --- Chamadas Base ---

export async function getDashboardStats(periodo: string = '7dias') {
  const res = await fetch(`${API_URL}/dashboard/stats?periodo=${periodo}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Falha ao buscar estatísticas');
  return res.json();
}

export async function getFinanceiro(periodo: string = '7dias') {
  const res = await fetch(`${API_URL}/dashboard/financeiro?periodo=${periodo}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Falha ao buscar dados financeiros');
  return res.json();
}

export async function getVendasDiarias(periodo: string = '7dias') {
  const res = await fetch(`${API_URL}/dashboard/vendas-diarias?periodo=${periodo}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Falha ao buscar vendas diárias');
  return res.json();
}

export async function getTopProdutos(periodo: string = '7dias') {
  const res = await fetch(`${API_URL}/dashboard/top-produtos?periodo=${periodo}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Falha ao buscar top produtos');
  return res.json();
}

// --- Novas Chamadas Modulares ---

export async function getStatsBairros(periodo: string = '7dias') {
  const res = await fetch(`${API_URL}/dashboard/bairros?periodo=${periodo}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Falha ao buscar estatísticas por bairro');
  return res.json();
}

export async function getStatsHorarios(periodo: string = '7dias') {
  const res = await fetch(`${API_URL}/dashboard/horarios?periodo=${periodo}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Falha ao buscar horários de pico');
  return res.json();
}

export async function getStatsPagamentos(periodo: string = '7dias') {
  const res = await fetch(`${API_URL}/dashboard/pagamentos?periodo=${periodo}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Falha ao buscar métodos de pagamento');
  return res.json();
}