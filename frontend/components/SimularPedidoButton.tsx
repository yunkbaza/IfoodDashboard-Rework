"use client";

import { useState } from "react";
import { PlusCircle, Loader2 } from "lucide-react";
import { simularPedido } from "../services/api";
import { toast } from "sonner";
import { useLanguage } from "../contexts/LanguageContext";

interface Props {
  lojaId?: number; // ✅ Adicionado para suporte Multi-loja
}

export default function SimularPedidoButton({ lojaId }: Props) {
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();

  const handleSimularPedido = async () => {
    setLoading(true);
    try {
      // ✅ Envia o lojaId para que o pedido não fique "órfão" no banco
      await simularPedido(lojaId);
      
      toast.success(t.simulate.success, {
        description: lojaId ? "Pedido vinculado à unidade selecionada." : "Pedido gerado na unidade padrão."
      });
      
      // 💡 Removido window.location.reload()
      // O WebSocket no seu Dashboard já detecta o novo pedido e atualiza os gráficos em tempo real!
      
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(t.simulate.errorApi);
      } else {
        toast.error(t.simulate.errorUnknown);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleSimularPedido}
      disabled={loading}
      className="group flex items-center gap-2 bg-slate-900 dark:bg-[#EA1D2C] text-white px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-black/10 dark:shadow-red-500/20 hover:scale-[1.02] active:scale-95 disabled:opacity-50"
    >
      {loading ? (
        <Loader2 size={16} className="animate-spin text-[#EA1D2C] dark:text-white" />
      ) : (
        <PlusCircle size={16} className="group-hover:rotate-90 transition-transform duration-300 text-[#EA1D2C] dark:text-white" />
      )}
      <span className="dark:text-white">
        {loading ? t.simulate.processing : t.simulate.button}
      </span>
    </button>
  );
}