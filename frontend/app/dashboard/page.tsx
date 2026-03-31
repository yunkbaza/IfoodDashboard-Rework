"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";

// ✅ 1. Correção dos caminhos para ../../
import { 
  getLojas, 
  getDashboardStats, getFinanceiro, getVendasDiarias, 
  getTopProdutos, getStatsBairros, getStatsHorarios, getStatsPagamentos 
} from "../../services/api";

import { 
  DollarSign, ShoppingBag, TrendingUp, Percent, Loader2, 
  LayoutDashboard, ListTodo, MessageSquare, LogOut, Target, Menu, ChevronLeft, MapPin,
  AlertTriangle 
} from "lucide-react";

import { useLanguage } from "../../contexts/LanguageContext";
import LanguageToggle from "../../components/LanguageToggle";

import SalesChart from "../../components/SalesChart";
import TopProducts from "../../components/TopProducts";
import BairrosChart from "../../components/BairrosChart";
import HorariosChart from "../../components/HorariosChart";
import PagamentosChart from "../../components/PagamentosChart";
import SimularPedidoButton from "../../components/SimularPedidoButton";
import ThemeToggle from "../../components/ThemeToggle";
import DashboardSettings, { DashboardConfig, ChartSize } from "../../components/DashboardSettings";
import KanbanBoard from "../../components/KanbanBoard";
import FeedbackView from "../../components/FeedbackView"; 
import MetaAnualModal from "../../components/MetaAnualModal";
import ExportButton from "../../components/ExportButton";

type MenuOption = 'dashboard' | 'operacao' | 'feedbacks';

interface Loja {
  id: number;
  nome: string;
}

interface DashboardData {
  stats: { faturamento_total: number; total_pedidos: number; ticket_medio: number; taxa_cancelamento: string };
  financeiro: { bruto: number; lucro_liquido: number; margem_percentual: string };
  vendasDiarias: { data: string; valor: number }[];
  topProdutos: { nome: string; quantidade: number; receita: number }[];
  bairros: { nome: string; valor: number }[];
  horarios: { hora: string; pedidos: number }[];
  pagamentos: { nome: string; valor: number }[];
}

export default function Dashboard() {
  const router = useRouter();
  const { lang, t, formatCurrency } = useLanguage();
  const [activeMenu, setActiveMenu] = useState<MenuOption>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const [lojas, setLojas] = useState<Loja[]>([]);
  const [selectedLojaId, setSelectedLojaId] = useState<number | undefined>(undefined);

  const [config, setConfig] = useState<DashboardConfig>({
    showSales: true, salesSize: 'M', 
    showTopProducts: true, topProductsSize: 'P',
    showBairros: true, bairrosSize: 'M', 
    showPagamentos: true, pagamentosSize: 'P',
    showHorarios: true, horariosSize: 'G',
    chartOrder: ['sales', 'topProducts', 'bairros', 'pagamentos', 'horarios'],
    annualGoal: 500000,
    ifoodFee: 27,
    userName: "Usuário",
    userEmail: "admin@dashboard.com"
  });

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState<'hoje' | '7dias' | 'mensal'>('7dias');
  const [isFiltering, setIsFiltering] = useState(false);
  const [isMetaModalOpen, setIsMetaModalOpen] = useState(false);

  const sizeMap: Record<ChartSize, string> = {
    P: "lg:col-span-1", M: "lg:col-span-2", G: "lg:col-span-3"
  };

  useEffect(() => {
    const fetchLojas = async () => {
      try {
        const lojasData = await getLojas();
        setLojas(lojasData);
      } catch (error) {
        console.error("Erro ao carregar lojas:", error);
      }
    };
    fetchLojas();
  }, []);

  const loadAllData = useCallback(async () => {
    setIsFiltering(true);
    try {
      const [stats, financeiro, vendasDiarias, topProdutos, bairros, horarios, pagamentos] = await Promise.all([
        getDashboardStats(periodo, selectedLojaId), 
        getFinanceiro(periodo, selectedLojaId), 
        getVendasDiarias(periodo, selectedLojaId),
        getTopProdutos(periodo, selectedLojaId), 
        getStatsBairros(periodo, selectedLojaId), 
        getStatsHorarios(periodo, selectedLojaId), 
        getStatsPagamentos(periodo, selectedLojaId)
      ]);
      setData({ stats, financeiro, vendasDiarias, topProdutos, bairros, horarios, pagamentos });
    } catch (error) {
      console.error("Sync error:", error);
      toast.error(lang === 'en' ? "Failed to synchronize data." : "Erro ao sincronizar dados.");
    } finally {
      setLoading(false);
      setIsFiltering(false);
    }
  }, [periodo, selectedLojaId, lang]);

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
      if (socketData.action === "new_order" || socketData.action === "update_status") {
        if (socketData.action === "new_order") {
          toast.success(lang === 'en' ? "New Order Received!" : "Novo Pedido Recebido!", { description: `ID: ${socketData.id_pedido}` });
        }
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
          <div key="sales" className={`${sizeMap[config.salesSize]} bg-white dark:bg-[#111113] p-8 rounded-4xl border dark:border-white/5 shadow-xl flex flex-col min-h-100`}>
            <SalesChart data={data!.vendasDiarias} />
          </div>
        );
      case 'topProducts':
        return config.showTopProducts && (
          <div key="topProducts" className={`${sizeMap[config.topProductsSize]} bg-white dark:bg-[#111113] p-8 rounded-4xl border dark:border-white/5 shadow-xl flex flex-col min-h-100`}>
            <TopProducts data={data!.topProdutos} />
          </div>
        );
      case 'bairros':
        return config.showBairros && (
          <div key="bairros" className={`${sizeMap[config.bairrosSize]} bg-white dark:bg-[#111113] p-8 rounded-4xl border dark:border-white/5 shadow-xl flex flex-col min-h-100`}>
            <BairrosChart data={data!.bairros} />
          </div>
        );
      case 'pagamentos':
        return config.showPagamentos && (
          <div key="pagamentos" className={`${sizeMap[config.pagamentosSize]} bg-white dark:bg-[#111113] p-8 rounded-4xl border dark:border-white/5 shadow-xl flex flex-col min-h-100`}>
            <PagamentosChart data={data!.pagamentos} />
          </div>
        );
      case 'horarios':
        return config.showHorarios && (
          <div key="horarios" className={`${sizeMap[config.horariosSize]} bg-white dark:bg-[#111113] p-8 rounded-4xl border dark:border-white/5 shadow-xl flex flex-col min-h-100`}>
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
        <div className="relative w-32 h-12 animate-pulse">
            <Image src="/IfoodVetor.svg" alt="iFood" fill className="object-contain" priority />
        </div>
        <Loader2 className="animate-spin text-[#EA1D2C]" size={32} />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">
          {lang === 'en' ? "Syncing Platform..." : "Sincronizando Plataforma..."}
        </p>
      </div>
    );
  }

  const taxaCancelamentoClean = data.stats.taxa_cancelamento.replace('%', '').replace(',', '.');
  const margemClean = data.financeiro.margem_percentual.replace('%', '').replace(',', '.');
  
  const isCancelamentoCrítico = parseFloat(taxaCancelamentoClean) > 5;
  const isMargemCrítica = parseFloat(margemClean) < 15;

  const cards = [
    { 
      title: t.cards.revenue, value: formatCurrency(data.stats.faturamento_total), 
      icon: DollarSign, color: "text-emerald-500", glow: "shadow-emerald-500/10",
      isAlert: false
    },
    { 
      title: t.cards.profit, value: formatCurrency(data.financeiro.lucro_liquido), 
      icon: TrendingUp, color: "text-blue-500", glow: "shadow-blue-500/10",
      isAlert: false
    },
    { 
      title: t.cards.orders, value: data.stats.total_pedidos.toLocaleString(lang === 'en' ? 'en-US' : 'pt-BR'), 
      icon: ShoppingBag, color: "text-purple-500", glow: "shadow-purple-500/10",
      isAlert: isCancelamentoCrítico, 
      alertMsg: lang === 'en' ? `High Cancels (${data.stats.taxa_cancelamento})` : `Cancelamento Alto (${data.stats.taxa_cancelamento})`
    },
    { 
      title: t.cards.margin, value: data.financeiro.margem_percentual, 
      icon: Percent, color: "text-[#EA1D2C]", glow: "shadow-red-500/10",
      isAlert: isMargemCrítica,
      alertMsg: lang === 'en' ? 'Critical Margin' : 'Margem Crítica'
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
        <div className="max-w-400 mx-auto p-6 lg:p-10">
          
          <header className="mb-12 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-3 rounded-xl bg-white dark:bg-white/5 border dark:border-white/10 hover:scale-105 transition-transform text-slate-500 dark:text-slate-300"
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
              
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin size={14} className="text-slate-400" />
                </div>
                <select 
                  value={selectedLojaId || ''}
                  onChange={(e) => setSelectedLojaId(e.target.value ? Number(e.target.value) : undefined)}
                  className="appearance-none bg-white dark:bg-white/5 border dark:border-white/10 text-slate-700 dark:text-slate-200 text-[10px] font-black uppercase tracking-widest rounded-2xl pl-9 pr-8 py-3.5 hover:bg-slate-50 dark:hover:bg-white/10 transition-all cursor-pointer shadow-sm outline-none focus:ring-2 focus:ring-[#EA1D2C]/50"
                >
                  <option value="">{lang === 'en' ? 'Consolidated Group' : 'Rede Consolidada'}</option>
                  {lojas.map(loja => (
                    <option key={loja.id} value={loja.id}>{loja.nome}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <ChevronLeft size={14} className="text-slate-400 -rotate-90" />
                </div>
              </div>

              <div className="bg-white dark:bg-white/5 p-1.5 rounded-2xl border dark:border-white/10 flex gap-1 shadow-sm">
                {(['hoje', '7dias', 'mensal'] as const).map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setPeriodo(opt)}
                    className={`px-5 py-2 text-[10px] font-black uppercase rounded-xl transition-all ${periodo === opt ? 'bg-[#EA1D2C] text-white shadow-lg' : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'}`}
                  >
                    {opt === 'hoje' ? (lang === 'en' ? 'Today' : 'Hoje') : opt === '7dias' ? (lang === 'en' ? '7 Days' : '7 Dias') : (lang === 'en' ? '30 Days' : '30 Dias')}
                  </button>
                ))}
              </div>

              <LanguageToggle />
              <ThemeToggle />
              <SimularPedidoButton lojaId={selectedLojaId} /> 
            </div>
          </header>

          <div id="area-relatorio" className={`transition-all duration-700 ${isFiltering ? 'blur-sm opacity-50' : 'opacity-100'}`}>
            
            {activeMenu === 'dashboard' && (
              <div className="space-y-6">
                
                {/* ✅ CARDS COM RENDERIZAÇÃO CONDICIONAL DE ALERTA */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                  {cards.map((card, idx) => (
                    <div 
                      key={idx} 
                      className={`relative bg-white dark:bg-[#111113] p-8 rounded-4xl border transition-all duration-300 group hover:-translate-y-1
                        ${card.isAlert 
                          ? 'border-red-500/50 dark:border-red-500/50 shadow-[0_0_30px_rgba(234,29,44,0.15)]' 
                          : 'border-slate-100 dark:border-white/5 shadow-xl ' + card.glow
                        }
                      `}
                    >
                      {/* 🚨 NOTIFICAÇÃO DE ALERTA (BADGE) */}
                      {card.isAlert && (
                        <div className="absolute -top-3 -right-2 flex items-center gap-1.5 bg-[#EA1D2C] text-white px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg animate-bounce z-10">
                          <AlertTriangle size={12} className="animate-pulse" /> 
                          {card.alertMsg}
                        </div>
                      )}

                      <div className="flex justify-between items-center mb-6">
                        <span className={`text-[11px] font-black uppercase tracking-widest ${card.isAlert ? 'text-red-500/70 dark:text-red-400' : 'text-slate-400'}`}>
                          {card.title}
                        </span>
                        <div className={`p-3 rounded-2xl ${card.isAlert ? 'bg-red-50 dark:bg-red-500/10 text-[#EA1D2C]' : 'bg-slate-50 dark:bg-white/5 ' + card.color} group-hover:scale-110 transition-transform`}>
                          <card.icon size={20} />
                        </div>
                      </div>
                      
                      <div className={`text-3xl font-black tracking-tighter ${card.isAlert ? 'text-[#EA1D2C]' : 'dark:text-white'}`}>
                        {card.value}
                      </div>
                    </div>
                  ))}
                </div>

                {/* ✅ 2. CORREÇÃO DA TIPAGEM DO CHARTID (string) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 auto-rows-fr">
                  {config.chartOrder.map((chartId: string) => renderChart(chartId))}
                </div>

                <div className="mt-8 flex flex-col sm:flex-row justify-end items-center gap-4 bg-white dark:bg-[#111113] p-4 rounded-3xl border dark:border-white/5 shadow-xl">
                  <ExportButton targetId="area-relatorio" periodo={periodo} lojaId={selectedLojaId} />
                  
                  <div className="h-8 w-px bg-slate-200 dark:bg-white/10 hidden sm:block"></div>
                  
                  <button 
                    onClick={() => setIsMetaModalOpen(true)} 
                    className="group px-6 py-3 bg-slate-50 dark:bg-white/5 text-slate-700 dark:text-slate-200 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-100 dark:hover:bg-white/10 transition-all flex items-center gap-3"
                  >
                    <Target size={16} className="text-[#EA1D2C] group-hover:rotate-90 transition-transform duration-500" />
                    {lang === 'en' ? "Performance Targets" : "Metas de Desempenho"}
                  </button>
                  <DashboardSettings config={config} setConfig={setConfig} />
                </div>
              </div>
            )}

            {activeMenu === 'operacao' && (
              <div className="bg-white dark:bg-[#111113] p-8 rounded-4xl border dark:border-white/5 shadow-xl min-h-[75vh]">
                <KanbanBoard periodo={periodo} lojaId={selectedLojaId} />
              </div>
            )}

            {activeMenu === 'feedbacks' && (
              <FeedbackView periodo={periodo} lojaId={selectedLojaId} />
            )}

          </div>
        </div>
      </main>

      <MetaAnualModal 
        isOpen={isMetaModalOpen} 
        onClose={() => setIsMetaModalOpen(false)} 
        lojaId={selectedLojaId} 
      />
    </div>
  );
}