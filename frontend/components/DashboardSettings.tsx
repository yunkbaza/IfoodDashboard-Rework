"use client";

import { useState } from "react";
import { Settings2, X, ChevronUp, ChevronDown } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext"; // ✅ IMPORTADO

export type ChartSize = 'P' | 'M' | 'G';

export interface DashboardConfig {
  showSales: boolean; salesSize: ChartSize;
  showTopProducts: boolean; topProductsSize: ChartSize;
  showBairros: boolean; bairrosSize: ChartSize;
  showHorarios: boolean; horariosSize: ChartSize;
  showPagamentos: boolean; pagamentosSize: ChartSize;
  chartOrder: string[]; 
}

interface Props {
  config: DashboardConfig;
  setConfig: (config: DashboardConfig) => void;
}

export default function DashboardSettings({ config, setConfig }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const { lang } = useLanguage(); // ✅ PEGANDO O IDIOMA ATUAL

  // ✅ DICIONÁRIO DINÂMICO PARA OS NOMES DOS GRÁFICOS
  const labels: Record<string, string> = {
    sales: lang === 'en' ? "Sales Trend" : "Evolução de Vendas",
    topProducts: lang === 'en' ? "Top Products" : "Top Produtos",
    bairros: lang === 'en' ? "Delivery Regions" : "Regiões de Entrega",
    horarios: lang === 'en' ? "Peak Hours" : "Fluxo de Horários",
    pagamentos: lang === 'en' ? "Payment Methods" : "Métodos de Pagamento"
  };

  const sizeLabels: Record<ChartSize, string> = {
    P: "S",
    M: "M",
    G: "L"
  };

  const toggle = (id: string) => {
    const key = `show${id.charAt(0).toUpperCase() + id.slice(1)}` as keyof DashboardConfig;
    setConfig({ ...config, [key]: !config[key] });
  };

  const changeSize = (id: string, size: ChartSize) => {
    const key = `${id}Size` as keyof DashboardConfig;
    setConfig({ ...config, [key]: size });
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newOrder = [...config.chartOrder];
    [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
    setConfig({ ...config, chartOrder: newOrder });
  };

  const moveDown = (index: number) => {
    if (index === config.chartOrder.length - 1) return;
    const newOrder = [...config.chartOrder];
    [newOrder[index + 1], newOrder[index]] = [newOrder[index], newOrder[index + 1]];
    setConfig({ ...config, chartOrder: newOrder });
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="group px-6 py-3.5 bg-white dark:bg-white/5 border dark:border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-white/10 transition-all shadow-sm flex items-center gap-3"
      >
        <Settings2 size={16} className={`transition-transform duration-500 ${isOpen ? 'rotate-180 text-[#EA1D2C]' : 'text-slate-400'}`} />
        <span className="dark:text-white">{lang === 'en' ? "Grid Layout" : "Layout da Grade"}</span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute bottom-full right-0 mb-4 w-[340px] bg-white/95 dark:bg-[#111113]/95 backdrop-blur-3xl border border-slate-200 dark:border-white/10 rounded-[32px] shadow-[0_20px_60px_rgba(0,0,0,0.4)] z-50 p-6 animate-in fade-in zoom-in slide-in-from-bottom-4 duration-300">
            <div className="flex justify-between items-center mb-6">
              <span className="text-[10px] font-black text-[#EA1D2C] uppercase tracking-[0.4em]">
                {lang === 'en' ? "Customize Grid" : "Personalizar Grade"}
              </span>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-red-500 transition-colors"><X size={18}/></button>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              {config.chartOrder.map((chartId, index) => {
                const showKey = `show${chartId.charAt(0).toUpperCase() + chartId.slice(1)}` as keyof DashboardConfig;
                const sizeKey = `${chartId}Size` as keyof DashboardConfig;
                const isVisible = config[showKey] as boolean;

                return (
                  <div key={chartId} className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border dark:border-white/5 flex flex-col gap-3 group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex flex-col opacity-30 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => moveUp(index)} disabled={index === 0} className="hover:text-[#EA1D2C] disabled:opacity-0"><ChevronUp size={14}/></button>
                          <button onClick={() => moveDown(index)} disabled={index === config.chartOrder.length - 1} className="hover:text-[#EA1D2C] disabled:opacity-0"><ChevronDown size={14}/></button>
                        </div>
                        <span className="text-xs font-bold dark:text-slate-200 tracking-tight">{labels[chartId]}</span>
                      </div>
                      
                      <button
                        onClick={() => toggle(chartId)}
                        className={`w-10 h-5 rounded-full relative transition-all ${isVisible ? 'bg-[#EA1D2C]' : 'bg-slate-300 dark:bg-slate-700'}`}
                      >
                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${isVisible ? 'left-6' : 'left-1'}`} />
                      </button>
                    </div>

                    {isVisible && (
                      <div className="flex items-center gap-1 bg-white dark:bg-[#0A0A0B] p-1 rounded-xl border dark:border-white/5">
                        {(['P', 'M', 'G'] as ChartSize[]).map((s) => (
                          <button
                            key={s}
                            onClick={() => changeSize(chartId, s)}
                            className={`flex-1 py-1.5 text-[10px] font-black rounded-lg transition-all uppercase ${
                              config[sizeKey] === s ? 'bg-[#EA1D2C] text-white shadow-md' : 'text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                          >
                            {sizeLabels[s]}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}