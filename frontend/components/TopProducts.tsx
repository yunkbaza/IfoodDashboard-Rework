"use client";

import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell, 
  CartesianGrid 
} from 'recharts';
import { Trophy } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

interface Product {
  nome: string;
  quantidade: number;
  receita?: number; // ✅ Tornamos opcional por segurança
}

export default function TopProducts({ data }: { data: Product[] }) {
  const { lang, t, formatCurrency } = useLanguage(); 

  // Paleta iFood exclusiva
  const IFOOD_PALETTE = [
    '#EA1D2C', // 1º Lugar
    '#B31622', // 2º Lugar
    '#F23D4C', // 3º Lugar
    '#E0525D', // 4º Lugar
    '#FF8C96', // 5º Lugar
  ];

  return (
    <div className="flex-1 flex flex-col min-h-0 w-full group">
      
      {/* Cabeçalho */}
      <div className="mb-6 shrink-0">
        <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.4em] mb-1">
          {t.charts.topProducts.subtitle}
        </h3>
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-[#EA1D2C]/10 text-[#EA1D2C]">
            <Trophy size={20} />
          </div>
          <p className="text-xl lg:text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">
            {t.charts.topProducts.title}
          </p>
        </div>
      </div>

      {/* Gráfico */}
      <div className="flex-1 min-h-0 w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={data} 
            layout="vertical" 
            margin={{ top: 0, right: 20, left: 10, bottom: 0 }}
          >
            <CartesianGrid 
              strokeDasharray="0" 
              horizontal={false} 
              stroke="currentColor" 
              className="text-slate-100 dark:text-white/5" 
            />

            <XAxis type="number" hide />
            
            <YAxis 
              dataKey="nome" 
              type="category" 
              axisLine={false} 
              tickLine={false} 
              width={110} 
              tick={(props) => {
                const { x, y, payload } = props;
                return (
                  <g transform={`translate(${x},${y})`}>
                    <text 
                      x={-10} 
                      y={0} 
                      dy={4} 
                      textAnchor="end" 
                      fill="currentColor" 
                      className="text-[10px] font-black fill-slate-600 dark:fill-slate-400 uppercase tracking-tighter"
                    >
                      {payload.value.length > 18 ? `${payload.value.substring(0, 18)}...` : payload.value}
                    </text>
                  </g>
                );
              }}
            />

            {/* Tooltip com Proteção Anti-NaN */}
            <Tooltip 
              cursor={{ fill: 'rgba(234, 29, 44, 0.04)' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload as Product;
                  return (
                    <div className="bg-white/95 dark:bg-[#111113]/95 backdrop-blur-xl p-5 rounded-3xl shadow-2xl border border-slate-100 dark:border-white/10 ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-200">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                        {t.charts.topProducts.tooltip}
                      </p>
                      <p className="text-sm font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">
                        {item.nome}
                      </p>
                      <div className="space-y-1.5">
                        <p className="text-xs font-bold text-[#EA1D2C]">
                          {item.quantidade} {t.charts.topProducts.sold}
                        </p>
                        <p className="text-xl font-black text-emerald-500 tabular-nums">
                          {/* ✅ RESOLVIDO: O "|| 0" impede que o valor vire NaN se vier undefined */}
                          {formatCurrency(item.receita || 0)}
                        </p>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />

            <Bar 
              dataKey="quantidade" 
              radius={[0, 8, 8, 0]} 
              barSize={28}
              animationDuration={1800}
              animationEasing="ease-in-out"
            >
              {data.map((_, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={IFOOD_PALETTE[index % IFOOD_PALETTE.length]} 
                  className="hover:opacity-80 transition-opacity cursor-pointer outline-none"
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/5 flex justify-between items-center shrink-0">
        <p className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-widest">
          {t.charts.topProducts.footer}
        </p>
        <div className="flex gap-1.5">
          {IFOOD_PALETTE.map((color, i) => (
            <div key={i} className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
          ))}
        </div>
      </div>
      
    </div>
  );
}