const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://ifood-dashboard-api.onrender.com/api";

// --- INTERFACES DE DADOS (TIPAGEM ESTRITA) ---

export interface RegisterData {
  nome: string;
  email: string;
  senha?: string;
}

export interface MetaAnualData {
  valor_meta: number;
  valor_atual: number;
  percentual: number;
}

export interface AvaliacaoCreateData {
  cliente: string;
  nota: number;
  texto: string;
  sentimento: string;
}

/**
 * Helper para gerir autenticação e headers globais.
 * Captura o token do localStorage para validar todas as rotas protegidas.
 */
function getAuthHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

// ==========================================
// 🔑 MÓDULO: AUTENTICAÇÃO
// ==========================================

export async function login(formData: FormData) {
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

export async function registrar(userData: RegisterData) {
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

// ==========================================
// 📊 MÓDULO: DASHBOARD (MÉTRICAS)
// ==========================================

export async function getDashboardStats(periodo: string = '7dias') {
  const res = await fetch(`${API_URL}/dashboard/stats?periodo=${periodo}`, { 
    cache: 'no-store', headers: getAuthHeaders() 
  });
  if (!res.ok) throw new Error('Falha ao buscar estatísticas');
  return res.json();
}

export async function getFinanceiro(periodo: string = '7dias') {
  const res = await fetch(`${API_URL}/dashboard/financeiro?periodo=${periodo}`, { 
    cache: 'no-store', headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Falha ao buscar dados financeiros');
  return res.json();
}

export async function getVendasDiarias(periodo: string = '7dias') {
  const res = await fetch(`${API_URL}/dashboard/vendas-diarias?periodo=${periodo}`, { 
    cache: 'no-store', headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Falha ao buscar vendas diárias');
  return res.json();
}

export async function getTopProdutos(periodo: string = '7dias') {
  const res = await fetch(`${API_URL}/dashboard/top-produtos?periodo=${periodo}`, { 
    cache: 'no-store', headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Falha ao buscar top produtos');
  return res.json();
}

export async function getStatsBairros(periodo: string = '7dias') {
  const res = await fetch(`${API_URL}/dashboard/bairros?periodo=${periodo}`, { 
    cache: 'no-store', headers: getAuthHeaders() 
  });
  if (!res.ok) throw new Error('Falha ao buscar estatísticas por bairro');
  return res.json();
}

export async function getStatsHorarios(periodo: string = '7dias') {
  const res = await fetch(`${API_URL}/dashboard/horarios?periodo=${periodo}`, { 
    cache: 'no-store', headers: getAuthHeaders() 
  });
  if (!res.ok) throw new Error('Falha ao buscar horários de pico');
  return res.json();
}

export async function getStatsPagamentos(periodo: string = '7dias') {
  const res = await fetch(`${API_URL}/dashboard/pagamentos?periodo=${periodo}`, { 
    cache: 'no-store', headers: getAuthHeaders() 
  });
  if (!res.ok) throw new Error('Falha ao buscar métodos de pagamento');
  return res.json();
}

export async function getMetaAnual(): Promise<MetaAnualData> {
  const res = await fetch(`${API_URL}/dashboard/meta`, { 
    cache: 'no-store', 
    headers: getAuthHeaders() 
  });
  
  if (res.status === 401) throw new Error('Sessão expirada. Faça login novamente.');
  if (!res.ok) throw new Error('Falha ao buscar meta anual');
  
  return res.json();
}

// ==========================================
// 📦 MÓDULO: OPERAÇÃO (KANBAN)
// ==========================================

export async function getPedidos(periodo: string = '7dias') {
  const res = await fetch(`${API_URL}/pedidos?periodo=${periodo}`, { 
    cache: 'no-store', headers: getAuthHeaders() 
  });
  if (!res.ok) throw new Error('Falha ao buscar a lista de pedidos');
  return res.json();
}

export async function atualizarStatusPedido(idPedido: string, novoStatus: string) {
  const res = await fetch(`${API_URL}/pedidos/${idPedido}/status`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status: novoStatus })
  });
  if (!res.ok) throw new Error('Falha ao atualizar o status');
  return res.json();
}

export async function simularPedido() {
  const res = await fetch(`${API_URL}/pedidos/simular`, {
    method: 'POST',
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Falha ao simular pedido');
  return res.json();
}

// ==========================================
// 🤖 MÓDULO: FEEDBACK & IA
// ==========================================

export async function getAvaliacoes(periodo: string = '7dias') {
  const res = await fetch(`${API_URL}/avaliacoes?periodo=${periodo}`, { 
    cache: 'no-store', headers: getAuthHeaders() 
  });
  if (!res.ok) throw new Error('Falha ao buscar avaliações');
  return res.json();
}

export async function createAvaliacao(dados: AvaliacaoCreateData) {
  const res = await fetch(`${API_URL}/avaliacoes`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(dados),
  });
  if (!res.ok) throw new Error('Falha ao criar avaliação');
  return res.json();
}

export async function getAnaliseIA(feedbacks: string[]) {
  const res = await fetch(`${API_URL}/feedbacks/analise`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ feedbacks })
  });
  if (!res.ok) throw new Error('Falha ao conectar com a IA');
  return res.json();
}