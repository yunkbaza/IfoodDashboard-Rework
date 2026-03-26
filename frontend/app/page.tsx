"use client";

import { useState, useEffect, useCallback } from "react";
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

// ✅ ADEUS 'ANY': Agora definimos exatamente o que cada gráfico espera receber
interface DashboardData {
  stats: { faturamento_total: number; total_pedidos: number; ticket_medio: number };
  financeiro: { bruto: number; lucro_liquido: number; margem_percentual: string };
  vendasDiarias: { data: string; valor: number }[];
  topProdutos: { nome: string; quantidade: number; receita: number }[];
  bairros: { bairro: string; pedidos: number }[];
  horarios: { hora: string; pedidos: number }[];
  pagamentos: { tipo: string; valor: number }[];
}

export default function Dashboard() {
  const router = useRouter();
  const [activeMenu, setActiveMenu] = useState<'dashboard' | 'operacao' | 'feedbacks'>('dashboard');

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) router.push("/login");
  }, [router]);

  const [config, setConfig] = useState<DashboardConfig>({
    showSales: true, salesSize: 'M', showTopProducts: true, topProductsSize: 'P',
    showBairros: true, bairrosSize: 'M', showPagamentos: true, pagamentosSize: 'P',
    showHorarios: true, horariosSize: 'G',
  });

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState<'hoje' | '7dias' | 'mensal'>('7dias');
  const [isFiltering, setIsFiltering] = useState(false);
  const [isMetaModalOpen, setIsMetaModalOpen] = useState(false);

  const sizeMap: Record<ChartSize, string> = {
    P: "lg:col-span-1", M: "lg:col-span-2", G: "lg:col-span-3"
  };

  const loadAllData = useCallback(async () => {
    setIsFiltering(true);
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
  }, [periodo]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]); 

  useEffect(() => {
    const wsUrl = "ws://127.0.0.1:8000/ws/pedidos"; 
    const socket = new WebSocket(wsUrl);

    socket.onmessage = (event) => {
      const socketData = JSON.parse(event.data);
      if (socketData.action === "new_order" || socketData.action === "update_status") {
        loadAllData(); 
      }
    };

    return () => socket.close();
  }, [loadAllData]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_name");
    router.push("/login");
  };

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#111111] flex flex-col items-center justify-center gap-6">
        <div className="relative w-32 h-12">
            <Image src="/IfoodVetor.svg" alt="iFood" fill className="object-contain" priority />
        </div>
        <Loader2 className="animate-spin text-[#EA1D2C]" size={32} />
      </div>
    );
  }

  const cards = [
    { title: "Faturamento", value: `R$ ${data.stats.faturamento_total.toLocaleString('pt-BR')}`, icon: DollarSign, color: "text-emerald-500 bg-emerald-500/10" },
    { title: "Lucro Líquido", value: `R$ ${data.financeiro.lucro_liquido.toLocaleString('pt-BR')}`, icon: TrendingUp, color: "text-blue-500 bg-blue-500/10" },
    { title: "Pedidos Entregues", value: data.stats.total_pedidos, icon: ShoppingBag, color: "text-purple-500 bg-purple-500/10" },
    { title: "Margem de Lucro", value: data.financeiro.margem_percentual, icon: Percent, color: "text-[#EA1D2C] bg-[#EA1D2C]/10" },
  ];

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-[#111111] overflow-hidden font-sans transition-colors duration-300">
      
      {/* ✅ CORREÇÃO TAILWIND: shrink-0 em vez de flex-shrink-0 */}
      <aside className="w-20 lg:w-64 bg-white dark:bg-[#1C1C1E] border-r border-slate-200 dark:border-[#2C2C2E] flex flex-col justify-between shrink-0 z-20 transition-all duration-300">
        <div>
          <div className="h-24 flex items-center justify-center lg:justify-start lg:px-8 border-b border-slate-100 dark:border-[#2C2C2E]">
            <div className="relative w-20 h-9">
                <Image src="/IfoodVetor.svg" alt="iFood Logo" fill className="object-contain" priority />
            </div>
          </div>
          
          <nav className="p-4 space-y-2 mt-4">
            <button onClick={() => setActiveMenu('dashboard')} className={`w-full flex items-center justify-center lg:justify-start gap-4 px-4 py-3.5 rounded-2xl transition-all font-bold text-sm ${activeMenu === 'dashboard' ? 'bg-[#EA1D2C]/10 text-[#EA1D2C]' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-[#242426]'}`}>
              <LayoutDashboard size={20} /> <span className="hidden lg:block">Resumo da Loja</span>
            </button>
            <button onClick={() => setActiveMenu('operacao')} className={`w-full flex items-center justify-center lg:justify-start gap-4 px-4 py-3.5 rounded-2xl transition-all font-bold text-sm ${activeMenu === 'operacao' ? 'bg-[#EA1D2C]/10 text-[#EA1D2C]' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-[#242426]'}`}>
              <ListTodo size={20} /> <span className="hidden lg:block">Tela da Cozinha</span>
            </button>
            <button onClick={() => setActiveMenu('feedbacks')} className={`w-full flex items-center justify-center lg:justify-start gap-4 px-4 py-3.5 rounded-2xl transition-all font-bold text-sm ${activeMenu === 'feedbacks' ? 'bg-[#EA1D2C]/10 text-[#EA1D2C]' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-[#242426]'}`}>
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

      <main className="flex-1 overflow-y-auto relative">
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          
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

                {activeMenu === 'dashboard' && (
                  <>
                    <button onClick={() => setIsMetaModalOpen(true)} className="flex items-center gap-2 bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-4 py-2 rounded-xl text-xs font-bold uppercase hover:opacity-80 transition-opacity shadow-sm">
                      <Target size={16} /> Meta Anual
                    </button>
                    <DashboardSettings config={config} setConfig={setConfig} />
                  </>
                )}
              </div>
              
              <div className="flex items-center gap-3 xl:border-l xl:border-slate-200 xl:dark:border-[#2C2C2E] xl:pl-3">
                <ThemeToggle />
                <SimularPedidoButton />
              </div>
              
            </div>
          </header>

          <div className={`transition-opacity duration-500 ${isFiltering ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
            
            {activeMenu === 'dashboard' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                  {cards.map((card, index) => (
                    // ✅ CORREÇÃO TAILWIND: rounded-[24px] -> rounded-3xl
                    <div key={index} className="bg-white dark:bg-[#1C1C1E] p-6 rounded-3xl border border-slate-100 dark:border-[#2C2C2E] shadow-sm hover:border-slate-200 dark:hover:border-[#3C3C3E] transition-all">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">{card.title}</span>
                        <div className={`${card.color} p-2.5 rounded-xl`}><card.icon size={18} /></div>
                      </div>
                      <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{card.value}</div>
                    </div>
                  ))}
                </div>

                {/* ✅ CORREÇÃO TAILWIND GERAL NOS GRÁFICOS: rounded-[32px] -> rounded-4xl | min-h-[300px] -> min-h-75 */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                  {config.showSales && <div className={`${sizeMap[config.salesSize]} bg-white dark:bg-[#1C1C1E] p-8 rounded-4xl border border-slate-100 dark:border-[#2C2C2E] min-h-75 shadow-sm`}><SalesChart data={data.vendasDiarias} /></div>}
                  {config.showTopProducts && <div className={`${sizeMap[config.topProductsSize]} bg-white dark:bg-[#1C1C1E] p-8 rounded-4xl border border-slate-100 dark:border-[#2C2C2E] min-h-75 shadow-sm`}><TopProducts data={data.topProdutos} /></div>}
                  {config.showBairros && <div className={`${sizeMap[config.bairrosSize]} bg-white dark:bg-[#1C1C1E] p-8 rounded-4xl border border-slate-100 dark:border-[#2C2C2E] min-h-75 shadow-sm`}><BairrosChart data={data.bairros} /></div>}
                  {config.showPagamentos && <div className={`${sizeMap[config.pagamentosSize]} bg-white dark:bg-[#1C1C1E] p-8 rounded-4xl border border-slate-100 dark:border-[#2C2C2E] min-h-75 shadow-sm`}><PagamentosChart data={data.pagamentos} /></div>}
                  {config.showHorarios && <div className={`${sizeMap[config.horariosSize]} bg-white dark:bg-[#1C1C1E] p-8 rounded-4xl border border-slate-100 dark:border-[#2C2C2E] min-h-75 shadow-sm`}><HorariosChart data={data.horarios} /></div>}
                </div>
              </>
            )}

            {activeMenu === 'operacao' && (
              <div className="bg-slate-100/50 dark:bg-[#111111] p-2 rounded-4xl min-h-[70vh]">
                <KanbanBoard periodo={periodo} />
              </div>
            )}

            {activeMenu === 'feedbacks' && (
              <FeedbackView periodo={periodo} />
            )}

          </div>
        </div>
      </main>

      <MetaAnualModal isOpen={isMetaModalOpen} onClose={() => setIsMetaModalOpen(false)} />

    </div>
  );
}