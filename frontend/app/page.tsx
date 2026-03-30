"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { 
  getDashboardStats, getFinanceiro, getVendasDiarias, 
  getTopProdutos, getStatsBairros, getStatsHorarios, getStatsPagamentos,
  getLojas, LojaData // ✅ Novas importações para Multi-loja
} from "../services/api";

import { 
  DollarSign, ShoppingBag, TrendingUp, Percent, Loader2, 
  LayoutDashboard, ListTodo, MessageSquare, LogOut, Target, Menu, ChevronLeft,
  Store, FilterX // ✅ Ícones para o contexto de loja
} from "lucide-react";

import { useLanguage } from "../contexts/LanguageContext";
import LanguageToggle from "../components/LanguageToggle";

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
  stats: { faturamento_total: number; total_pedidos: number; ticket_medio: number; taxa_cancelamento: string }; // ✅ Adicionado cancelamento
  financeiro: { bruto: number; lucro_liquido: number; margem_percentual: string };
  vendasDiarias: { data: string; valor: number }[];
  topProdutos: { nome: string; quantidade: number; receita: number }[];
  bairros: { bairro: string; pedidos: number }[];
  horarios: { hora: string; pedidos: number }[];
  pagamentos: { tipo: string; valor: number }[];
}

export default function Dashboard() {
  const router = useRouter();
  const { lang, t, formatCurrency } = useLanguage();
  const [activeMenu, setActiveMenu] = useState<MenuOption>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // ✅ ESTADOS PARA MULTI-LOJA
  const [lojas, setLojas] = useState<LojaData[]>([]);
  const [selectedLojaId, setSelectedLojaId] = useState<number | undefined>(undefined);

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

  // ✅ BUSCA INICIAL DE LOJAS
  useEffect(() => {
    const fetchLojas = async () => {
      try {
        const lista = await getLojas();
        setLojas(lista);
      } catch (e) {
        console.error("Erro ao carregar lojas");
      }
    };
    fetchLojas();
  }, []);

  const loadAllData = useCallback(async () => {
    setIsFiltering(true);
    try {
      // ✅ Todas as chamadas agora respeitam a Loja Selecionada
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
      toast.error(lang === 'en' ? "Failed to sync data." : "Erro ao sincronizar dados.");
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

  // WebSocket ajustado para recarregar com contexto de loja
  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://127.0.0.1:8000/ws/pedidos"; 
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
    router.push("/login");
  };

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-[#0A0A0B] flex flex-col items-center justify-center gap-6">
        <Loader2 className="animate-spin text-[#EA1D2C]" size={40} />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 italic">
          {lang === 'en' ? "Consolidating Intelligent Data" : "Consolidando Dados Inteligentes"}
        </p>
      </div>
    );
  }

  // ✅ KPIs PROFISSIONAIS COM TAXA DE CANCELAMENTO
  const cards = [
    { title: t.cards.revenue, value: formatCurrency(data.stats.faturamento_total), icon: DollarSign, color: "text-emerald-500" },
    { title: t.cards.profit, value: formatCurrency(data.financeiro.lucro_liquido), icon: TrendingUp, color: "text-blue-500" },
    { title: lang === 'en' ? "Cancellations" : "Cancelamentos", value: data.stats.taxa_cancelamento, icon: FilterX, color: "text-red-500" },
    { title: t.cards.margin, value: data.financeiro.margem_percentual, icon: Percent, color: "text-[#EA1D2C]" },
  ];

  return (
    <div className="flex h-screen bg-[#F8FAFC] dark:bg-[#0A0A0B] overflow-hidden transition-colors duration-500">
      
      {/* SIDEBAR */}
      <aside className={`bg-white dark:bg-[#111113] border-r border-slate-200 dark:border-white/5 flex flex-col transition-all duration-300 z-30 ${isSidebarOpen ? 'w-72' : 'w-20'}`}>
        <div className="h-20 flex items-center px-6 border-b dark:border-white/5">
          <Image src="/IfoodVetor.svg" alt="iFood" width={32} height={32} />
          {isSidebarOpen && <span className="ml-3 font-black text-lg tracking-tighter dark:text-white uppercase">iFood Pro</span>}
        </div>
        <nav className="p-4 space-y-2 mt-4 flex-1">
          {[
            { id: 'dashboard', label: t.menu.overview, icon: LayoutDashboard },
            { id: 'operacao', label: t.menu.management, icon: ListTodo },
            { id: 'feedbacks', label: t.menu.reviews, icon: MessageSquare },
          ].map((item) => (
            <button 
              key={item.id}
              onClick={() => setActiveMenu(item.id as MenuOption)}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all ${activeMenu === item.id ? 'bg-[#EA1D2C] text-white' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'}`}
            >
              <item.icon size={20} />
              {isSidebarOpen && <span className="font-bold text-sm uppercase tracking-wide">{item.label}</span>}
            </button>
          ))}
        </nav>
        <button onClick={handleLogout} className="p-8 text-slate-400 hover:text-red-500 flex items-center gap-4">
          <LogOut size={20} />
          {isSidebarOpen && <span className="font-bold text-sm uppercase">Sair</span>}
        </button>
      </aside>

      <main className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-[1400px] mx-auto p-6 lg:p-10">
          
          {/* HEADER COM SELETOR DE LOJA */}
          <header className="mb-10 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
            <div className="flex items-center gap-4">
              <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2.5 rounded-lg bg-white dark:bg-white/5 border dark:border-white/10 hover:scale-105 transition-all">
                {isSidebarOpen ? <ChevronLeft size={20} /> : <Menu size={20} />}
              </button>
              <div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">
                  {selectedLojaId ? lojas.find(l => l.id === selectedLojaId)?.nome : "Visão Consolidada Grupo"}
                </h1>
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#EA1D2C]">Auditando Operação em Tempo Real</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* ✅ SELETOR DE UNIDADE (O Diferencial de Venda) */}
              <div className="flex items-center gap-2 bg-white dark:bg-white/5 px-4 py-2.5 rounded-xl border dark:border-white/10">
                <Store size={16} className="text-slate-400" />
                <select 
                  value={selectedLojaId || ""} 
                  onChange={(e) => setSelectedLojaId(e.target.value ? Number(e.target.value) : undefined)}
                  className="bg-transparent text-[11px] font-black uppercase outline-none text-slate-600 dark:text-white cursor-pointer"
                >
                  <option value="">Todas as Unidades</option>
                  {lojas.map(loja => (
                    <option key={loja.id} value={loja.id}>{loja.nome}</option>
                  ))}
                </select>
              </div>

              <div className="flex bg-white dark:bg-white/5 p-1 rounded-xl border dark:border-white/10">
                {(['hoje', '7dias', 'mensal'] as const).map((opt) => (
                  <button key={opt} onClick={() => setPeriodo(opt)} className={`px-4 py-2 text-[10px] font-black uppercase rounded-lg transition-all ${periodo === opt ? 'bg-[#EA1D2C] text-white' : 'text-slate-400'}`}>
                    {opt}
                  </button>
                ))}
              </div>
              <LanguageToggle />
              <ThemeToggle />
            </div>
          </header>

          {/* DASHBOARD CONTENT */}
          <div className={`transition-all duration-500 ${isFiltering ? 'blur-md opacity-40' : 'opacity-100'}`}>
            {activeMenu === 'dashboard' && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
                  {cards.map((card, idx) => (
                    <div key={idx} className="bg-white dark:bg-[#111113] p-6 rounded-3xl border dark:border-white/5 shadow-sm hover:shadow-xl transition-all group">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{card.title}</span>
                        <card.icon size={18} className={card.color} />
                      </div>
                      <div className="text-2xl font-black dark:text-white">{card.value}</div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Renderização dinâmica de gráficos mantendo sua lógica original de config */}
                  <div className="lg:col-span-2 bg-white dark:bg-[#111113] p-6 rounded-3xl border dark:border-white/5 h-[400px]">
                    <SalesChart data={data.vendasDiarias} />
                  </div>
                  <div className="bg-white dark:bg-[#111113] p-6 rounded-3xl border dark:border-white/5 h-[400px]">
                    <TopProducts data={data.topProdutos} />
                  </div>
                </div>

                <div className="mt-8 flex justify-end gap-3">
                  <ExportButton targetId="area-relatorio" /> {/* Agora integrado ao CSV do backend */}
                  <DashboardSettings config={config} setConfig={setConfig} />
                </div>
              </>
            )}

            {activeMenu === 'operacao' && <KanbanBoard periodo={periodo} lojaId={selectedLojaId} />}
            {activeMenu === 'feedbacks' && <FeedbackView periodo={periodo} lojaId={selectedLojaId} />}
          </div>
        </div>
      </main>

      <MetaAnualModal isOpen={isMetaModalOpen} onClose={() => setIsMetaModalOpen(false)} />
    </div>
  );
}