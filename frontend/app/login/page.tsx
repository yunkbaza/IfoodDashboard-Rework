"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
// ✅ Importamos a função 'registrar' que já estava configurada na sua API!
import { login, registrar } from "../../services/api"; 
import { Loader2, LockKeyhole, UserPlus } from "lucide-react";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // ✅ Variável de estado que controla se estamos na aba de "Entrar" ou "Criar Conta"
  const [isRegisterMode, setIsRegisterMode] = useState(false); 
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    
    try {
      if (isRegisterMode) {
        // 🚀 FLUXO 1: CRIAR CONTA
        const nome = formData.get("nome") as string;
        const email = formData.get("username") as string;
        const senha = formData.get("password") as string;
        
        // 1. Chama a API para registrar o novo usuário
        await registrar({ nome, email, senha }); 
        
        // 2. Faz o login automático logo após criar a conta
        const loginData = new FormData();
        loginData.append("username", email);
        loginData.append("password", senha);
        const data = await login(loginData);
        
        // 3. Salva os dados e redireciona
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("user_name", data.nome);
        router.push("/dashboard"); 
        
      } else {
        // 🚀 FLUXO 2: LOGIN NORMAL
        const data = await login(formData);
        
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("user_name", data.nome);
        router.push("/dashboard"); 
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || (isRegisterMode ? "Erro ao criar conta. Email pode já existir." : "Email ou senha inválidos."));
      } else {
        setError("Ocorreu um erro de conexão inesperado.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0A0A0B] flex items-center justify-center p-6 relative overflow-hidden transition-colors duration-500">
      
      {/* BACKGROUND GLOW */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#EA1D2C]/10 dark:bg-[#EA1D2C]/5 blur-[120px] rounded-full pointer-events-none" />

      {/* MAIN CARD */}
      <div className="w-full max-w-md bg-white dark:bg-[#111113] p-10 rounded-[48px] border border-slate-200 dark:border-white/5 shadow-[0_32px_128px_-12px_rgba(0,0,0,0.1)] dark:shadow-[0_32px_128px_-12px_rgba(0,0,0,0.5)] relative z-10 animate-in zoom-in-95 fade-in duration-500">
        
        {/* HEADER */}
        <div className="flex flex-col items-center mb-10">
          <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-3xl mb-6 border border-slate-100 dark:border-white/5 shadow-sm">
            <Image src="/IfoodVetor.svg" alt="iFood Logo" width={80} height={32} className="object-contain" priority />
          </div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter text-center leading-none">
            {isRegisterMode ? "Criar Conta" : "Dashboard Pro"}
          </h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-3">
            {isRegisterMode ? "Acesso Liberado" : "Acesso Restrito"}
          </p>
        </div>

        {/* FORMULÁRIO */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* ✅ Campo NOME (Aparece apenas no modo de Criar Conta com uma animação suave) */}
          {isRegisterMode && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
              <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Seu Nome</label>
              <input 
                name="nome" 
                type="text" 
                required={isRegisterMode}
                className="w-full bg-slate-50 dark:bg-[#0A0A0B] border border-slate-200 dark:border-white/5 rounded-2xl p-4 text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-[#EA1D2C]/50 focus:border-[#EA1D2C] outline-none transition-all"
                placeholder="Ex: João Silva"
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Email Corporativo</label>
            <input 
              name="username" 
              type="email" 
              required 
              className="w-full bg-slate-50 dark:bg-[#0A0A0B] border border-slate-200 dark:border-white/5 rounded-2xl p-4 text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-[#EA1D2C]/50 focus:border-[#EA1D2C] outline-none transition-all"
              placeholder="admin@loja.com"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Senha</label>
            <input 
              name="password" 
              type="password" 
              required 
              className="w-full bg-slate-50 dark:bg-[#0A0A0B] border border-slate-200 dark:border-white/5 rounded-2xl p-4 text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-[#EA1D2C]/50 focus:border-[#EA1D2C] outline-none transition-all"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-[#EA1D2C]/10 text-[#EA1D2C] text-xs font-bold text-center p-4 rounded-2xl border border-red-100 dark:border-[#EA1D2C]/20 animate-in slide-in-from-top-2 duration-300">
              {error}
            </div>
          )}

          <div className="pt-2">
            <button 
              type="submit" 
              disabled={loading}
              className="group w-full bg-[#EA1D2C] hover:bg-[#D01A27] text-white font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(234,29,44,0.3)] hover:shadow-[0_0_30px_rgba(234,29,44,0.5)] disabled:opacity-50 disabled:hover:scale-100 hover:scale-[1.02] active:scale-95 uppercase text-[11px] tracking-widest"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  <span>{isRegisterMode ? "Criando Conta..." : "Autenticando..."}</span>
                </>
              ) : (
                <>
                  {isRegisterMode ? <UserPlus size={18} className="group-hover:scale-110 transition-transform" /> : <LockKeyhole size={18} className="group-hover:scale-110 transition-transform" />} 
                  <span>{isRegisterMode ? "Cadastrar Agora" : "Fazer Login"}</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* ✅ ALTERNADOR LOGIN / REGISTRO */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-white/5 text-center">
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
            {isRegisterMode ? "Já possui uma conta?" : "Ainda não tem acesso?"}
            <button 
              onClick={() => {
                setIsRegisterMode(!isRegisterMode); // Inverte a aba
                setError(""); // Limpa mensagens de erro ao trocar
              }}
              className="ml-2 text-[#EA1D2C] hover:underline"
              type="button"
            >
              {isRegisterMode ? "Faça login aqui" : "Crie sua conta livre"}
            </button>
          </p>
        </div>

      </div>
    </div>
  );
}