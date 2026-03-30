"use client";

import { useState, useEffect } from "react";
import { X, Target, Trophy, ArrowUpRight, Loader2 } from "lucide-react";
import { getMetaAnual, type MetaAnualData } from "../services/api";
import { toast } from "sonner";
import { useLanguage } from "../contexts/LanguageContext";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  lojaId?: number;
}

export default function MetaAnualModal({ isOpen, onClose, lojaId }: Props) {
  const { lang, formatCurrency } = useLanguage();
  const [data, setData] = useState<MetaAnualData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await getMetaAnual(lojaId);
        setData(result);
      } catch (error) {
        toast.error(lang === 'en' ? "Error loading targets" : "Erro ao carregar metas");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isOpen, lojaId, lang]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-6 bg-[#0A0A0B]/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="bg-white dark:bg-[#111113] w-full max-w-2xl rounded-[48px] border border-slate-200 dark:border-white/10 shadow-[0_32px_128px_-12px_rgba(0,0,0,0.5)] overflow-hidden relative animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
        
        <div className="p-10 pb-6 flex justify-between items-start border-b dark:border-white/5">
          <div className="flex items-center gap-4">
            <div className="bg-[#EA1D2C]/10 p-4 rounded-3xl text-[#EA1D2C]">
              <Target size={32} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">
                {lang === 'en' ? 'Target Dashboard' : 'Painel de Metas'}
              </h2>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] mt-1.5">
                {lojaId ? (lang === 'en' ? 'Store Unit Target' : 'Meta da Unidade') : (lang === 'en' ? 'Consolidated Group' : 'Consolidado do Grupo')}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 text-slate-400 hover:text-[#EA1D2C] transition-all">
            <X size={24}/>
          </button>
        </div>

        <div className="p-10">
          {loading || !data ? (
            <div className="h-64 flex flex-col items-center justify-center gap-4">
              <Loader2 className="animate-spin text-[#EA1D2C]" size={40} />
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest animate-pulse">
                {lang === 'en' ? 'Synchronizing Targets...' : 'Sincronizando Metas...'}
              </p>
            </div>
          ) : (
            <div className="space-y-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-slate-50 dark:bg-white/5 p-8 rounded-4xl border dark:border-white/5">
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4 italic">
                    {lang === 'en' ? 'Annual Target' : 'Meta Anual'}
                  </p>
                  <p className="text-3xl font-black dark:text-white tracking-tighter">
                    {formatCurrency(data.valor_meta)}
                  </p>
                </div>
                <div className="bg-slate-50 dark:bg-white/5 p-8 rounded-4xl border dark:border-white/5 relative overflow-hidden group">
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4 italic">
                    {lang === 'en' ? 'Achieved' : 'Alcançado'}
                  </p>
                  <p className="text-3xl font-black text-emerald-500 tracking-tighter">
                    {formatCurrency(data.valor_atual)}
                  </p>
                  <ArrowUpRight className="absolute -right-2 -bottom-2 text-emerald-500/10 group-hover:text-emerald-500/20 transition-colors" size={100} />
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex justify-between items-end">
                  <span className="text-xs font-black dark:text-white uppercase tracking-[0.2em]">
                    {lang === 'en' ? 'Target Completion' : 'Progresso da Meta'}
                  </span>
                  <span className="text-5xl font-black text-[#EA1D2C] tracking-tighter italic">
                    {data.percentual}%
                  </span>
                </div>
                <div className="h-8 w-full bg-slate-100 dark:bg-white/5 rounded-full p-2 border dark:border-white/10 relative">
                  <div 
                    className="h-full bg-linear-to-r from-[#EA1D2C] to-[#FF4D5A] rounded-full shadow-[0_0_25px_rgba(234,29,44,0.4)] transition-all duration-1000 ease-out"
                    style={{ width: `${data.percentual}%` }}
                  />
                </div>
              </div>

              <div className="pt-6">
                <button className="group w-full py-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-3xl font-black uppercase text-xs tracking-[0.2em] hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-black/20 flex items-center justify-center gap-3">
                  <Trophy size={18} className="text-[#EA1D2C] group-hover:scale-110 transition-transform" /> 
                  {lang === 'en' ? 'Reset Growth Parameters' : 'Resetar Parâmetros de Crescimento'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}