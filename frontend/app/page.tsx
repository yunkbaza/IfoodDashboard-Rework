import Link from "next/link";
import { ArrowRight, BarChart3, Bot, LayoutDashboard, Store, Zap } from "lucide-react";
import ThemeToggle from "../components/ThemeToggle";
import LanguageToggle from "../components/LanguageToggle";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0A0A0B] text-slate-900 dark:text-white transition-colors duration-500 font-sans selection:bg-[#EA1D2C] selection:text-white">
      
      {/* NAVBAR */}
      <nav className="fixed top-0 w-full bg-white/80 dark:bg-[#0A0A0B]/80 backdrop-blur-md border-b border-slate-200 dark:border-white/5 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#EA1D2C] rounded-xl flex items-center justify-center shadow-lg shadow-red-500/20">
              <BarChart3 size={18} className="text-white" />
            </div>
            <span className="font-black text-xl uppercase tracking-tighter">iFood Pro</span>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-4 mr-4">
              <LanguageToggle />
              <ThemeToggle />
            </div>
            <Link href="/login" className="text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-[#EA1D2C] transition-colors">
              Entrar
            </Link>
            <Link href="/login" className="bg-[#EA1D2C] hover:bg-red-700 text-white px-6 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest transition-all hover:scale-105 shadow-lg shadow-red-500/25">
              Começar Grátis
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center mt-12 md:mt-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 dark:bg-red-500/10 text-[#EA1D2C] text-xs font-black uppercase tracking-widest mb-8 border border-red-100 dark:border-red-500/20">
            <Bot size={14} /> Inteligência Artificial Integrada
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[1.1] mb-8">
            O Controle Absoluto <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#EA1D2C] to-orange-500">
              Da Sua Operação
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10 font-medium leading-relaxed">
            Escale o seu delivery com o único dashboard Multi-loja que analisa os seus feedbacks com IA e organiza os seus pedidos num Kanban em tempo real.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/dashboard" className="w-full sm:w-auto bg-[#EA1D2C] text-white px-8 py-4 rounded-2xl text-sm font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-[0_0_40px_rgba(234,29,44,0.3)] flex items-center justify-center gap-2 group">
              Acessar Dashboard
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </main>

      {/* BENTO GRID (FEATURES) */}
      <section className="py-20 px-6 bg-white dark:bg-[#111113] border-t border-slate-200 dark:border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black uppercase tracking-tighter mb-4">Recursos de Nível Enterprise</h2>
            <p className="text-slate-500">Desenvolvido para operações de alto volume.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-8 rounded-[40px] bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 hover:-translate-y-2 transition-transform duration-300">
              <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center mb-6">
                <Store size={24} />
              </div>
              <h3 className="text-lg font-black uppercase tracking-tight mb-3">Multi-loja Nativo</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Gira todas as unidades do seu restaurante (CNPJs diferentes) a partir de um único ecrã consolidado.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-[40px] bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 hover:-translate-y-2 transition-transform duration-300">
              <div className="w-12 h-12 bg-red-500/10 text-[#EA1D2C] rounded-2xl flex items-center justify-center mb-6">
                <Bot size={24} />
              </div>
              <h3 className="text-lg font-black uppercase tracking-tight mb-3">Análise com Gemini IA</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Não perca tempo a ler centenas de reviews. A nossa IA extrai os problemas críticos e recomenda soluções automáticas.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-[40px] bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 hover:-translate-y-2 transition-transform duration-300">
              <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center mb-6">
                <LayoutDashboard size={24} />
              </div>
              <h3 className="text-lg font-black uppercase tracking-tight mb-3">Kanban Operacional</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Acompanhe o fluxo de pedidos da cozinha à entrega num quadro interativo desenhado para reduzir o stress.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER CTA */}
      <footer className="py-24 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[#EA1D2C]/5 dark:bg-[#EA1D2C]/10"></div>
        <div className="relative max-w-3xl mx-auto flex flex-col items-center">
          <Zap size={40} className="text-[#EA1D2C] mb-6 animate-pulse" />
          <h2 className="text-4xl font-black uppercase tracking-tighter mb-6">Pronto para dominar o seu mercado?</h2>
          <Link href="/login" className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-10 py-5 rounded-2xl text-xs font-black uppercase tracking-[0.2em] hover:scale-105 transition-transform shadow-xl">
            Criar Conta Gratuita
          </Link>
        </div>
      </footer>
    </div>
  );
}