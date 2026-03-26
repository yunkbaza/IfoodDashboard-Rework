"use client";

import { useState, useEffect } from "react";
import { X, Target, Trophy, ArrowUpRight, Loader2 } from "lucide-react";
// ✅ IMPORT: Using the exported type from your API service
import { getMetaAnual, type MetaAnualData } from "../services/api";
import { toast } from "sonner";

export default function MetaAnualModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  // ✅ TS FIX: Strict typing instead of 'any'
  const [data, setData] = useState<MetaAnualData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    // ✅ REACT FIX: Isolated async function to prevent cascading renders
    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await getMetaAnual();
        setData(result);
      } catch (error) {
        toast.error("Error loading targets");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    // ✅ TW FIX: z-[100] -> z-100
    <div className="fixed inset-0 z-100 flex items-center justify-center p-6 bg-[#0A0A0B]/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="bg-white dark:bg-[#111113] w-full max-w-2xl rounded-[48px] border border-slate-200 dark:border-white/10 shadow-[0_32px_128px_-12px_rgba(0,0,0,0.5)] overflow-hidden relative animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
        
        {/* Management Header */}
        <div className="p-10 pb-6 flex justify-between items-start border-b dark:border-white/5">
          <div className="flex items-center gap-4">
            {/* ✅ TW FIX: rounded-[24px] -> rounded-3xl */}
            <div className="bg-[#EA1D2C]/10 p-4 rounded-3xl text-[#EA1D2C]">
              <Target size={32} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">Target Dashboard</h2>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em]">Fiscal Year {new Date().getFullYear()}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 text-slate-400 hover:text-red-500 transition-all">
            <X size={24}/>
          </button>
        </div>

        <div className="p-10">
          {loading || !data ? (
            <div className="h-64 flex flex-col items-center justify-center gap-4">
              <Loader2 className="animate-spin text-[#EA1D2C]" size={40} />
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Synchronizing Targets...</p>
            </div>
          ) : (
            <div className="space-y-10">
              {/* MAIN KPIs */}
              <div className="grid grid-cols-2 gap-6">
                {/* ✅ TW FIX: rounded-[32px] -> rounded-4xl */}
                <div className="bg-slate-50 dark:bg-white/5 p-8 rounded-4xl border dark:border-white/5">
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">Annual Target</p>
                  <p className="text-3xl font-black dark:text-white tracking-tighter">$ {data.valor_meta.toLocaleString('en-US')}</p>
                </div>
                {/* ✅ TW FIX: rounded-[32px] -> rounded-4xl */}
                <div className="bg-slate-50 dark:bg-white/5 p-8 rounded-4xl border dark:border-white/5 relative overflow-hidden group">
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">Achieved</p>
                  <p className="text-3xl font-black text-emerald-500 tracking-tighter">$ {data.valor_atual.toLocaleString('en-US')}</p>
                  <ArrowUpRight className="absolute -right-2 -bottom-2 text-emerald-500/10 group-hover:text-emerald-500/20 transition-colors" size={100} />
                </div>
              </div>

              {/* VISUAL PROGRESS */}
              <div className="space-y-6">
                <div className="flex justify-between items-end">
                  <span className="text-xs font-black dark:text-white uppercase tracking-[0.2em]">Target Completion</span>
                  <span className="text-5xl font-black text-[#EA1D2C] tracking-tighter">{data.percentual}%</span>
                </div>
                <div className="h-8 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden p-2 border dark:border-white/10 relative">
                  <div 
                    // ✅ TW FIX: bg-gradient-to-r -> bg-linear-to-r (v4)
                    className="h-full bg-linear-to-r from-[#EA1D2C] to-[#FF4D5A] rounded-full shadow-[0_0_25px_rgba(234,29,44,0.4)] transition-all duration-1000 ease-out"
                    style={{ width: `${data.percentual}%` }}
                  />
                </div>
              </div>

              {/* ACTION FOOTER */}
              <div className="pt-6">
                {/* ✅ TW FIX: rounded-[24px] -> rounded-3xl */}
                <button className="w-full py-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-3xl font-black uppercase text-xs tracking-[0.2em] hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-black/20 flex items-center justify-center gap-3">
                  <Trophy size={18} /> Reset Growth Parameters
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}