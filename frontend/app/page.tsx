"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { 
  getDashboardStats, getFinanceiro, getVendasDiarias, 
  getTopProdutos, getStatsBairros, getStatsHorarios, getStatsPagamentos 
} from "../services/api";

import { 
  DollarSign, ShoppingBag, TrendingUp, Percent, Loader2, 
  LayoutDashboard, ListTodo, MessageSquare, LogOut, Target, Menu, ChevronLeft
} from "lucide-react";

// Contexto de Idioma
import { useLanguage } from "../contexts/LanguageContext"; // ✅ IMPORTADO
import LanguageToggle from "../components/LanguageToggle"; // ✅ IMPORTADO

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
import ExportButton from "../components/ExportButton";

type MenuOption = 'dashboard' | 'operacao' | 'feedbacks';

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
  const { lang, t } = useLanguage(); // ✅ HOOK DE IDIOMA ATIVADO
  const [activeMenu, setActiveMenu] = useState<MenuOption>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const [config, setConfig] = useState<DashboardConfig>({
    showSales: true, salesSize: 'M', 
    showTopProducts: true, topProductsSize: 'P',
    showBairros: true, bairrosSize: 'M', 
    showPagamentos: true, pagamentosSize: 'P',
    showHorarios: true, horariosSize: 'G',
    chartOrder: ['sales', 'topProducts', 'bairros', 'pagamentos', 'horarios']
  });

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState<'hoje' | '7dias' | 'mensal'>('7dias');
  const [isFiltering, setIsFiltering] = useState(false);
  const [isMetaModalOpen, setIsMetaModalOpen] = useState(false);

  const sizeMap: Record<ChartSize, string> = {
    P: "lg:col-span-1", 
    M: "lg:col-span-2", 
    G: "lg:col-span-3"
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
      console.error("Sync error:", error);
      toast.error(lang === 'en' ? "Failed to synchronize data." : "Erro ao sincronizar dados.");
    } finally {
      setLoading(false);
      setIsFiltering(false);
    }
  }, [periodo, lang]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) router.push("/login");
    else loadAllData();
  }, [router, loadAllData]);

  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://127.0.0.1:8000/ws/pedidos"; 
    const socket = new WebSocket(wsUrl);

    socket.onmessage = (event) => {
      const socketData = JSON.parse(event.data);
      if (socketData.action === "new_order") {
        toast.success(lang === 'en' ? "New Order Received!" : "Novo Pedido Recebido!", { description: `ID: ${socketData.id_pedido}` });
        loadAllData(); 
      } else if (socketData.action === "update_status") {
        loadAllData();
      }
    };

    return () => socket.close();
  }, [loadAllData, lang]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_name");
    router.push("/login");
  };

  const renderChart = (chartId: string) => {
    switch (chartId) {
      case 'sales':
        return config.showSales && (
          <div key="sales" className={`${sizeMap[config.salesSize]} bg-white dark:bg-[#111113] p-8 rounded-4xl border dark:border-white/5 shadow-xl flex flex-col min-h-[400px]`}>
            <SalesChart data={data!.vendasDiarias} />
          </div>
        );
      case 'topProducts':
        return config.showTopProducts && (
          <div key="topProducts" className={`${sizeMap[config.topProductsSize]} bg-white dark:bg-[#111113] p-8 rounded-4xl border dark:border-white/5 shadow-xl flex flex-col min-h-[400px]`}>
            <TopProducts data={data!.topProdutos} />
          </div>
        );
      case 'bairros':
        return config.showBairros && (
          <div key="bairros" className={`${sizeMap[config.bairrosSize]} bg-white dark:bg-[#111113] p-8 rounded-4xl border dark:border-white/5 shadow-xl flex flex-col min-h-[400px]`}>
            <BairrosChart data={data!.bairros} />
          </div>
        );
      case 'pagamentos':
        return config.showPagamentos && (
          <div key="pagamentos" className={`${sizeMap[config.pagamentosSize]} bg-white dark:bg-[#111113] p-8 rounded-4xl border dark:border-white/5 shadow-xl flex flex-col min-h-[400px]`}>
            <PagamentosChart data={data!.pagamentos} />
          </div>
        );
      case 'horarios':
        return config.showHorarios && (
          <div key="horarios" className={`${sizeMap[config.horariosSize]} bg-white dark:bg-[#111113] p-8 rounded-4xl border dark:border-white/5 shadow-xl flex flex-col min-h-[400px]`}>
            <HorariosChart data={data!.horarios} />
          </div>
        );
      default:
        return null;
    }
  };

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-[#0A0A0B] flex flex-col items-center justify-center gap-6">
        <div className="relative w-32 h-12">
            <Image src="/IfoodVetor.svg" alt="iFood" fill className="object-contain" priority />
        </div>
        <Loader2 className="animate-spin text-[#EA1D2C]" size={32} />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">
          {lang === 'en' ? "Updating Store Dashboard" : "Atualizando Painel da Loja"}
        </p>
      </div>
    );
  }

  const cards = [
    { 
      title: t.cards.revenue, 
      value: `${lang === 'en' ? '$' : 'R$'} ${data.stats.faturamento_total.toLocaleString(lang === 'en' ? 'en-US' : 'pt-BR')}`, 
      icon: DollarSign, color: "text-emerald-500", glow: "shadow-emerald-500/10" 
    },
    { 
      title: t.cards.profit, 
      value: `${lang === 'en' ? '$' : 'R$'} ${data.financeiro.lucro_liquido.toLocaleString(lang === 'en' ? 'en-US' : 'pt-BR')}`, 
      icon: TrendingUp, color: "text-blue-500", glow: "shadow-blue-500/10" 
    },
    { 
      title: t.cards.orders, 
      value: data.stats.total_pedidos.toLocaleString(lang === 'en' ? 'en-US' : 'pt-BR'), 
      icon: ShoppingBag, color: "text-purple-500", glow: "shadow-purple-500/10" 
    },
    { 
      title: t.cards.margin, 
      value: data.financeiro.margem_percentual, 
      icon: Percent, color: "text-[#EA1D2C]", glow: "shadow-red-500/10" 
    },
  ];

  const navItems = [
    { id: 'dashboard' as const, label: t.menu.overview, icon: LayoutDashboard },
    { id: 'operacao' as const, label: t.menu.management, icon: ListTodo },
    { id: 'feedbacks' as const, label: t.menu.reviews, icon: MessageSquare },
  ];

  return (
    <div className="flex h-screen bg-[#F8FAFC] dark:bg-[#0A0A0B] overflow-hidden font-sans transition-colors duration-500">
      
      {/* SIDEBAR */}
      <aside className={`bg-white dark:bg-[#111113] border-r border-slate-200 dark:border-white/5 flex flex-col transition-all duration-500 ease-in-out shrink-0 z-30 ${isSidebarOpen ? 'w-72' : 'w-24'}`}>
        <div className="h-24 flex items-center px-6 border-b dark:border-white/5">
          <div className="relative w-10 h-10 shrink-0">
            <Image src="/IfoodVetor.svg" alt="iFood Logo" fill className="object-contain" priority />
          </div>
          {isSidebarOpen && <span className="ml-3 font-black text-xl tracking-tighter dark:text-white uppercase">Dashboard Pro</span>}
        </div>

        <nav className="p-4 space-y-3 mt-4 flex-1">
          {navItems.map((item) => (
            <button 
              key={item.id}
              onClick={() => setActiveMenu(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all group relative ${activeMenu === item.id ? 'bg-[#EA1D2C] text-white shadow-xl shadow-red-500/20' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'}`}
            >
              <item.icon size={22} strokeWidth={activeMenu === item.id ? 2.5 : 2} />
              {isSidebarOpen && <span className="font-bold text-sm tracking-wide">{item.label}</span>}
              {!isSidebarOpen && activeMenu === item.id && (
                <div className="absolute left-0 w-1 h-8 bg-white rounded-r-full" />
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t dark:border-white/5">
          <button onClick={handleLogout} className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-slate-400 hover:text-red-500 transition-all ${!isSidebarOpen && 'justify-center'}`}>
            <LogOut size={20} />
            {isSidebarOpen && <span className="font-bold text-sm">{t.menu.logout}</span>}
          </button>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <main className="flex-1 overflow-y-auto relative custom-scrollbar">
        <div className="max-w-[1600px] mx-auto p-6 lg:p-10">
          
          <header className="mb-12 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-3 rounded-xl bg-white dark:bg-white/5 border dark:border-white/10 hover:scale-105 transition-transform"
              >
                {isSidebarOpen ? <ChevronLeft size={20} /> : <Menu size={20} />}
              </button>
              <div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                  {activeMenu === 'dashboard' ? t.header.overview : activeMenu === 'operacao' ? t.header.orderTracking : t.header.reviews}
                </h1>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mt-1 flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span> {t.header.realTime}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
              <div className="bg-white dark:bg-white/5 p-1.5 rounded-2xl border dark:border-white/10 flex gap-1 shadow-sm">
                {(['hoje', '7dias', 'mensal'] as const).map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setPeriodo(opt)}
                    className={`px-5 py-2.5 text-[10px] font-black uppercase rounded-xl transition-all ${periodo === opt ? 'bg-[#EA1D2C] text-white shadow-lg' : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'}`}
                  >
                    {opt === 'hoje' ? (lang === 'en' ? 'Today' : 'Hoje') : opt === '7dias' ? (lang === 'en' ? '7 Days' : '7 Dias') : (lang === 'en' ? '30 Days' : '30 Dias')}
                  </button>
                ))}
              </div>
              <LanguageToggle /> {/* ✅ BOTÃO DE IDIOMA INCLUÍDO */}
              <ThemeToggle />
              <SimularPedidoButton />
            </div>
          </header>

          <div id="area-relatorio" className={`transition-all duration-700 ${isFiltering ? 'blur-sm opacity-50' : 'opacity-100'}`}>
            
            {activeMenu === 'dashboard' && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
                  {cards.map((card, idx) => (
                    <div key={idx} className={`bg-white dark:bg-[#111113] p-8 rounded-4xl border dark:border-white/5 shadow-xl ${card.glow} hover:translate-y-[-4px] transition-all duration-300 group`}>
                      <div className="flex justify-between items-center mb-6">
                        <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">{card.title}</span>
                        <div className={`p-3 rounded-2xl bg-slate-50 dark:bg-white/5 ${card.color} group-hover:scale-110 transition-transform`}><card.icon size={20} /></div>
                      </div>
                      <div className="text-3xl font-black tracking-tighter dark:text-white">{card.value}</div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 auto-rows-fr">
                  {config.chartOrder.map((chartId) => renderChart(chartId))}
                </div>

                <div className="mt-10 flex justify-end items-center gap-4">
                  <ExportButton targetId="area-relatorio" />
                  <button 
                    onClick={() => setIsMetaModalOpen(true)} 
                    className="group px-6 py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:scale-[1.02] transition-all flex items-center gap-3 shadow-sm"
                  >
                    <Target size={16} className="text-[#EA1D2C]" />
                    {lang === 'en' ? "Set Annual Target" : "Definir Meta Anual"}
                  </button>
                  <DashboardSettings config={config} setConfig={setConfig} />
                </div>
              </>
            )}

            {activeMenu === 'operacao' && (
              <div className="bg-white dark:bg-[#111113] p-8 rounded-4xl border dark:border-white/5 shadow-xl min-h-[75vh]">
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