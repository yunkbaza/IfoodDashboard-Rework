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
  // High-visibility palette
  const COLORS = [
    '#EA1D2C', // iFood Primary Red
    '#F8FAFC', // Ice White
    '#6366F1', // Electric Indigo
    '#FACC15', // Gold Yellow
    '#94A3B8', // Medium Slate
  ];

  const total = data.reduce((acc, entry) => acc + entry.valor, 0);

  return (
    <div className="flex-1 flex flex-col min-h-0 w-full group">
      
      {/* Professional Header */}
      <div className="mb-4 shrink-0">
        <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.4em] mb-1">
          Financial Channels
        </h3>
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-[#EA1D2C]/10 text-[#EA1D2C]">
            <CreditCard size={20} />
          </div>
          <p className="text-xl lg:text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">
            Revenue by Method
          </p>
        </div>
      </div>
      
      {/* Chart Container */}
      {/* ✅ FIX: flex-1 and min-h-0 ensure this area only occupies the remaining space */}
      <div className="flex-1 w-full min-h-0 relative">
        
        {/* Central Volume Indicator */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none -translate-y-[10%]">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Total Revenue</span>
          <span className="text-xl lg:text-2xl font-black dark:text-white tabular-nums">
            $ {total.toLocaleString('en-US', { minimumFractionDigits: 0 })}
          </span>
        </div>

        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%" 
              cy="45%" 
              // ✅ THE SECRET: Using percentages. The chart scales with the screen.
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
                  
                  // Translate the backend strings to English dynamically
                  const translatedType = item.tipo === 'Cartão de Crédito' ? 'Credit Card' : 
                                         item.tipo === 'Cartão de Débito' ? 'Debit Card' : 
                                         item.tipo === 'Dinheiro' ? 'Cash' : 
                                         item.tipo === 'PIX' ? 'Pix' : item.tipo;

                  return (
                    <div className="bg-white/95 dark:bg-[#111113]/95 backdrop-blur-xl p-4 rounded-3xl shadow-2xl border border-slate-100 dark:border-white/10 ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-200">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Detailed Distribution</p>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: payload[0].payload.fill }} />
                        <p className="text-xs font-black dark:text-white uppercase tracking-tight">{translatedType}</p>
                      </div>
                      <p className="text-xl font-black text-[#EA1D2C] tabular-nums">
                        $ {item.valor.toLocaleString('en-US')}
                      </p>
                      <p className="text-[9px] font-bold text-emerald-500 uppercase mt-1 italic">
                        Represents {percent}% of total volume
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
              wrapperStyle={{ paddingTop: '10px' }} // Reduced top padding for legend
              formatter={(value) => {
                // Translate legend values
                const translatedValue = value === 'Cartão de Crédito' ? 'Credit Card' : 
                                        value === 'Cartão de Débito' ? 'Debit Card' : 
                                        value === 'Dinheiro' ? 'Cash' : 
                                        value === 'PIX' ? 'Pix' : value;
                return (
                  <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1 hover:text-[#EA1D2C] transition-colors cursor-default">
                    {translatedValue}
                  </span>
                )
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Integrity Footer */}
      {/* shrink-0 ensures this footer is never squashed */}
      <div className="mt-4 flex justify-center shrink-0">
        <div className="px-4 py-2 bg-slate-50 dark:bg-[#1C1C1E] rounded-2xl border dark:border-white/5 flex items-center gap-2 group-hover:border-[#EA1D2C]/30 transition-colors">
          <ShieldCheck size={14} className="text-emerald-500" />
          <p className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
            Audited data via iFood API
          </p>
        </div>
      </div>
      
    </div>
  );
}