"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { 
  getDashboardStats, getFinanceiro, getVendasDiarias, 
  getTopProdutos, getStatsBairros, getStatsHorarios, getStatsPagamentos 
} from "../services/api";

import { 
  DollarSign, ShoppingBag, TrendingUp, Percent, Loader2, 
  LayoutDashboard, ListTodo, MessageSquare, LogOut, Target
} from "lucide-react";

// Componentes
import SalesChart from "../components/SalesChart";
import TopProducts from "../components/TopProducts";
import BairrosChart from "../components/BairrosChart";
import HorariosChart from "../components/HorariosChart";
import PagamentosChart from "../components/PagamentosChart";
import SimularPedidoButton from "../components/SimularPedidoButton";
import ThemeToggle from "../components/ThemeToggle";
import DashboardSettings, { DashboardConfig, ChartSize } from "../components/DashboardSettings";
import KanbanBoard from "../components/KanbanBoard";
import FeedbackView from "../components/FeedbackView"; 
import MetaAnualModal from "../components/MetaAnualModal"; 

export default function Dashboard() {
  const router = useRouter();

  // Controlo de Navegação Lateral
  const [activeMenu, setActiveMenu] = useState<'dashboard' | 'operacao' | 'feedbacks'>('dashboard');

  // Autenticação
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) router.push("/login");
  }, [router]);

  // Configuração do Layout do Dashboard
  const [config, setConfig] = useState<DashboardConfig>({
    showSales: true, salesSize: 'M', showTopProducts: true, topProductsSize: 'P',
    showBairros: true, bairrosSize: 'M', showPagamentos: true, pagamentosSize: 'P',
    showHorarios: true, horariosSize: 'G',
  });

  // Estados de Dados e Carregamento
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState<'hoje' | '7dias' | 'mensal'>('7dias');
  const [isFiltering, setIsFiltering] = useState(false);
  
  // Estado do Modal da Meta Anual
  const [isMetaModalOpen, setIsMetaModalOpen] = useState(false);

  // Mapeamento de tamanhos para as grelhas do Tailwind
  const sizeMap: Record<ChartSize, string> = {
    P: "lg:col-span-1", M: "lg:col-span-2", G: "lg:col-span-3"
  };

  // Carregamento de Dados da API
  useEffect(() => {
    async function loadAllData() {
      if (data) setIsFiltering(true);
      try {
        const [stats, financeiro, vendasDiarias, topProdutos, bairros, horarios, pagamentos] = await Promise.all([
          getDashboardStats(periodo), getFinanceiro(periodo), getVendasDiarias(periodo),
          getTopProdutos(periodo), getStatsBairros(periodo), getStatsHorarios(periodo), getStatsPagamentos(periodo)
        ]);
        setData({ stats, financeiro, vendasDiarias, topProdutos, bairros, horarios, pagamentos });
      } catch (error) {
        console.error("Erro na sincronização:", error);
      } finally {
        setLoading(false);
        setIsFiltering(false);
      }
    }
    loadAllData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [periodo]); 

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_name");
    router.push("/login");
  };

  // Tela de Loading Inicial
  if (loading || !data) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#111111] flex flex-col items-center justify-center gap-6">
        {/* SOLUÇÃO PARA LOGO: Container relativo com tamanho fixo (w-32 = 128px, h-12 = 48px) */}
        <div className="relative w-32 h-12">
            <Image 
              src="/IfoodVetor.svg" 
              alt="iFood" 
              fill // Preenche o container relativo
              className="object-contain" // Mantém a proporção
              priority 
            />
        </div>
        <Loader2 className="animate-spin text-[#EA1D2C]" size={32} />
      </div>
    );
  }

  // Cards Resumo do Topo
  const cards = [
    { title: "Faturamento", value: `R$ ${data.stats.faturamento_total.toLocaleString('pt-BR')}`, icon: DollarSign, color: "text-emerald-500 bg-emerald-500/10" },
    { title: "Lucro Líquido", value: `R$ ${data.financeiro.lucro_liquido.toLocaleString('pt-BR')}`, icon: TrendingUp, color: "text-blue-500 bg-blue-500/10" },
    { title: "Pedidos Entregues", value: data.stats.total_pedidos, icon: ShoppingBag, color: "text-purple-500 bg-purple-500/10" },
    { title: "Margem de Lucro", value: data.financeiro.margem_percentual, icon: Percent, color: "text-[#EA1D2C] bg-[#EA1D2C]/10" },
  ];

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-[#111111] overflow-hidden font-sans transition-colors duration-300">
      
      {/* MENU LATERAL */}
      <aside className="w-20 lg:w-64 bg-white dark:bg-[#1C1C1E] border-r border-slate-200 dark:border-[#2C2C2E] flex flex-col justify-between flex-shrink-0 z-20 transition-all duration-300">
        <div>
          <div className="h-24 flex items-center justify-center lg:justify-start lg:px-8 border-b border-slate-100 dark:border-[#2C2C2E]">
            {/* SOLUÇÃO PARA LOGO NO MENU: Container relativo (w-20 = 80px, h-9 = 36px) */}
            <div className="relative w-20 h-9">
                <Image 
                  src="/IfoodVetor.svg" 
                  alt="iFood Logo" 
                  fill // Preenche o container relativo
                  className="object-contain" // Mantém a proporção
                  priority 
                />
            </div>
          </div>
          
          <nav className="p-4 space-y-2 mt-4">
            <button 
              onClick={() => setActiveMenu('dashboard')}
              className={`w-full flex items-center justify-center lg:justify-start gap-4 px-4 py-3.5 rounded-2xl transition-all font-bold text-sm ${
                activeMenu === 'dashboard' ? 'bg-[#EA1D2C]/10 text-[#EA1D2C]' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-[#242426]'
              }`}
            >
              <LayoutDashboard size={20} /> <span className="hidden lg:block">Resumo da Loja</span>
            </button>
            <button 
              onClick={() => setActiveMenu('operacao')}
              className={`w-full flex items-center justify-center lg:justify-start gap-4 px-4 py-3.5 rounded-2xl transition-all font-bold text-sm ${
                activeMenu === 'operacao' ? 'bg-[#EA1D2C]/10 text-[#EA1D2C]' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-[#242426]'
              }`}
            >
              <ListTodo size={20} /> <span className="hidden lg:block">Tela da Cozinha</span>
            </button>
            <button 
              onClick={() => setActiveMenu('feedbacks')}
              className={`w-full flex items-center justify-center lg:justify-start gap-4 px-4 py-3.5 rounded-2xl transition-all font-bold text-sm ${
                activeMenu === 'feedbacks' ? 'bg-[#EA1D2C]/10 text-[#EA1D2C]' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-[#242426]'
              }`}
            >
              <MessageSquare size={20} /> <span className="hidden lg:block">Opinião dos Clientes</span>
            </button>
          </nav>
        </div>

        <div className="p-4 border-t border-slate-100 dark:border-[#2C2C2E]">
           <button onClick={handleLogout} className="w-full flex items-center justify-center lg:justify-start gap-4 px-4 py-3.5 rounded-2xl transition-all font-bold text-sm text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10">
              <LogOut size={20} /> <span className="hidden lg:block">Sair do Sistema</span>
            </button>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <main className="flex-1 overflow-y-auto relative">
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          
          {/* CABEÇALHO SUPERIOR */}
          <header className="mb-10 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                {activeMenu === 'dashboard' && 'Desempenho Financeiro'}
                {activeMenu === 'operacao' && 'Acompanhamento de Pedidos'}
                {activeMenu === 'feedbacks' && 'Avaliações e Dicas (IA)'}
              </h1>
              <p className="text-slate-500 dark:text-[#8E8E93] text-[10px] font-black uppercase tracking-[0.3em] mt-1.5 flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span> Sistema Ativo
              </p>
            </div>
            
            <div className="flex flex-wrap items-center justify-start xl:justify-end gap-3 w-full xl:w-auto">
              
              {/* FILTROS E AÇÕES DO DASHBOARD */}
              {activeMenu === 'dashboard' && (
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center bg-white dark:bg-[#1C1C1E] p-1 rounded-xl border border-slate-200 dark:border-[#2C2C2E] shadow-sm">
                    {(['hoje', '7dias', 'mensal'] as const).map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setPeriodo(opt)}
                        disabled={isFiltering}
                        className={`px-4 py-2 text-xs font-bold rounded-lg transition-all uppercase ${periodo === opt ? 'bg-[#EA1D2C] text-white shadow-md shadow-red-500/20' : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'}`}
                      >
                        {opt === '7dias' ? '7 Dias' : opt === 'mensal' ? 'Mensal' : opt}
                      </button>
                    ))}
                  </div>

                  <button 
                    onClick={() => setIsMetaModalOpen(true)}
                    className="flex items-center gap-2 bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-4 py-2 rounded-xl text-xs font-bold uppercase hover:opacity-80 transition-opacity shadow-sm"
                  >
                    <Target size={16} /> Meta Anual
                  </button>

                  <DashboardSettings config={config} setConfig={setConfig} />
                </div>
              )}
              
              {/* CONTROLOS GLOBAIS */}
              <div className="flex items-center gap-3 xl:border-l xl:border-slate-200 xl:dark:border-[#2C2C2E] xl:pl-3">
                <ThemeToggle />
                <SimularPedidoButton />
              </div>
              
            </div>
          </header>

          {/* CONTEÚDO DINÂMICO BASEADO NO MENU */}
          <div className={`transition-opacity duration-500 ${isFiltering ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
            
            {/* VISTA 1: DASHBOARD FINANCEIRO */}
            {activeMenu === 'dashboard' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                  {cards.map((card, index) => (
                    <div key={index} className="bg-white dark:bg-[#1C1C1E] p-6 rounded-[24px] border border-slate-100 dark:border-[#2C2C2E] shadow-sm hover:border-slate-200 dark:hover:border-[#3C3C3E] transition-all">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">{card.title}</span>
                        <div className={`${card.color} p-2.5 rounded-xl`}><card.icon size={18} /></div>
                      </div>
                      <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{card.value}</div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                  {config.showSales && <div className={`${sizeMap[config.salesSize]} bg-white dark:bg-[#1C1C1E] p-8 rounded-[32px] border border-slate-100 dark:border-[#2C2C2E] min-h-[300px] shadow-sm`}><SalesChart data={data.vendasDiarias} /></div>}
                  {config.showTopProducts && <div className={`${sizeMap[config.topProductsSize]} bg-white dark:bg-[#1C1C1E] p-8 rounded-[32px] border border-slate-100 dark:border-[#2C2C2E] min-h-[300px] shadow-sm`}><TopProducts data={data.topProdutos} /></div>}
                  {config.showBairros && <div className={`${sizeMap[config.bairrosSize]} bg-white dark:bg-[#1C1C1E] p-8 rounded-[32px] border border-slate-100 dark:border-[#2C2C2E] min-h-[300px] shadow-sm`}><BairrosChart data={data.bairros} /></div>}
                  {config.showPagamentos && <div className={`${sizeMap[config.pagamentosSize]} bg-white dark:bg-[#1C1C1E] p-8 rounded-[32px] border border-slate-100 dark:border-[#2C2C2E] min-h-[300px] shadow-sm`}><PagamentosChart data={data.pagamentos} /></div>}
                  {config.showHorarios && <div className={`${sizeMap[config.horariosSize]} bg-white dark:bg-[#1C1C1E] p-8 rounded-[32px] border border-slate-100 dark:border-[#2C2C2E] min-h-[300px] shadow-sm`}><HorariosChart data={data.horarios} /></div>}
                </div>
              </>
            )}

            {/* VISTA 2: TELA DA COZINHA (KANBAN) */}
            {activeMenu === 'operacao' && (
              <div className="bg-slate-100/50 dark:bg-[#111111] p-2 rounded-[32px] min-h-[70vh]">
                <KanbanBoard periodo={periodo} />
              </div>
            )}

            {/* VISTA 3: AVALIAÇÕES E IA */}
            {activeMenu === 'feedbacks' && (
              <FeedbackView />
            )}

          </div>
        </div>
      </main>

      {/* MODAL DA META ANUAL */}
      <MetaAnualModal isOpen={isMetaModalOpen} onClose={() => setIsMetaModalOpen(false)} />

    </div>
  );
}