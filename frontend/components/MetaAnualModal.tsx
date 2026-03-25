"use client";

import { useState, useEffect } from "react";
import { getMetaAnual } from "../services/api";
import { X, Target, Trophy, TrendingUp, Loader2 } from "lucide-react";

export default function MetaAnualModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [faturamentoAno, setFaturamentoAno] = useState(0);
  const [meta, setMeta] = useState(100000); // Meta Padrão: 100 mil
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      // Carrega a meta guardada no computador do utilizador
      const savedMeta = localStorage.getItem("metaAnual");
      if (savedMeta) setMeta(Number(savedMeta));

      // Busca o faturamento real do backend
      getMetaAnual().then(data => {
        setFaturamentoAno(data.faturamento_anual);
        setLoading(false);
      });
    }
  }, [isOpen]);

  const handleSaveMeta = (valor: number) => {
    setMeta(valor);
    localStorage.setItem("metaAnual", valor.toString());
  };

  if (!isOpen) return null;

  const progresso = Math.min((faturamentoAno / meta) * 100, 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#1C1C1E] w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden border border-slate-100 dark:border-[#2C2C2E] animate-in zoom-in-95 duration-200">
        
        <div className="p-6 bg-slate-50 dark:bg-[#242426] border-b border-slate-100 dark:border-[#2C2C2E] flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 p-2 rounded-xl">
              <Target size={24} />
            </div>
            <div>
              <h2 className="font-black text-slate-900 dark:text-white uppercase tracking-tight">Meta Anual</h2>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Acompanhamento de Vendas</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white bg-white dark:bg-[#1C1C1E] rounded-full shadow-sm">
            <X size={20} />
          </button>
        </div>

        <div className="p-8">
          {loading ? (
            <div className="flex justify-center p-10"><Loader2 className="animate-spin text-slate-400" size={32} /></div>
          ) : (
            <div className="space-y-8">
              <div className="text-center">
                <p className="text-sm font-bold text-slate-500 dark:text-[#8E8E93] mb-1">Faturamento {new Date().getFullYear()}</p>
                <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
                  R$ {faturamentoAno.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </h3>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-500 mb-2 uppercase">
                  <span>Progresso</span>
                  <span className="text-[#EA1D2C]">{progresso.toFixed(1)}%</span>
                </div>
                <div className="h-4 bg-slate-100 dark:bg-[#2C2C2E] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-orange-400 to-[#EA1D2C] rounded-full transition-all duration-1000"
                    style={{ width: `${progresso}%` }}
                  ></div>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-[#242426] p-4 rounded-2xl border border-slate-100 dark:border-[#2C2C2E]">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Definir Nova Meta (R$)</label>
                <div className="flex gap-2">
                  <input 
                    type="number" 
                    value={meta}
                    onChange={(e) => handleSaveMeta(Number(e.target.value))}
                    className="flex-1 bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-[#2C2C2E] rounded-xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#EA1D2C]"
                  />
                </div>
                {progresso >= 100 && (
                  <div className="mt-4 flex items-center gap-2 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-xl text-xs font-bold">
                    <Trophy size={16} /> Meta alcançada! Hora de subir a barra.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}