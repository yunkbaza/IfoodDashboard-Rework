"use client";

import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { Clock } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext"; // ✅ Importado para internacionalização

interface HorarioData {
  hora: string;
  pedidos: number;
}

export default function HorariosChart({ data }: { data: HorarioData[] }) {
  const { lang, t } = useLanguage(); // ✅ Hook de tradução ativado

  return (
    <div className="h-full w-full flex flex-col">
      {/* Cabeçalho de Alta Performance Traduzido */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-1">
            {t.charts.horarios.subtitle}
          </h3>
          <div className="flex items-center gap-2">
            <Clock className="text-[#EA1D2C]" size={22} />
            <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">
              {t.charts.horarios.title}
            </p>
          </div>
        </div>
      </div>

      {/* Container do Gráfico */}
      <div className="flex-1 w-full min-h-75">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart 
            data={data} 
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorHoraRed" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EA1D2C" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#EA1D2C" stopOpacity={0}/>
              </linearGradient>
            </defs>

            <CartesianGrid 
              strokeDasharray="0" 
              vertical={false} 
              stroke="currentColor" 
              className="text-slate-100 dark:text-white/5" 
            />

            <XAxis 
              dataKey="hora" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }} 
              dy={15}
            />

            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 10, fontWeight: 500 }}
              // ✅ Formatação de número localizada para o eixo
              tickFormatter={(value) => value.toLocaleString(lang === 'en' ? 'en-US' : 'pt-BR')} 
            />

            <Tooltip 
              cursor={{ stroke: '#EA1D2C', strokeWidth: 1, strokeDasharray: '4 4' }}
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const numericValue = Number(payload[0].value) || 0;

                  return (
                    <div className="bg-white/95 dark:bg-[#111113]/95 backdrop-blur-xl p-5 rounded-3xl shadow-2xl border border-slate-100 dark:border-white/10 ring-1 ring-black/5">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                        {t.charts.horarios.tooltip}
                      </p>
                      <div className="flex items-center gap-3 mb-1">
                        <div className="w-2 h-2 rounded-full bg-[#EA1D2C] animate-pulse" />
                        <p className="text-sm font-black text-slate-900 dark:text-white">
                          {label}
                        </p>
                      </div>
                      <p className="text-2xl font-black text-[#EA1D2C] tracking-tighter">
                        {/* ✅ Formatação de número localizada no Tooltip */}
                        {numericValue.toLocaleString(lang === 'en' ? 'en-US' : 'pt-BR')} 
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-normal ml-1">
                          {t.charts.horarios.orders}
                        </span>
                      </p>
                      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-white/5">
                        <p className="text-[9px] font-bold text-slate-500 uppercase">
                          {numericValue > 10 ? t.charts.horarios.high : t.charts.horarios.low}
                        </p>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />

            <Area 
              type="monotone" 
              dataKey="pedidos" 
              stroke="#EA1D2C" 
              strokeWidth={4}
              fillOpacity={1} 
              fill="url(#colorHoraRed)" 
              activeDot={{ 
                r: 6, 
                fill: "#EA1D2C", 
                stroke: "#fff", 
                strokeWidth: 3,
                className: "shadow-2xl" 
              }}
              animationDuration={2500}
              animationEasing="ease-in-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Footer informativo traduzido */}
      <div className="mt-6 pt-6 border-t border-slate-100 dark:border-white/5 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#EA1D2C]" />
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
            {t.charts.horarios.footer}
          </p>
        </div>
        <p className="text-[9px] font-bold text-emerald-500 uppercase bg-emerald-500/10 px-2 py-1 rounded-md">
          {t.charts.horarios.badge}
        </p>
      </div>
    </div>
  );
}