"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { login } from "../../services/api";
import { Loader2, LockKeyhole } from "lucide-react";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    
    try {
      // Chama a nossa API Python para validar o login
      const data = await login(formData);
      
      // Se deu certo, guarda a "chave" no navegador
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user_name", data.nome);
      
      // Manda o usuário de volta para o Dashboard
      router.push("/"); 
    } catch (err: unknown) {
      // ✅ CORREÇÃO TS: Tratamento correto de erro sem usar 'any'
      if (err instanceof Error) {
        setError(err.message || "E-mail ou senha incorretos.");
      } else {
        setError("Ocorreu um erro inesperado de conexão.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0A0A0B] flex items-center justify-center p-6 relative overflow-hidden transition-colors duration-500">
      
      {/* GLOW DE FUNDO: Efeito "SaaS Premium" */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#EA1D2C]/10 dark:bg-[#EA1D2C]/5 blur-[120px] rounded-full pointer-events-none" />

      {/* CARD PRINCIPAL */}
      <div className="w-full max-w-md bg-white dark:bg-[#111113] p-10 rounded-[48px] border border-slate-200 dark:border-white/5 shadow-[0_32px_128px_-12px_rgba(0,0,0,0.1)] dark:shadow-[0_32px_128px_-12px_rgba(0,0,0,0.5)] relative z-10 animate-in zoom-in-95 fade-in duration-500">
        
        {/* CABEÇALHO DO LOGIN */}
        <div className="flex flex-col items-center mb-10">
          <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-3xl mb-6 border border-slate-100 dark:border-white/5 shadow-sm">
            <Image src="/IfoodVetor.svg" alt="iFood Logo" width={80} height={32} className="object-contain" priority />
          </div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter text-center leading-none">
            Dashboard Pro
          </h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-3">
            Acesso Restrito
          </p>
        </div>

        {/* FORMULÁRIO */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">E-mail Corporativo</label>
            <input 
              name="username" 
              type="email" 
              required 
              className="w-full bg-slate-50 dark:bg-[#0A0A0B] border border-slate-200 dark:border-white/5 rounded-2xl p-4 text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-[#EA1D2C]/50 focus:border-[#EA1D2C] outline-none transition-all"
              placeholder="admin@loja.com"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Senha de Acesso</label>
            <input 
              name="password" 
              type="password" 
              required 
              className="w-full bg-slate-50 dark:bg-[#0A0A0B] border border-slate-200 dark:border-white/5 rounded-2xl p-4 text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-[#EA1D2C]/50 focus:border-[#EA1D2C] outline-none transition-all"
              placeholder="••••••••"
            />
          </div>

          {/* MENSAGEM DE ERRO (Com animação) */}
          {error && (
            <div className="bg-red-50 dark:bg-[#EA1D2C]/10 text-[#EA1D2C] text-xs font-bold text-center p-4 rounded-2xl border border-red-100 dark:border-[#EA1D2C]/20 animate-in slide-in-from-top-2 duration-300">
              {error}
            </div>
          )}

          <div className="pt-2">
            <button 
              type="submit" 
              disabled={loading}
              className="group w-full bg-[#EA1D2C] hover:bg-[#D01A27] text-white font-black py-4.5 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(234,29,44,0.3)] hover:shadow-[0_0_30px_rgba(234,29,44,0.5)] disabled:opacity-50 disabled:hover:scale-100 hover:scale-[1.02] active:scale-95 uppercase text-[11px] tracking-widest"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  <span>Autenticando...</span>
                </>
              ) : (
                <>
                  <LockKeyhole size={18} className="group-hover:scale-110 transition-transform" /> 
                  <span>Entrar no Sistema</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* FOOTER DE CONFIANÇA */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-white/5 text-center">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Protegido por Criptografia de Ponta a Ponta
          </p>
        </div>

      </div>
    </div>
  );
}