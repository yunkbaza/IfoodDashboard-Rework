"use client";

import { useState } from "react";
import { PlusCircle, Loader2 } from "lucide-react";
import { simularPedido } from "../services/api";
import { toast } from "sonner";

export default function SimularPedidoButton() {
  const [loading, setLoading] = useState(false);

  const handleSimularPedido = async () => {
    setLoading(true);
    try {
      // Uses the centralized API service which automatically attaches the Bearer token
      await simularPedido();
      toast.success("Transaction simulated successfully!");
      
      // Forces a soft reload to fetch the new data without losing state
      window.location.reload(); 
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || "Failed to communicate with the API.");
      } else {
        toast.error("Unknown error while simulating transaction.");
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
      <span>{loading ? "Processing..." : "Simulate Order"}</span>
    </button>
  );
}