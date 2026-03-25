"use client";

import { useState, useEffect } from "react";
import { Star, Sparkles, TrendingDown, AlertTriangle, CheckCircle2, Bot, ThumbsUp, ThumbsDown } from "lucide-react";
import { getAnaliseIA } from "../services/api";

export default function FeedbackView() {
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [insights, setInsights] = useState<any[]>([]);

  const feedbacks = [
    { 
      id: 1, 
      cliente: "Mariana S.", 
      nota: 2, 
      texto: "A comida estava saborosa, mas a batata frita chegou completamente murcha e fria.", 
      data: "Hoje, 14:30",
      sentimento: "negativo"
    },
    { 
      id: 2, 
      cliente: "Carlos E.", 
      nota: 5, 
      texto: "Melhor hambúrguer da região! Entrega super rápida e entregador gentil.", 
      data: "Hoje, 12:15",
      sentimento: "positivo"
    },
    { 
      id: 3, 
      cliente: "Ana P.", 
      nota: 3, 
      texto: "Demorou quase 1 hora além do previsto. O entregador não achava o endereço e a comida chegou morna.", 
      data: "Ontem, 20:45",
      sentimento: "negativo"
    },
    { 
      id: 4, 
      cliente: "Roberto F.", 
      nota: 2, 
      texto: "Pedi expressamente sem cebola e veio com MUITA cebola. Fiquei chateado pois sou alérgico.", 
      data: "Ontem, 19:20",
      sentimento: "negativo"
    },
  ];

  // Efeito que envia os textos para o Backend (que fala com o Gemini)
  useEffect(() => {
    async function chamarInteligenciaArtificial() {
      setIsAnalyzing(true);
      try {
        // Extrai apenas os comentários dos clientes para enviar à IA
        const textosDosClientes = feedbacks.map(f => f.texto);
        
        // Aguarda a resposta do Google Gemini através do nosso backend
        const dadosIA = await getAnaliseIA(textosDosClientes);
        setInsights(dadosIA);
      } catch (error) {
        console.error("Erro ao conectar com a IA:", error);
        // Em caso de falha de conexão (ex: esqueceu a chave API), mostra um erro bonito no mesmo padrão
        setInsights([{
          tipo: "AlertTriangle",
          titulo: "Erro de Conexão",
          reclamacao: "Não foi possível conectar ao motor de Inteligência Artificial.",
          dica: "Verifique se a chave API foi colocada corretamente no arquivo main.py do backend."
        }]);
      } finally {
        setIsAnalyzing(false);
      }
    }
    
    chamarInteligenciaArtificial();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="mb-8">
        <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">O que dizem os clientes</h2>
        <p className="text-sm text-slate-500 dark:text-[#8E8E93]">Leia os comentários recentes e veja o que a nossa Assistente Virtual sugere para melhorar as vendas.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUNA ESQUERDA: COMENTÁRIOS */}
        <div className="lg:col-span-2 space-y-4">
          {feedbacks.map((fb, index) => (
            <div 
              key={fb.id} 
              className="bg-white dark:bg-[#1C1C1E] p-6 rounded-3xl border border-slate-100 dark:border-[#2C2C2E] shadow-sm flex gap-4 hover:border-[#EA1D2C]/30 hover:shadow-md transition-all duration-300 relative overflow-hidden group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex-shrink-0 pt-1">
                <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-[#2C2C2E] border border-slate-100 dark:border-[#3C3C3E] flex items-center justify-center font-black text-slate-600 dark:text-slate-300 shadow-sm group-hover:scale-110 transition-transform">
                  {fb.cliente.charAt(0)}
                </div>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      {fb.cliente}
                      {/* Badge do Sentimento da IA (Aparece após a análise) */}
                      {!isAnalyzing && (
                        <span className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${fb.sentimento === 'positivo' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                          {fb.sentimento === 'positivo' ? <ThumbsUp size={10} /> : <ThumbsDown size={10} />}
                          {fb.sentimento}
                        </span>
                      )}
                    </h4>
                    <span className="text-xs font-medium text-slate-400">{fb.data}</span>
                  </div>
                  <div className="flex gap-1 bg-slate-50 dark:bg-[#242426] p-1.5 rounded-lg border border-slate-100 dark:border-[#3C3C3E]">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star} 
                        size={14} 
                        className={star <= fb.nota ? "fill-yellow-400 text-yellow-400" : "text-slate-200 dark:text-slate-700"} 
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mt-3">{fb.texto}</p>
              </div>
            </div>
          ))}
        </div>

        {/* COLUNA DIREITA: ASSISTENTE VIRTUAL CONECTADA AO GEMINI */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-[#1C1C1E] p-6 rounded-3xl border-t-4 border-t-[#EA1D2C] border-x border-b border-slate-100 dark:border-x-[#2C2C2E] dark:border-b-[#2C2C2E] shadow-xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden h-full flex flex-col">
            
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-red-50 dark:bg-[#EA1D2C]/10 p-2.5 rounded-xl border border-red-100 dark:border-[#EA1D2C]/20">
                <Bot size={24} className="text-[#EA1D2C]" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tight">Assistente iFood</h3>
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest flex items-center gap-1">
                  <Sparkles size={10} className="text-amber-500" /> IA Generativa
                </p>
              </div>
            </div>

            {/* ESTADO 1: ANALISANDO (ANIMAÇÃO) */}
            {isAnalyzing ? (
              <div className="flex flex-col items-center justify-center flex-1 space-y-6 py-10">
                <div className="relative flex items-center justify-center w-20 h-20">
                  <div className="absolute inset-0 border-4 border-slate-100 dark:border-[#2C2C2E] rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-[#EA1D2C] border-t-transparent rounded-full animate-spin"></div>
                  <Bot size={28} className="text-[#EA1D2C] animate-pulse" />
                </div>
                <div className="text-center space-y-2">
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300 animate-pulse">
                    A analisar sentimentos e padrões...
                  </p>
                  <p className="text-xs text-slate-400 dark:text-[#8E8E93]">
                    A conectar ao motor de IA do Google.
                  </p>
                </div>
              </div>
            ) : (
              /* ESTADO 2: RESULTADO DA ANÁLISE DINÂMICA */
              <div className="space-y-6 flex-1 flex flex-col justify-between animate-in slide-in-from-bottom-4 duration-700">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-6">
                    Encontrei alguns padrões nos comentários recentes que precisam da sua atenção:
                  </p>

                  <div className="space-y-4">
                    {/* Renderiza os alertas com base no JSON que a IA devolveu */}
                    {insights.map((insight, index) => (
                      <div key={index} className={`bg-slate-50 dark:bg-[#242426] p-4 rounded-2xl border border-slate-100 dark:border-[#2C2C2E] relative overflow-hidden transition-colors ${insight.tipo === 'TrendingDown' ? 'hover:border-orange-200' : 'hover:border-red-200'}`}>
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${insight.tipo === 'TrendingDown' ? 'bg-orange-500' : 'bg-red-500'}`}></div>
                        
                        <div className={`flex items-center gap-2 mb-3 font-bold text-sm uppercase tracking-wide ${insight.tipo === 'TrendingDown' ? 'text-orange-600 dark:text-orange-500' : 'text-red-600 dark:text-red-500'}`}>
                          {insight.tipo === 'TrendingDown' ? <TrendingDown size={16} /> : <AlertTriangle size={16} />} 
                          {insight.titulo}
                        </div>
                        
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                          <span className="font-bold text-slate-800 dark:text-slate-200">Reclamação Principal:</span> {insight.reclamacao}
                          <br/><br/>
                          <span className="font-bold text-emerald-600 dark:text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 px-1 py-0.5 rounded">Dica Prática:</span> {insight.dica}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <button className="w-full mt-6 py-3.5 bg-white dark:bg-[#2C2C2E] border-2 border-slate-100 dark:border-[#3C3C3E] text-slate-700 dark:text-white text-sm font-black rounded-xl flex items-center justify-center gap-2 hover:border-[#EA1D2C] hover:text-[#EA1D2C] transition-all shadow-sm">
                  <CheckCircle2 size={18} /> Marcar como ciente
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}