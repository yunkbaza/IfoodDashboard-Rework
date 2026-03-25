"use client";

import { useState } from "react";
import { X, Star, Send, MessageSquarePlus } from "lucide-react";
import { createAvaliacao } from "../services/api";

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
      onSuccess();
      onClose();
      setForm({ cliente: "", nota: 5, texto: "", sentimento: "positivo" });
    } catch (err) {
      alert("Erro ao enviar avaliação!");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#1C1C1E] w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-[#2C2C2E] animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-100 dark:border-[#2C2C2E] flex justify-between items-center bg-slate-50 dark:bg-[#242426]">
          <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
            <MessageSquarePlus className="text-[#EA1D2C]" size={20} />
            Simular Avaliação
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-[#3C3C3E] rounded-xl transition-colors text-slate-400">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="text-[10px] font-black uppercase text-slate-500 mb-2 block tracking-widest">Nome do Cliente</label>
            <input
              required
              value={form.cliente}
              onChange={e => setForm({...form, cliente: e.target.value})}
              className="w-full bg-slate-50 dark:bg-[#2C2C2E] border border-slate-200 dark:border-[#3C3C3E] p-3 rounded-xl text-sm focus:outline-none focus:border-[#EA1D2C] transition-all"
              placeholder="Ex: Allan Gabriel"
            />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase text-slate-500 mb-2 block tracking-widest">Nota (Estrelas)</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setForm({...form, nota: star, sentimento: star >= 4 ? 'positivo' : 'negativo'})}
                  className={`p-2 rounded-lg transition-all ${form.nota >= star ? 'text-yellow-400' : 'text-slate-300'}`}
                >
                  <Star size={24} fill={form.nota >= star ? "currentColor" : "none"} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase text-slate-500 mb-2 block tracking-widest">Comentário</label>
            <textarea
              required
              rows={4}
              value={form.texto}
              onChange={e => setForm({...form, texto: e.target.value})}
              className="w-full bg-slate-50 dark:bg-[#2C2C2E] border border-slate-200 dark:border-[#3C3C3E] p-3 rounded-xl text-sm focus:outline-none focus:border-[#EA1D2C] transition-all resize-none"
              placeholder="Escreva como se fosse o cliente..."
            />
          </div>

          <button
            disabled={loading}
            className="w-full py-4 bg-[#EA1D2C] text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-red-500/20 flex items-center justify-center gap-2"
          >
            {loading ? "Enviando..." : <><Send size={16} /> Enviar Avaliação</>}
          </button>
        </form>
      </div>
    </div>
  );
}