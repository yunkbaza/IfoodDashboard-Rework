const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://ifood-dashboard-api.onrender.com/api";

// --- INTERFACES DE DADOS ---

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
  loja_id?: number;
}

export interface LojaData {
  id: number;
  nome: string;
  cnpj?: string;
  cidade?: string;
}

/**
 * Helper para gerir autenticação e headers globais.
 */
function getAuthHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

/**
 * Helper para construir URLs com filtros de período e loja (Multi-loja)
 */
const buildUrl = (endpoint: string, periodo?: string, lojaId?: number) => {
  const url = new URL(`${API_URL}${endpoint}`);
  if (periodo) url.searchParams.append('periodo', periodo);
  if (lojaId) url.searchParams.append('loja_id', lojaId.toString());
  return url.toString();
};

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
// 🏢 MÓDULO: GESTÃO DE LOJAS
// ==========================================

export async function getLojas(): Promise<LojaData[]> {
  const res = await fetch(`${API_URL}/lojas`, { 
    cache: 'no-store', headers: getAuthHeaders() 
  });
  if (!res.ok) throw new Error('Falha ao buscar lista de lojas');
  return res.json();
}

// ==========================================
// 📊 MÓDULO: DASHBOARD (MÉTRICAS)
// ==========================================

export async function getDashboardStats(periodo: string = '7dias', lojaId?: number) {
  const res = await fetch(buildUrl('/dashboard/stats', periodo, lojaId), { 
    cache: 'no-store', headers: getAuthHeaders() 
  });
  if (!res.ok) throw new Error('Falha ao buscar estatísticas');
  return res.json();
}

export async function getFinanceiro(periodo: string = '7dias', lojaId?: number) {
  const res = await fetch(buildUrl('/dashboard/financeiro', periodo, lojaId), { 
    cache: 'no-store', headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Falha ao buscar dados financeiros');
  return res.json();
}

export async function getVendasDiarias(periodo: string = '7dias', lojaId?: number) {
  const res = await fetch(buildUrl('/dashboard/vendas-diarias', periodo, lojaId), { 
    cache: 'no-store', headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Falha ao buscar vendas diárias');
  return res.json();
}

export async function getTopProdutos(periodo: string = '7dias', lojaId?: number) {
  const res = await fetch(buildUrl('/dashboard/top-produtos', periodo, lojaId), { 
    cache: 'no-store', headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Falha ao buscar top produtos');
  return res.json();
}

export async function getStatsBairros(periodo: string = '7dias', lojaId?: number) {
  const res = await fetch(buildUrl('/dashboard/bairros', periodo, lojaId), { 
    cache: 'no-store', headers: getAuthHeaders() 
  });
  if (!res.ok) throw new Error('Falha ao buscar estatísticas por bairro');
  return res.json();
}

export async function getStatsHorarios(periodo: string = '7dias', lojaId?: number) {
  const res = await fetch(buildUrl('/dashboard/horarios', periodo, lojaId), { 
    cache: 'no-store', headers: getAuthHeaders() 
  });
  if (!res.ok) throw new Error('Falha ao buscar horários de pico');
  return res.json();
}

export async function getStatsPagamentos(periodo: string = '7dias', lojaId?: number) {
  const res = await fetch(buildUrl('/dashboard/pagamentos', periodo, lojaId), { 
    cache: 'no-store', headers: getAuthHeaders() 
  });
  if (!res.ok) throw new Error('Falha ao buscar métodos de pagamento');
  return res.json();
}

export async function getMetaAnual(lojaId?: number): Promise<MetaAnualData> {
  const res = await fetch(buildUrl('/dashboard/meta', undefined, lojaId), { 
    cache: 'no-store', headers: getAuthHeaders() 
  });
  if (!res.ok) throw new Error('Falha ao buscar meta anual');
  return res.json();
}

// ==========================================
// 📥 MÓDULO: EXPORTAÇÃO
// ==========================================

export async function downloadRelatorio(periodo: string = '7dias', lojaId?: number) {
  const res = await fetch(buildUrl('/dashboard/exportar', periodo, lojaId), { 
    headers: getAuthHeaders() 
  });
  if (!res.ok) throw new Error('Erro ao gerar relatório');
  
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `relatorio_ifood_${periodo}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

// ==========================================
// 📦 MÓDULO: OPERAÇÃO (KANBAN)
// ==========================================

export async function getPedidos(periodo: string = '7dias', lojaId?: number) {
  const res = await fetch(buildUrl('/pedidos', periodo, lojaId), { 
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

export async function simularPedido(lojaId?: number) {
  const res = await fetch(buildUrl('/pedidos/simular', undefined, lojaId), {
    method: 'POST',
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Falha ao simular pedido');
  return res.json();
}

// ==========================================
// 🤖 MÓDULO: FEEDBACK & IA
// ==========================================

export async function getAvaliacoes(periodo: string = '7dias', lojaId?: number) {
  const res = await fetch(buildUrl('/avaliacoes', periodo, lojaId), { 
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