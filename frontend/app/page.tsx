"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { 
  getDashboardStats, 
  getFinanceiro, 
  getVendasDiarias, 
  getTopProdutos, 
  getStatsBairros,
  getStatsHorarios,
  getStatsPagamentos 
} from "../services/api";
import { 
  DollarSign, 
  ShoppingBag, 
  TrendingUp, 
  Percent, 
  Loader2,
  LayoutDashboard 
} from "lucide-react";

import SalesChart from "../components/SalesChart";
import TopProducts from "../components/TopProducts";
import BairrosChart from "../components/BairrosChart";
import HorariosChart from "../components/HorariosChart";
import PagamentosChart from "../components/PagamentosChart";
import SimularPedidoButton from "../components/SimularPedidoButton";
import ThemeToggle from "../components/ThemeToggle";
import DashboardSettings, { DashboardConfig, ChartSize } from "../components/DashboardSettings";

interface Stats {
  faturamento_total: number;
  total_pedidos: number;
  ticket_medio: number;
}

interface Financeiro {
  lucro_liquido: number;
  margem_percentual: string;
}

interface VendaDiaria {
  data: string;
  valor: number;
}

interface TopProduto {
  nome: string;
  quantidade: number;
  receita: number;
}

interface BairroData {
  bairro: string;
  pedidos: number;
}

interface HorarioData {
  hora: string;
  pedidos: number;
}

interface PagamentoData {
  tipo: string;
  valor: number;
}

interface DashboardData {
  stats: Stats;
  financeiro: Financeiro;
  vendasDiarias: VendaDiaria[];
  topProdutos: TopProduto[];
  bairros: BairroData[];
  horarios: HorarioData[];
  pagamentos: PagamentoData[];
}

type PeriodoType = 'hoje' | 'ontem' | '7dias';

export default function Dashboard() {
  const [config, setConfig] = useState<DashboardConfig>({
    showSales: true, salesSize: 'M',
    showTopProducts: true, topProductsSize: 'P',
    showBairros: true, bairrosSize: 'M',
    showPagamentos: true, pagamentosSize: 'P',
    showHorarios: true, horariosSize: 'G',
  });

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  
  // ESTADOS DO FILTRO
  const [periodo, setPeriodo] = useState<PeriodoType>('7dias');
  const [isFiltering, setIsFiltering] = useState(false);

  const sizeMap: Record<ChartSize, string> = {
    P: "lg:col-span-1",
    M: "lg:col-span-2",
    G: "lg:col-span-3"
  };

  useEffect(() => {
    async function loadAllData() {
      // Se já temos dados na tela, ativamos apenas o esmaecimento do filtro
      if (data) setIsFiltering(true);

      try {
        const [stats, financeiro, vendasDiarias, topProdutos, bairros, horarios, pagamentos] = await Promise.all([
          getDashboardStats(periodo),
          getFinanceiro(periodo),
          getVendasDiarias(periodo),
          getTopProdutos(periodo),
          getStatsBairros(periodo),
          getStatsHorarios(periodo),
          getStatsPagamentos(periodo)
        ]);
        
        setData({ stats, financeiro, vendasDiarias, topProdutos, bairros, horarios, pagamentos });
      } catch (error) {
        console.error("Erro na sincronização:", error);
      } finally {
        setLoading(false);
        setIsFiltering(false); // Desliga a animação de filtro
      }
    }
    
    // O useEffect agora dispara toda vez que a variável 'periodo' mudar
    loadAllData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [periodo]); 

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#111111] flex flex-col items-center justify-center gap-6">
        <Image src="/IfoodVetor.svg" alt="iFood" width={120} height={50} priority />
        <div className="flex items-center gap-2 text-slate-400 font-bold tracking-[0.2em] text-xs uppercase">
          <Loader2 className="animate-spin" size={16} />
          Sincronizando Engine
        </div>
      </div>
    );
  }

  const cards = [
    { title: "Faturamento Bruto", value: `R$ ${data.stats.faturamento_total.toLocaleString('pt-BR')}`, icon: DollarSign, color: "text-emerald-500 bg-emerald-500/10" },
    { title: "Lucro Líquido", value: `R$ ${data.financeiro.lucro_liquido.toLocaleString('pt-BR')}`, icon: TrendingUp, color: "text-blue-500 bg-blue-500/10" },
    { title: "Total Pedidos", value: data.stats.total_pedidos, icon: ShoppingBag, color: "text-purple-500 bg-purple-500/10" },
    { title: "Margem Real", value: data.financeiro.margem_percentual, icon: Percent, color: "text-[#EA1D2C] bg-[#EA1D2C]/10" },
  ];

  const filterOptions: { id: PeriodoType; label: string }[] = [
    { id: 'hoje', label: 'Hoje' },
    { id: 'ontem', label: 'Ontem' },
    { id: '7dias', label: '7 Dias' }
  ];

  return (
    <main className="p-4 md:p-8 bg-slate-50 dark:bg-[#111111] min-h-screen transition-colors duration-300 font-sans relative overflow-x-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        
        <header className="mb-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex items-center gap-6">
            <Image src="/IfoodVetor.svg" alt="iFood Logo" width={110} height={45} className="object-contain" priority />
            <div className="h-10 w-px bg-slate-200 dark:bg-[#2C2C2E] hidden sm:block"></div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase leading-none">Dashboard Pro</h1>
              <p className="text-slate-500 dark:text-[#8E8E93] text-[10px] font-black uppercase tracking-[0.3em] mt-1.5 flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                Engine Online
              </p>
            </div>
          </div>
          
          {/* NOVA ÁREA DE CONTROLES: Filtro + Personalização */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto justify-end">
            
            {/* COMPONENTE DE FILTRO DE DATA */}
            <div className="flex items-center bg-white dark:bg-[#1C1C1E] p-1 rounded-xl border border-slate-200 dark:border-[#2C2C2E] shadow-sm w-full sm:w-auto overflow-x-auto">
              {filterOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setPeriodo(opt.id)}
                  disabled={isFiltering}
                  className={`flex-1 sm:flex-none px-4 py-2 text-[11px] sm:text-xs font-bold rounded-lg transition-all duration-300 uppercase tracking-wide whitespace-nowrap ${
                    periodo === opt.id 
                      ? 'bg-[#EA1D2C] text-white shadow-md' 
                      : 'text-slate-500 hover:text-slate-800 dark:text-[#8E8E93] dark:hover:text-white hover:bg-slate-50 dark:hover:bg-[#242426]'
                  } ${isFiltering ? 'opacity-50 cursor-wait' : ''}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="h-8 w-px bg-slate-200 dark:bg-[#2C2C2E] hidden sm:block"></div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              <DashboardSettings config={config} setConfig={setConfig} />
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <SimularPedidoButton />
              </div>
            </div>
          </div>
        </header>
        
        {/* CONTAINER COM EFEITO DE TRANSIÇÃO QUANDO FILTRA */}
        <div className={`transition-opacity duration-500 ${isFiltering ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {cards.map((card, index) => (
              <div key={index} className="bg-white dark:bg-[#1C1C1E] p-6 rounded-[24px] border border-slate-100 dark:border-[#2C2C2E] shadow-sm hover:border-[#EA1D2C]/20 transition-all group">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-slate-500 dark:text-[#8E8E93] text-xs font-bold uppercase tracking-wider">{card.title}</span>
                  <div className={`${card.color} p-2.5 rounded-xl transition-transform group-hover:scale-110`}>
                    <card.icon size={18} />
                  </div>
                </div>
                <div className="text-3xl font-bold text-slate-900 dark:text-white tracking-tighter">{card.value}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {config.showSales && (
              <div className={`${sizeMap[config.salesSize]} bg-white dark:bg-[#1C1C1E] p-8 rounded-4xl border border-slate-100 dark:border-[#2C2C2E] h-120 transition-all duration-500`}>
                <SalesChart data={data.vendasDiarias} />
              </div>
            )}

            {config.showTopProducts && (
              <div className={`${sizeMap[config.topProductsSize]} bg-white dark:bg-[#1C1C1E] p-8 rounded-4xl border border-slate-100 dark:border-[#2C2C2E] h-120 transition-all duration-500`}>
                <TopProducts data={data.topProdutos} />
              </div>
            )}

            {config.showBairros && (
              <div className={`${sizeMap[config.bairrosSize]} bg-white dark:bg-[#1C1C1E] p-8 rounded-4xl border border-slate-100 dark:border-[#2C2C2E] h-120 transition-all duration-500`}>
                <BairrosChart data={data.bairros} />
              </div>
            )}

            {config.showPagamentos && (
              <div className={`${sizeMap[config.pagamentosSize]} bg-white dark:bg-[#1C1C1E] p-8 rounded-4xl border border-slate-100 dark:border-[#2C2C2E] h-120 transition-all duration-500`}>
                <PagamentosChart data={data.pagamentos} />
              </div>
            )}

            {config.showHorarios && (
              <div className={`${sizeMap[config.horariosSize]} bg-white dark:bg-[#1C1C1E] p-8 rounded-4xl border border-slate-100 dark:border-[#2C2C2E] h-120 transition-all duration-500`}>
                <HorariosChart data={data.horarios} />
              </div>
            )}

            {(!config.showSales && !config.showTopProducts && !config.showBairros && !config.showHorarios && !config.showPagamentos) && (
              <div className="lg:col-span-3 flex flex-col items-center justify-center p-24 border-4 border-dashed border-slate-100 dark:border-[#2C2C2E] rounded-4xl opacity-40">
                <LayoutDashboard size={64} className="text-slate-300 mb-6" />
                <h3 className="text-xl font-bold text-slate-400">Nenhum módulo ativo</h3>
                <p className="text-slate-500 mt-2">Personalize sua visão clicando no botão no topo.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}