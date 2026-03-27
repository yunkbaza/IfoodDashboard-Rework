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
import { MapPin } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext"; // ✅ Integração com o sistema de tradução

interface BairroData {
  bairro: string;
  pedidos: number;
}

export default function BairrosChart({ data }: { data: BairroData[] }) {
  const { t } = useLanguage(); // ✅ Hook de idioma ativado

  // ✅ IFOOD LOGISTICS PALETTE: Tons de vermelho para mapeamento de calor
  const IFOOD_RED_SHADES = [
    '#EA1D2C', // Principal
    '#B31622', // Escuro
    '#F23D4C', // Vivo
    '#E0525D', // Suave
    '#FF8C96', // Pastel
  ];

  return (
    // ✅ ESTRUTURA ELÁSTICA: Garante que ocupe perfeitamente o grid do dashboard
    <div className="flex-1 flex flex-col min-h-0 w-full group">
      
      {/* Cabeçalho de Alta Definição - shrink-0 impede compressão */}
      <div className="mb-6 shrink-0">
        <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.4em] mb-1">
          {t.charts.bairros.subtitle}
        </h3>
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-[#EA1D2C]/10 text-[#EA1D2C]">
            <MapPin size={20} />
          </div>
          <p className="text-xl lg:text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">
            {t.charts.bairros.title}
          </p>
        </div>
      </div>

      {/* Container do Gráfico (Este é o que cresce/encolhe dinamicamente) */}
      <div className="flex-1 min-h-0 w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={data} 
            layout="vertical" 
            margin={{ top: 0, right: 20, left: 10, bottom: 0 }}
          >
            {/* Grelha de referência sutil */}
            <CartesianGrid 
              strokeDasharray="0" 
              horizontal={false} 
              stroke="currentColor" 
              className="text-slate-100 dark:text-white/5" 
            />

            <XAxis type="number" hide />
            
            <YAxis 
              dataKey="bairro" 
              type="category" 
              axisLine={false} 
              tickLine={false} 
              width={110} // ✅ Espaço fixo para não colar os nomes nas barras
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
                      {/* Truncagem elegante para nomes longos */}
                      {payload.value.length > 18 ? `${payload.value.substring(0, 18)}...` : payload.value}
                    </text>
                  </g>
                );
              }}
            />

            <Tooltip 
              cursor={{ fill: 'rgba(234, 29, 44, 0.04)' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  return (
                    <div className="bg-white/95 dark:bg-[#111113]/95 backdrop-blur-xl p-5 rounded-3xl shadow-2xl border border-slate-100 dark:border-white/10 ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-200">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                        {t.charts.bairros.tooltip}
                      </p>
                      <p className="text-sm font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">
                        {item.bairro}
                      </p>
                      <div className="flex items-baseline gap-2">
                        <p className="text-2xl font-black text-[#EA1D2C] tabular-nums">
                          {item.pedidos}
                        </p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">
                          {t.charts.bairros.total}
                        </p>
                      </div>
                      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-white/5">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <p className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-tight">
                            {t.charts.bairros.badge}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />

            <Bar 
              dataKey="pedidos" 
              radius={[0, 8, 8, 0]} // Cantos arredondados consistentes
              barSize={28} // Barras mais robustas
              animationDuration={1800}
              animationEasing="ease-in-out"
            >
              {data.map((_, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={IFOOD_RED_SHADES[index % IFOOD_RED_SHADES.length]} 
                  fillOpacity={0.9}
                  className="hover:opacity-100 transition-opacity cursor-pointer outline-none"
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Footer informativo traduzido - shrink-0 garante presença constante */}
      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/5 flex justify-between items-center shrink-0">
        <p className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest">
          {t.charts.bairros.footer}
        </p>
        <div className="flex gap-1.5">
          {IFOOD_RED_SHADES.map((color, i) => (
            <div key={i} className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
          ))}
        </div>
      </div>
      
    </div>
  );
}