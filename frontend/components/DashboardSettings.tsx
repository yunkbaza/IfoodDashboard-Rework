"use client";

import { useState } from "react";
import { 
  Settings2, X, ChevronUp, ChevronDown, 
  Target, Percent, User, LayoutGrid, Save 
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { toast } from "sonner";

export type ChartSize = 'P' | 'M' | 'G';

// ✅ Interface consolidada com campos de negócio e perfil
export interface DashboardConfig {
  showSales: boolean; salesSize: ChartSize;
  showTopProducts: boolean; topProductsSize: ChartSize;
  showBairros: boolean; bairrosSize: ChartSize;
  showHorarios: boolean; horariosSize: ChartSize;
  showPagamentos: boolean; pagamentosSize: ChartSize;
  chartOrder: string[];
  annualGoal: number;
  ifoodFee: number;
  userName: string;
  userEmail: string;
}

interface Props {
  config: DashboardConfig;
  setConfig: (config: DashboardConfig) => void;
}

type Tab = 'layout' | 'business' | 'profile';

export default function DashboardSettings({ config, setConfig }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('layout');
  const { lang } = useLanguage();

  const labels: Record<string, string> = {
    sales: lang === 'en' ? "Sales Trend" : "Evolução de Vendas",
    topProducts: lang === 'en' ? "Top Products" : "Top Produtos",
    bairros: lang === 'en' ? "Delivery Regions" : "Regiões de Entrega",
    horarios: lang === 'en' ? "Peak Hours" : "Fluxo de Horários",
    pagamentos: lang === 'en' ? "Payment Methods" : "Métodos de Pagamento"
  };

  // ✅ Lógica de Visibilidade
  const toggleChart = (id: string) => {
    const key = `show${id.charAt(0).toUpperCase() + id.slice(1)}` as keyof DashboardConfig;
    setConfig({ ...config, [key]: !config[key] });
  };

  // ✅ Lógica de Tamanho
  const changeSize = (id: string, size: ChartSize) => {
    const key = `${id}Size` as keyof DashboardConfig;
    setConfig({ ...config, [key]: size });
  };

  // ✅ Lógica de Reordenação (Subir/Descer)
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

  const handleSave = () => {
    toast.success(lang === 'en' ? "Settings saved!" : "Configurações salvas!");
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="group px-6 py-3.5 bg-white dark:bg-white/5 border dark:border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-white/10 transition-all shadow-sm flex items-center gap-3"
      >
        <Settings2 size={16} className={`transition-transform duration-500 ${isOpen ? 'rotate-180 text-[#EA1D2C]' : 'text-slate-400'}`} />
        <span className="dark:text-white">{lang === 'en' ? "Control Center" : "Central de Controle"}</span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute bottom-full right-0 mb-4 w-[400px] bg-white/95 dark:bg-[#111113]/98 backdrop-blur-3xl border border-slate-200 dark:border-white/10 rounded-[40px] shadow-[0_32px_80px_rgba(0,0,0,0.5)] z-50 overflow-hidden animate-in fade-in zoom-in slide-in-from-bottom-8 duration-500">
            
            {/* HEADER */}
            <div className="p-8 border-b dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-white/[0.02]">
              <div>
                <h3 className="text-sm font-black dark:text-white uppercase tracking-tighter">Configurações</h3>
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Painel Administrativo</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-full transition-colors">
                <X size={20}/>
              </button>
            </div>

            {/* TABS NAVIGATION */}
            <div className="flex p-2 gap-1 bg-slate-100 dark:bg-white/5 m-4 rounded-2xl">
              {(['layout', 'business', 'profile'] as Tab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all ${
                    activeTab === tab 
                    ? 'bg-white dark:bg-[#1C1C1E] text-[#EA1D2C] shadow-sm' 
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {tab === 'layout' && <LayoutGrid size={14} />}
                  {tab === 'business' && <Target size={14} />}
                  {tab === 'profile' && <User size={14} />}
                  {tab}
                </button>
              ))}
            </div>

            {/* CONTENT AREA */}
            <div className="p-6 pt-2 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
              
              {/* TAB 1: LAYOUT DA GRADE (Incluindo Reordenação) */}
              {activeTab === 'layout' && (
                <div className="space-y-3">
                  {config.chartOrder.map((chartId, index) => {
                    const showKey = `show${chartId.charAt(0).toUpperCase() + chartId.slice(1)}` as keyof DashboardConfig;
                    const sizeKey = `${chartId}Size` as keyof DashboardConfig;
                    const isVisible = config[showKey] as boolean;
                    return (
                      <div key={chartId} className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border dark:border-white/5 flex flex-col gap-3 group">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex flex-col opacity-20 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => moveUp(index)} disabled={index === 0} className="hover:text-[#EA1D2C] disabled:opacity-0 transition-colors">
                                <ChevronUp size={16} />
                              </button>
                              <button onClick={() => moveDown(index)} disabled={index === config.chartOrder.length - 1} className="hover:text-[#EA1D2C] disabled:opacity-0 transition-colors">
                                <ChevronDown size={16} />
                              </button>
                            </div>
                            <span className="text-xs font-bold dark:text-slate-200">{labels[chartId]}</span>
                          </div>
                          <button
                            onClick={() => toggleChart(chartId)}
                            className={`w-10 h-5 rounded-full relative transition-all ${isVisible ? 'bg-[#EA1D2C]' : 'bg-slate-300 dark:bg-slate-700'}`}
                          >
                            <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${isVisible ? 'left-6' : 'left-1'}`} />
                          </button>
                        </div>
                        {isVisible && (
                          <div className="flex gap-1 bg-white dark:bg-black/20 p-1 rounded-xl border dark:border-white/5">
                            {(['P', 'M', 'G'] as ChartSize[]).map((s) => (
                              <button
                                key={s}
                                onClick={() => changeSize(chartId, s)}
                                className={`flex-1 py-1.5 text-[10px] font-black rounded-lg transition-all ${
                                  config[sizeKey] === s 
                                  ? 'bg-[#EA1D2C] text-white shadow-sm' : 'text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                }`}
                              >
                                {s === 'P' ? 'SM' : s === 'M' ? 'MD' : 'LG'}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* TAB 2: NEGÓCIO (Metas e Taxas) */}
              {activeTab === 'business' && (
                <div className="space-y-4">
                  <div className="p-5 rounded-3xl bg-slate-50 dark:bg-white/5 border dark:border-white/5">
                    <div className="flex items-center gap-2 mb-4 text-[#EA1D2C]">
                      <Target size={18} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Metas e Faturamento</span>
                    </div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Meta Anual de Vendas (R$)</label>
                    <input 
                      type="number"
                      value={config.annualGoal}
                      onChange={(e) => setConfig({...config, annualGoal: Number(e.target.value)})}
                      className="w-full bg-white dark:bg-[#0A0A0B] border dark:border-white/10 rounded-xl px-4 py-3 text-sm font-black dark:text-white focus:ring-2 ring-[#EA1D2C]/20 outline-none"
                    />
                  </div>

                  <div className="p-5 rounded-3xl bg-slate-50 dark:bg-white/5 border dark:border-white/5">
                    <div className="flex items-center gap-2 mb-4 text-emerald-500">
                      <Percent size={18} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Configuração de Taxas</span>
                    </div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Comissão iFood + Operacional (%)</label>
                    <input 
                      type="number"
                      value={config.ifoodFee}
                      onChange={(e) => setConfig({...config, ifoodFee: Number(e.target.value)})}
                      className="w-full bg-white dark:bg-[#0A0A0B] border dark:border-white/10 rounded-xl px-4 py-3 text-sm font-black dark:text-white focus:ring-2 ring-emerald-500/20 outline-none"
                    />
                  </div>
                </div>
              )}

              {/* TAB 3: PERFIL (Dados do Usuário) */}
              {activeTab === 'profile' && (
                <div className="space-y-4">
                  <div className="flex flex-col items-center py-4">
                    <div className="w-20 h-20 rounded-full bg-[#EA1D2C] flex items-center justify-center text-white text-2xl font-black mb-2 shadow-xl shadow-red-500/20">
                      {config.userName ? config.userName.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span className="text-xs font-black dark:text-white uppercase tracking-tighter">{config.userName || 'Utilizador'}</span>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Nome Completo</label>
                      <input 
                        type="text"
                        value={config.userName}
                        onChange={(e) => setConfig({...config, userName: e.target.value})}
                        className="w-full bg-white dark:bg-[#0A0A0B] border dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold dark:text-white outline-none"
                        placeholder="Nome do utilizador"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">E-mail Administrativo</label>
                      <input 
                        type="email"
                        value={config.userEmail}
                        onChange={(e) => setConfig({...config, userEmail: e.target.value})}
                        className="w-full bg-white dark:bg-[#0A0A0B] border dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold dark:text-white outline-none"
                        placeholder="email@empresa.com"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* FOOTER */}
            <div className="p-6 border-t dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] flex gap-3">
              <button 
                onClick={handleSave}
                className="flex-1 bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all"
              >
                <Save size={16} /> Salvar Alterações
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}