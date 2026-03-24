const API_URL = "http://127.0.0.1:8000/api";

// --- Chamadas Base ---

export async function getDashboardStats() {
  const res = await fetch(`${API_URL}/dashboard/stats`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Falha ao buscar estatísticas');
  return res.json();
}

export async function getFinanceiro() {
  const res = await fetch(`${API_URL}/dashboard/financeiro`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Falha ao buscar dados financeiros');
  return res.json();
}

export async function getVendasDiarias() {
  const res = await fetch(`${API_URL}/dashboard/vendas-diarias`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Falha ao buscar vendas diárias');
  return res.json();
}

export async function getTopProdutos() {
  const res = await fetch(`${API_URL}/dashboard/top-produtos`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Falha ao buscar top produtos');
  return res.json();
}

// --- Novas Chamadas Modulares ---

export async function getStatsBairros() {
  const res = await fetch(`${API_URL}/dashboard/bairros`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Falha ao buscar estatísticas por bairro');
  return res.json();
}

export async function getStatsHorarios() {
  const res = await fetch(`${API_URL}/dashboard/horarios`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Falha ao buscar horários de pico');
  return res.json();
}

export async function getStatsPagamentos() {
  const res = await fetch(`${API_URL}/dashboard/pagamentos`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Falha ao buscar métodos de pagamento');
  return res.json();
}