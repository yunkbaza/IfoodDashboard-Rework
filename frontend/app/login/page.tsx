"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { login } from "../../services/api";
import { Loader2, LogIn } from "lucide-react";

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
    } catch (err: any) {
      setError(err.message || "E-mail ou senha incorretos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#111111] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-[#1C1C1E] p-8 rounded-[32px] border border-slate-100 dark:border-[#2C2C2E] shadow-xl">
        <div className="flex flex-col items-center mb-8">
          <Image src="/IfoodVetor.svg" alt="iFood" width={100} height={40} className="mb-6" />
          <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Acesso Restrito</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">E-mail</label>
            <input 
              name="username" 
              type="email" 
              required 
              className="w-full bg-slate-50 dark:bg-[#242426] border-none rounded-xl p-4 text-sm focus:ring-2 focus:ring-[#EA1D2C] outline-none text-slate-900 dark:text-white"
              placeholder="admin@ifood.com"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Senha</label>
            <input 
              name="password" 
              type="password" 
              required 
              className="w-full bg-slate-50 dark:bg-[#242426] border-none rounded-xl p-4 text-sm focus:ring-2 focus:ring-[#EA1D2C] outline-none text-slate-900 dark:text-white"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-[#EA1D2C] text-xs font-bold text-center p-3 rounded-xl border border-red-100 dark:border-red-900/30">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#EA1D2C] hover:bg-[#c91825] text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-500/20 disabled:opacity-50 mt-2"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <><LogIn size={20} /> Entrar no Sistema</>}
          </button>
        </form>
      </div>
    </div>
  );
}