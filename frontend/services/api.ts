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

export async function login(formData: FormData) {
  // O FastAPI (Python) exige que os dados de login venham num formato específico chamado URLSearchParams
  const data = new URLSearchParams();
  formData.forEach((value, key) => data.append(key, value.toString()));

  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    body: data,
  });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Falha no login');
  }
  return res.json();
}

export async function registrar(userData: any) {
  const res = await fetch(`${API_URL}/auth/registrar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Erro ao registrar');
  }
  return res.json();
}

export async function getPedidos(periodo: string = '7dias') {
  const res = await fetch(`${API_URL}/pedidos?periodo=${periodo}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Falha ao buscar a lista de pedidos');
  return res.json();
}

export async function atualizarStatusPedido(idPedido: string, novoStatus: string) {
  const res = await fetch(`${API_URL}/pedidos/${idPedido}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: novoStatus })
  });
  if (!res.ok) throw new Error('Falha ao atualizar o status');
  return res.json();
}

export async function getMetaAnual() {
  const res = await fetch(`${API_URL}/dashboard/meta`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Falha ao buscar meta anual');
  return res.json();
}

export async function getAnaliseIA(feedbacks: any[]) {
  const res = await fetch(`${API_URL}/feedbacks/analise`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ feedbacks })
  });
  if (!res.ok) throw new Error('Falha ao conectar com a IA');
  return res.json();
}

// Adicione ao final do arquivo frontend/services/api.ts

export async function getAvaliacoes() {
  const res = await fetch(`${API_URL}/avaliacoes`);
  if (!res.ok) throw new Error('Falha ao buscar avaliações');
  return res.json();
}

export async function createAvaliacao(dados: { cliente: string; nota: number; texto: string; sentimento: string }) {
  const res = await fetch(`${API_URL}/avaliacoes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados),
  });
  if (!res.ok) throw new Error('Falha ao criar avaliação');
  return res.json();
}