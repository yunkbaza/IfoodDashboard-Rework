"use client";

import { useState } from "react";
import { PlusCircle, Loader2 } from "lucide-react";
import { simularPedido } from "../services/api";
import { toast } from "sonner";
import { useLanguage } from "../contexts/LanguageContext"; // ✅ Importado

export default function SimularPedidoButton() {
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage(); // ✅ Hook de tradução ativado

  const handleSimularPedido = async () => {
    setLoading(true);
    try {
      await simularPedido();
      toast.success(t.simulate.success); // ✅ Traduzido
      
      window.location.reload(); 
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(t.simulate.errorApi); // ✅ Traduzido
      } else {
        toast.error(t.simulate.errorUnknown); // ✅ Traduzido
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleSimularPedido}
      disabled={loading}
      className="group flex items-center gap-2 bg-[#111113] dark:bg-[#EA1D2C] text-white hover:bg-black dark:hover:bg-[#EA1D2C] dark:hover:text-white px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm hover:shadow-[0_0_20px_rgba(234,29,44,0.4)] disabled:opacity-50 disabled:hover:bg-[#111113] hover:scale-[1.02] active:scale-95"
    >
      {loading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <PlusCircle size={16} className="group-hover:rotate-90 transition-transform duration-300" />
      )}
      <span>{loading ? t.simulate.processing : t.simulate.button}</span> {/* ✅ Traduzido */}
    </button>
  );
}