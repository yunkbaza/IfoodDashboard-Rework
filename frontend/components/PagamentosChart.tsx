"use client";

import { useMemo, useCallback } from "react";
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { CreditCard, ShieldCheck } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

export interface PagamentoData { 
  nome?: string;
  tipo?: string; 
  valor: number; 
}

export default function PagamentosChart({ data }: { data: PagamentoData[] }) {
  const { t, formatCurrency } = useLanguage();

  const COLORS = [
    '#EA1D2C', // Vermelho Principal iFood
    '#F8FAFC', // Branco Gelo
    '#6366F1', // Indigo
    '#FACC15', // Amarelo
    '#94A3B8', // Slate
  ];

  const getTranslatedLabel = useCallback((chave: string | undefined) => {
    if (!chave) return "Outros";

    const normalizado = chave.trim().toLowerCase();
    
    const map: Record<string, string> = {
      'cartão de crédito': t.charts?.pagamentos?.methods?.credit || 'Crédito',
      'cartao de credito': t.charts?.pagamentos?.methods?.credit || 'Crédito',
      'cartão de débito': t.charts?.pagamentos?.methods?.debit || 'Débito',
      'cartao de debito': t.charts?.pagamentos?.methods?.debit || 'Débito',
      'dinheiro': t.charts?.pagamentos?.methods?.cash || 'Dinheiro',
      'cash': t.charts?.pagamentos?.methods?.cash || 'Dinheiro',
      'pix': t.charts?.pagamentos?.methods?.pix || 'PIX'
    };

    return map[normalizado] || chave;
  }, [t]);

  const processedData = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];

    const grouped = data.reduce((acc: Record<string, { tipo: string; valor: number }>, item) => {
      const rawLabel = item.nome || item.tipo;
      const translatedLabel = getTranslatedLabel(rawLabel);
      
      if (!acc[translatedLabel]) {
        acc[translatedLabel] = { tipo: translatedLabel, valor: 0 };
      }
      acc[translatedLabel].valor += (item.valor || 0);
      return acc;
    }, {});

    return Object.values(grouped);
  }, [data, getTranslatedLabel]);

  const total = processedData.reduce((acc, entry) => acc + entry.valor, 0);

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col h-full w-full items-center justify-center bg-slate-50 dark:bg-white/5 rounded-3xl border border-dashed dark:border-white/10 p-8">
        <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2">
          {t.charts?.pagamentos?.subtitle || 'MÉTODOS'}
        </h3>
        <p className="text-xs font-bold text-slate-500">Sem dados disponíveis</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 w-full group">
      
      {/* HEADER DO CARD */}
      <div className="mb-4 shrink-0">
        <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.4em] mb-1">
          {t.charts?.pagamentos?.subtitle || 'MÉTODOS'}
        </h3>
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-[#EA1D2C]/10 text-[#EA1D2C]">
            <CreditCard size={20} />
          </div>
          <p className="text-xl lg:text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">
            {t.charts?.pagamentos?.title || 'FORMAS DE PAGAMENTO'}
          </p>
        </div>
      </div>
      
      {/* ÁREA DO GRÁFICO */}
      <div className="flex-1 w-full min-h-0 relative">
        {/* VALOR CENTRAL (BURACO DO DONUT) */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none -translate-y-[10%]">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
            {t.charts?.pagamentos?.total || 'TOTAL'}
          </span>
          <span className="text-xl lg:text-2xl font-black dark:text-white tabular-nums">
            {formatCurrency(total)}
          </span>
        </div>

        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={processedData}
              cx="50%" 
              cy="45%" 
              innerRadius="60%" 
              outerRadius="80%" 
              paddingAngle={6}
              dataKey="valor" 
              nameKey="tipo" 
              stroke="none"
              animationBegin={0}
              animationDuration={1500}
            >
              {processedData.map((_, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]} 
                  className="hover:opacity-80 transition-all outline-none cursor-pointer"
                />
              ))}
            </Pie>
            
            {/* TOOLTIP CORRIGIDO */}
            <Tooltip 
              cursor={{ fill: 'transparent' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  const percent = total > 0 ? ((item.valor / total) * 100).toFixed(1) : "0";
                  
                  // ✅ CORREÇÃO AQUI: Lemos a frase do idioma e substituímos {percent} pelo valor numérico.
                  const shareText = (t.charts?.pagamentos?.share || '{percent}% do faturamento').replace('{percent}', percent);

                  return (
                    <div className="bg-white/95 dark:bg-[#111113]/95 backdrop-blur-xl p-4 rounded-3xl shadow-2xl border border-slate-100 dark:border-white/10 ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-200">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">
                        {t.charts?.pagamentos?.tooltip || 'MÉTODO DE PAGAMENTO'}
                      </p>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: payload[0].payload.fill }} />
                        <p className="text-xs font-black dark:text-white uppercase tracking-tight">
                          {item.tipo}
                        </p>
                      </div>
                      <p className="text-xl font-black text-[#EA1D2C] tabular-nums">
                        {formatCurrency(item.valor)}
                      </p>
                      <p className="text-[9px] font-bold text-emerald-500 uppercase mt-1 italic">
                        {/* Agora renderiza diretamente a frase tratada */}
                        {shareText}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            
            <Legend 
              verticalAlign="bottom" 
              align="center" 
              iconType="circle"
              iconSize={8}
              formatter={(val) => (
                <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">
                  {val}
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* FOOTER */}
      <div className="mt-4 flex justify-center shrink-0">
        <div className="px-4 py-2 bg-slate-50 dark:bg-[#1C1C1E] rounded-2xl border dark:border-white/5 flex items-center gap-2">
          <ShieldCheck size={14} className="text-emerald-500" />
          <p className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
            {t.charts?.pagamentos?.footer || 'TRANSAÇÕES SEGURAS'}
          </p>
        </div>
      </div>
    </div>
  );
}