"use client";

import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { CreditCard, ShieldCheck } from "lucide-react";

interface PagamentoData { 
  tipo: string; 
  valor: number; 
}

export default function PagamentosChart({ data }: { data: PagamentoData[] }) {
  // Paleta de alta visibilidade
  const COLORS = [
    '#EA1D2C', // Vermelho iFood Principal
    '#F8FAFC', // Branco Gelo
    '#6366F1', // Indigo Elétrico
    '#FACC15', // Amarelo Gold
    '#94A3B8', // Slate Médio
  ];

  const total = data.reduce((acc, entry) => acc + entry.valor, 0);

  return (
    <div className="flex-1 flex flex-col min-h-0 w-full group">
      
      {/* Header Profissional */}
      <div className="mb-4 shrink-0">
        <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.4em] mb-1">
          Canais Financeiros
        </h3>
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-[#EA1D2C]/10 text-[#EA1D2C]">
            <CreditCard size={20} />
          </div>
          <p className="text-xl lg:text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">
            Faturamento por Método
          </p>
        </div>
      </div>
      
      {/* Container do Gráfico */}
      {/* ✅ CORREÇÃO: flex-1 e min-h-0 garantem que esta área só ocupa o que sobrar */}
      <div className="flex-1 w-full min-h-0 relative">
        
        {/* Indicador Central de Volume */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none -translate-y-[10%]">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Receita Total</span>
          <span className="text-xl lg:text-2xl font-black dark:text-white tabular-nums">
            R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
          </span>
        </div>

        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%" 
              cy="45%" 
              // ✅ O SEGREDO: Usar porcentagens. O gráfico cresce/encolhe com a tela.
              innerRadius="60%" 
              outerRadius="80%" 
              paddingAngle={6}
              dataKey="valor" 
              nameKey="tipo" 
              stroke="none"
              animationBegin={0}
              animationDuration={1500}
            >
              {data.map((_, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]} 
                  className="hover:opacity-80 transition-all outline-none cursor-pointer"
                />
              ))}
            </Pie>
            
            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  const percent = total > 0 ? ((item.valor / total) * 100).toFixed(1) : "0";
                  return (
                    <div className="bg-white/95 dark:bg-[#111113]/95 backdrop-blur-xl p-4 rounded-3xl shadow-2xl border border-slate-100 dark:border-white/10 ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-200">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Distribuição Detalhada</p>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: payload[0].payload.fill }} />
                        <p className="text-xs font-black dark:text-white uppercase tracking-tight">{item.tipo}</p>
                      </div>
                      <p className="text-xl font-black text-[#EA1D2C] tabular-nums">
                        R$ {item.valor.toLocaleString('pt-BR')}
                      </p>
                      <p className="text-[9px] font-bold text-emerald-500 uppercase mt-1 italic">
                        Representa {percent}% do volume total
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
              wrapperStyle={{ paddingTop: '10px' }} // Reduzi o padding superior da legenda
              formatter={(value) => (
                <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1 hover:text-[#EA1D2C] transition-colors cursor-default">
                  {value}
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Footer de Integridade */}
      {/* shrink-0 garante que este footer nunca será esmagado */}
      <div className="mt-4 flex justify-center shrink-0">
        <div className="px-4 py-2 bg-slate-50 dark:bg-[#1C1C1E] rounded-2xl border dark:border-white/5 flex items-center gap-2 group-hover:border-[#EA1D2C]/30 transition-colors">
          <ShieldCheck size={14} className="text-emerald-500" />
          <p className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
            Dados auditados via API iFood
          </p>
        </div>
      </div>
      
    </div>
  );
}