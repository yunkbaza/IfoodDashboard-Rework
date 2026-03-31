const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// ==========================================
// 🛡️ INTERFACES DE DADOS (TIPAGEM ESTRITA)
// ==========================================

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
}

export interface InsightIA {
  tipo: 'TrendingDown' | 'AlertTriangle';
  titulo: string;
  reclamacao: string;
  dica: string;
}

// ==========================================
// 🛠️ FUNÇÕES AUXILIARES
// ==========================================

/**
 * Recupera o token do localStorage e gera os headers de autenticação.
 */
function getAuthHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

/**
 * Helper central para requisições GET com filtros de período e loja (Multi-loja).
 */
async function fetchWithFilter(endpoint: string, periodo?: string, lojaId?: number) {
  const url = new URL(`${API_URL}${endpoint}`);
  
  if (periodo) url.searchParams.append('periodo', periodo);
  if (lojaId) url.searchParams.append('loja_id', lojaId.toString());

  const res = await fetch(url.toString(), { 
    cache: 'no-store', // Garante dados sempre frescos
    headers: getAuthHeaders() 
  });
  
  if (res.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    throw new Error('Sessão expirada. Faça login novamente.');
  }

  if (!res.ok) throw new Error(`Falha na requisição para ${endpoint}`);
  
  return res.json();
}

// ==========================================
// 🔑 MÓDULO: AUTENTICAÇÃO
// ==========================================

export async function login(formData: FormData) {
  const data = new URLSearchParams();
  formData.forEach((value, key) => data.append(key, value.toString()));

  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    body: data, // OAuth2 espera form-data
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
  const res = await fetch(`${API_URL}/lojas`, { headers: getAuthHeaders() });
  
  if (!res.ok) {
    // Lê o texto de erro enviado pelo backend
    const errorDetails = await res.text(); 
    console.error("Status:", res.status, "Detalhes:", errorDetails);
    throw new Error(`Erro ao buscar lista de lojas. Status: ${res.status}`);
  }
  
  return res.json();
}
// ==========================================
// 📊 MÓDULO: ANALYTICS (DASHBOARD)
// ==========================================

export const getDashboardStats = (p: string = '7dias', l?: number) => fetchWithFilter('/dashboard/stats', p, l);
export const getFinanceiro = (p: string = '7dias', l?: number) => fetchWithFilter('/dashboard/financeiro', p, l);
export const getVendasDiarias = (p: string = '7dias', l?: number) => fetchWithFilter('/dashboard/vendas-diarias', p, l);
export const getTopProdutos = (p: string = '7dias', l?: number) => fetchWithFilter('/dashboard/top-produtos', p, l);
export const getStatsBairros = (p: string = '7dias', l?: number) => fetchWithFilter('/dashboard/bairros', p, l);
export const getStatsHorarios = (p: string = '7dias', l?: number) => fetchWithFilter('/dashboard/horarios', p, l);
export const getStatsPagamentos = (p: string = '7dias', l?: number) => fetchWithFilter('/dashboard/pagamentos', p, l);

export async function getMetaAnual(lojaId?: number): Promise<MetaAnualData> {
  return fetchWithFilter('/dashboard/meta-anual', undefined, lojaId);
}

// ==========================================
// 📦 MÓDULO: OPERAÇÃO (KANBAN)
// ==========================================

export const getPedidos = (p: string = '7dias', l?: number) => fetchWithFilter('/pedidos', p, l);

export async function atualizarStatusPedido(idPedido: string, novoStatus: string) {
  const res = await fetch(`${API_URL}/pedidos/${idPedido}/status`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status: novoStatus })
  });
  if (!res.ok) throw new Error('Falha ao atualizar o status do pedido');
  return res.json();
}

export async function simularPedido(lojaId?: number) {
  const url = new URL(`${API_URL}/pedidos/simular`);
  if (lojaId) url.searchParams.append('loja_id', lojaId.toString());

  const res = await fetch(url.toString(), {
    method: 'POST',
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Falha ao simular pedido em tempo real');
  return res.json();
}

// ==========================================
// 🤖 MÓDULO: FEEDBACK & INTELIGÊNCIA ARTIFICIAL
// ==========================================

export const getAvaliacoes = (p: string = '7dias', l?: number) => fetchWithFilter('/avaliacoes', p, l);

export async function createAvaliacao(dados: AvaliacaoCreateData) {
  const res = await fetch(`${API_URL}/avaliacoes`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(dados),
  });
  if (!res.ok) throw new Error('Falha ao registar avaliação');
  return res.json();
}

/**
 * Envia feedbacks para análise síncrona do Gemini 2.5
 */
export async function getAnaliseIA(feedbacks: string[]): Promise<InsightIA[]> {
  const res = await fetch(`${API_URL}/feedbacks/analise`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ feedbacks })
  });
  if (!res.ok) throw new Error('A IA está a processar muitos dados. Tente novamente em breve.');
  return res.json();
}

// ==========================================
// 📄 MÓDULO: EXPORTAÇÃO (AUDITORIA)
// ==========================================

/**
 * Lida com o download do CSV gerado por streaming no backend.
 */
export async function downloadRelatorio(periodo: string = '7dias', lojaId?: number) {
  const url = new URL(`${API_URL}/dashboard/exportar`);
  url.searchParams.append('periodo', periodo);
  if (lojaId) url.searchParams.append('loja_id', lojaId.toString());

  const res = await fetch(url.toString(), { headers: getAuthHeaders() });
  if (!res.ok) throw new Error('O servidor de relatórios está ocupado.');

  // Recebe o stream como blob para não sobrecarregar a memória do browser
  const blob = await res.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  link.href = downloadUrl;
  link.setAttribute('download', `auditoria_ifood_${lojaId || 'geral'}_${periodo}.csv`);
  document.body.appendChild(link);
  link.click();
  
  // Limpeza
  link.remove();
  window.URL.revokeObjectURL(downloadUrl);
}