"use client";

import { Settings2, Check, Maximize2 } from "lucide-react";
import { useState } from "react";

export type ChartSize = 'P' | 'M' | 'G';

// Interface expandida para incluir tamanhos
export interface DashboardConfig {
  showSales: boolean;
  salesSize: ChartSize;
  showTopProducts: boolean;
  topProductsSize: ChartSize;
  showBairros: boolean;
  bairrosSize: ChartSize;
  showHorarios: boolean;
  horariosSize: ChartSize;
  showPagamentos: boolean;
  pagamentosSize: ChartSize;
}

interface SettingsProps {
  config: DashboardConfig;
  setConfig: (config: DashboardConfig) => void;
}

export default function DashboardSettings({ config, setConfig }: SettingsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const options: { id: keyof DashboardConfig; sizeKey: keyof DashboardConfig; label: string }[] = [
    { id: "showSales", sizeKey: "salesSize", label: "Evolução de Vendas" },
    { id: "showTopProducts", sizeKey: "topProductsSize", label: "Top Produtos" },
    { id: "showBairros", sizeKey: "bairrosSize", label: "Regiões/Bairros" },
    { id: "showHorarios", sizeKey: "horariosSize", label: "Horários de Pico" },
    { id: "showPagamentos", sizeKey: "pagamentosSize", label: "Métodos de Pagamento" },
  ];

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2.5 rounded-xl bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-[#2C2C2E] text-slate-700 dark:text-gray-200 hover:bg-slate-50 dark:hover:bg-[#242426] transition-all shadow-sm flex items-center gap-2"
      >
        <Settings2 size={20} />
        <span className="hidden sm:inline font-medium text-sm">Personalizar Painel</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-72 bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-[#2C2C2E] rounded-2xl shadow-2xl z-50 p-4 animate-in fade-in zoom-in duration-200">
          <h3 className="text-xs font-black text-slate-400 dark:text-gray-500 mb-4 px-1 uppercase tracking-widest">Configurações de Layout</h3>
          <div className="space-y-4">
            {options.map((opt) => (
              <div key={opt.id} className="p-2 rounded-xl border border-slate-50 dark:border-[#242426] bg-slate-50/50 dark:bg-[#161618]">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-slate-700 dark:text-gray-200">{opt.label}</span>
                  <button
                    onClick={() => setConfig({ ...config, [opt.id]: !config[opt.id] })}
                    className={`w-10 h-5 rounded-full relative transition-colors ${config[opt.id] ? 'bg-[#EA1D2C]' : 'bg-slate-300 dark:bg-gray-700'}`}
                  >
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${config[opt.id] ? 'left-6' : 'left-1'}`} />
                  </button>
                </div>

                {config[opt.id] && (
                  <div className="flex items-center gap-1 bg-white dark:bg-[#1C1C1E] p-1 rounded-lg border border-slate-100 dark:border-[#2C2C2E]">
                    {(['P', 'M', 'G'] as ChartSize[]).map((s) => (
                      <button
                        key={s}
                        onClick={() => setConfig({ ...config, [opt.sizeKey]: s })}
                        className={`flex-1 py-1 text-[10px] font-black rounded-md transition-all uppercase ${
                          config[opt.sizeKey] === s 
                          ? 'bg-[#EA1D2C] text-white shadow-sm' 
                          : 'text-slate-400 hover:text-slate-600 dark:hover:text-gray-300'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}