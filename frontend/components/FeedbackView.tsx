"use client";

import { useState, useEffect } from "react";
import { Star, Sparkles, TrendingDown, AlertTriangle, CheckCircle2, Bot, ThumbsUp, ThumbsDown, Plus } from "lucide-react";
import { getAnaliseIA, getAvaliacoes } from "../services/api";
import SimularAvaliacaoModal from "./SimularAvaliacaoModal";

export default function FeedbackView() {
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [insights, setInsights] = useState<any[]>([]);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Função central para buscar dados do banco e pedir análise à IA
  async function carregarDados() {
    setIsAnalyzing(true);
    try {
      // 1. Busca as avaliações que você salvou no Banco de Dados
      const dadosBanco = await getAvaliacoes();
      setFeedbacks(dadosBanco);

      // 2. Se houver dados, envia os textos para o Gemini 2.5 analisar
      if (dadosBanco && dadosBanco.length > 0) {
        const textosParaIA = dadosBanco.map((f: any) => f.texto);
        const respostaIA = await getAnaliseIA(textosParaIA);
        setInsights(respostaIA);
      } else {
        setInsights([]);
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      setInsights([{
        tipo: "AlertTriangle",
        titulo: "Erro de Sincronização",
        reclamacao: "Não conseguimos conectar ao banco ou à IA.",
        dica: "Certifique-se que o backend (Python) está rodando."
      }]);
    } finally {
      setIsAnalyzing(false);
    }
  }

  // Carrega ao abrir a página
  useEffect(() => {
    carregarDados();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">O que dizem os clientes</h2>
          <p className="text-sm text-slate-500 dark:text-[#8E8E93]">Feedbacks reais extraídos do banco de dados e analisados pela Assistente Virtual.</p>
        </div>
        
        {/* BOTÃO DE SIMULAÇÃO */}
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-[#EA1D2C] text-white px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-red-500/20"
        >
          <Plus size={18} /> Nova Simulação
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUNA ESQUERDA: COMENTÁRIOS DO BANCO */}
        <div className="lg:col-span-2 space-y-4">
          {feedbacks.length === 0 && !isAnalyzing && (
            <div className="p-12 text-center border-2 border-dashed border-slate-200 dark:border-[#2C2C2E] rounded-[40px] bg-slate-50/50 dark:bg-transparent">
              <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em]">O banco de dados está vazio. Use o botão acima para simular.</p>
            </div>
          )}

          {feedbacks.map((fb, index) => (
            <div 
              key={fb.id || index} 
              className="bg-white dark:bg-[#1C1C1E] p-6 rounded-3xl border border-slate-100 dark:border-[#2C2C2E] shadow-sm flex gap-4 hover:border-[#EA1D2C]/30 transition-all group"
            >
              <div className="flex-shrink-0 pt-1">
                <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-[#2C2C2E] border border-slate-100 dark:border-[#3C3C3E] flex items-center justify-center font-black text-slate-600 dark:text-slate-300 group-hover:scale-110 transition-transform">
                  {fb.cliente.charAt(0)}
                </div>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      {fb.cliente}
                      <span className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${fb.sentimento === 'positivo' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                        {fb.sentimento === 'positivo' ? <ThumbsUp size={10} /> : <ThumbsDown size={10} />}
                        {fb.sentimento}
                      </span>
                    </h4>
                    {/* Formata a data que vem do Python */}
                    <span className="text-xs font-medium text-slate-400">
                      {new Date(fb.data).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <div className="flex gap-1 bg-slate-50 dark:bg-[#242426] p-1.5 rounded-lg border border-slate-100 dark:border-[#3C3C3E]">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} size={14} className={star <= fb.nota ? "fill-yellow-400 text-yellow-400" : "text-slate-200 dark:text-slate-700"} />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mt-3">{fb.texto}</p>
              </div>
            </div>
          ))}
        </div>

        {/* COLUNA DIREITA: ASSISTENTE VIRTUAL (GEMINI 2.5) */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-[#1C1C1E] p-6 rounded-3xl border-t-4 border-t-[#EA1D2C] border-x border-b border-slate-100 dark:border-x-[#2C2C2E] dark:border-b-[#2C2C2E] shadow-xl relative overflow-hidden h-full flex flex-col min-h-[500px]">
            
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-red-50 dark:bg-[#EA1D2C]/10 p-2.5 rounded-xl border border-red-100 dark:border-[#EA1D2C]/20">
                <Bot size={24} className="text-[#EA1D2C]" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tight">Assistente iFood</h3>
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest flex items-center gap-1">
                  <Sparkles size={10} className="text-amber-500" /> Powered by Gemini 2.5
                </p>
              </div>
            </div>

            {isAnalyzing ? (
              <div className="flex flex-col items-center justify-center flex-1 space-y-6 py-10">
                <div className="relative flex items-center justify-center w-20 h-20">
                  <div className="absolute inset-0 border-4 border-slate-100 dark:border-[#2C2C2E] rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-[#EA1D2C] border-t-transparent rounded-full animate-spin"></div>
                  <Bot size={28} className="text-[#EA1D2C] animate-pulse" />
                </div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] animate-pulse">A analisar banco de dados...</p>
              </div>
            ) : (
              <div className="space-y-6 flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-6">Insights gerados com base nos últimos feedbacks:</p>

                  <div className="space-y-4">
                    {insights.map((insight, index) => (
                      <div key={index} className="bg-slate-50 dark:bg-[#242426] p-4.5 rounded-2xl border border-slate-100 dark:border-[#2C2C2E] relative overflow-hidden group hover:border-[#EA1D2C]/20 transition-all">
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${insight.tipo === 'TrendingDown' ? 'bg-orange-500' : 'bg-red-500'}`}></div>
                        
                        <div className={`flex items-center gap-2 mb-3 font-bold text-[10px] uppercase tracking-wider ${insight.tipo === 'TrendingDown' ? 'text-orange-600' : 'text-red-600'}`}>
                          {insight.tipo === 'TrendingDown' ? <TrendingDown size={14} /> : <AlertTriangle size={14} />} 
                          {insight.titulo}
                        </div>
                        
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
                          <span className="font-bold text-slate-800 dark:text-slate-200">Contexto:</span> {insight.reclamacao}
                        </p>
                        <div className="bg-emerald-50 dark:bg-emerald-900/20 p-2.5 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                           <p className="text-[10px] text-emerald-700 dark:text-emerald-400 leading-tight">
                             <span className="font-black uppercase tracking-tighter mr-1">Dica:</span> {insight.dica}
                           </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button className="w-full mt-6 py-4 bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-[10px] font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 hover:opacity-90 transition-all">
                  <CheckCircle2 size={16} /> Marcar como ciente
                </button>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* MODAL DE SIMULAÇÃO */}
      <SimularAvaliacaoModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={carregarDados} // Recarrega a lista e a IA ao fechar
      />
    </div>
  );
}