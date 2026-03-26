"use client";

import { useState } from "react";
import { X, Star, Send, MessageSquarePlus, Loader2 } from "lucide-react";
import { createAvaliacao } from "../services/api";
import { toast } from "sonner";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function SimularAvaliacaoModal({ isOpen, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    cliente: "",
    nota: 5,
    texto: "",
    sentimento: "positivo"
  });

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await createAvaliacao(form);
      toast.success("Avaliação inserida na base de dados!");
      onSuccess();
      onClose();
      setForm({ cliente: "", nota: 5, texto: "", sentimento: "positivo" });
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message || "Erro na validação do servidor.");
      } else {
        toast.error("Erro inesperado ao conectar com a API.");
      }
    } finally {
      setLoading(false);
    }
  }

  // Determine feeling based on stars
  const handleStarClick = (selectedStar: number) => {
    let newSentimento = "neutro";
    if (selectedStar >= 4) newSentimento = "positivo";
    if (selectedStar <= 2) newSentimento = "negativo";
    
    setForm({ ...form, nota: selectedStar, sentimento: newSentimento });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#0A0A0B]/80 backdrop-blur-xl animate-in fade-in duration-300">
      
      <div className="bg-white dark:bg-[#111113] w-full max-w-lg rounded-[48px] border border-slate-200 dark:border-white/10 shadow-[0_32px_128px_-12px_rgba(0,0,0,0.5)] overflow-hidden relative animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
        
        {/* Header Profissional */}
        <div className="p-8 pb-6 flex justify-between items-start border-b dark:border-white/5">
          <div className="flex items-center gap-4">
            <div className="bg-[#EA1D2C]/10 p-3.5 rounded-3xl text-[#EA1D2C]">
              <MessageSquarePlus size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">
                Inserir Avaliação
              </h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-1.5">
                Módulo de Teste de IA
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 rounded-2xl bg-slate-50 dark:bg-white/5 text-slate-400 hover:text-[#EA1D2C] transition-all">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          
          {/* Nome Input */}
          <div className="space-y-2.5">
            <label className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-widest ml-1">
              Identificação do Cliente
            </label>
            <input
              required
              value={form.cliente}
              onChange={e => setForm({...form, cliente: e.target.value})}
              className="w-full bg-slate-50 dark:bg-[#0A0A0B] border border-slate-200 dark:border-white/5 rounded-2xl p-4 text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-[#EA1D2C]/50 focus:border-[#EA1D2C] outline-none transition-all"
              placeholder="Ex: Nome Sobrenome"
            />
          </div>

          {/* Sistema de Estrelas */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between ml-1">
              <label className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-widest">
                Nível de Satisfação
              </label>
              {/* Dynamic Feeling Indicator */}
              <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${
                form.sentimento === 'positivo' ? 'bg-emerald-500/10 text-emerald-500' :
                form.sentimento === 'negativo' ? 'bg-red-500/10 text-red-500' :
                'bg-amber-500/10 text-amber-500'
              }`}>
                {form.sentimento}
              </span>
            </div>
            
            <div className="flex gap-2 p-2 bg-slate-50 dark:bg-[#0A0A0B] border border-slate-200 dark:border-white/5 rounded-2xl w-fit">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleStarClick(star)}
                  className={`p-2.5 rounded-xl transition-all hover:scale-110 active:scale-95 ${
                    form.nota >= star 
                      ? 'text-amber-400 bg-amber-400/10' 
                      : 'text-slate-300 dark:text-slate-600 hover:bg-white/5'
                  }`}
                >
                  <Star size={24} fill={form.nota >= star ? "currentColor" : "none"} strokeWidth={form.nota >= star ? 0 : 2} />
                </button>
              ))}
            </div>
          </div>

          {/* Comentário Textarea */}
          <div className="space-y-2.5">
            <label className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-widest ml-1">
              Relato do Cliente
            </label>
            <textarea
              required
              rows={4}
              value={form.texto}
              onChange={e => setForm({...form, texto: e.target.value})}
              className="w-full bg-slate-50 dark:bg-[#0A0A0B] border border-slate-200 dark:border-white/5 rounded-2xl p-4 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-[#EA1D2C]/50 focus:border-[#EA1D2C] outline-none transition-all resize-none leading-relaxed"
              placeholder="Descreva a experiência com o pedido para alimentar o motor de Inteligência Artificial..."
            />
          </div>

          {/* Action Button */}
          <div className="pt-2">
            <button
              disabled={loading}
              className="group w-full py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[20px] font-black uppercase text-[11px] tracking-[0.2em] hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-black/10 disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin text-[#EA1D2C]" />
                  <span>Transmitindo...</span>
                </>
              ) : (
                <>
                  <Send size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform text-[#EA1D2C]" /> 
                  Submeter ao Sistema
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}