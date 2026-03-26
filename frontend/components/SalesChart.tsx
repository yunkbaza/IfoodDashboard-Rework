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
import { TrendingUp, ShieldCheck } from "lucide-react";

interface SalesChartProps {
  data: { data: string; valor: number }[];
}

export default function SalesChart({ data }: SalesChartProps) {
  return (
    // ✅ ELASTIC STRUCTURE: Ensures the chart fills the card without stretching
    <div className="flex-1 flex flex-col min-h-0 w-full group">
      
      {/* Chart Header - shrink-0 prevents text from being cut off */}
      <div className="mb-6 shrink-0">
        <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.4em] mb-1">
          Financial Performance
        </h3>
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-[#EA1D2C]/10 text-[#EA1D2C]">
            <TrendingUp size={20} />
          </div>
          <p className="text-xl lg:text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">
            Sales Trend
          </p>
        </div>
      </div>

      {/* Recharts Container */}
      <div className="flex-1 min-h-0 w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart 
            data={data} 
            // ✅ ADJUSTED MARGINS: Prevents the last point or currency value from being cut off
            margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
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
              dataKey="data" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 10, fontWeight: 800 }} 
              dy={15}
            />

            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 10, fontWeight: 500 }}
              tickFormatter={(value) => `$ ${value}`}
              width={65} // Ensures fixed space for "$ XXXX"
            />

            <Tooltip 
              cursor={{ stroke: '#EA1D2C', strokeWidth: 1, strokeDasharray: '4 4' }}
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white/95 dark:bg-[#111113]/95 backdrop-blur-xl p-5 rounded-3xl shadow-2xl border border-slate-100 dark:border-white/10 ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-200">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                        Daily Revenue
                      </p>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full bg-[#EA1D2C] animate-pulse" />
                        <p className="text-sm font-black dark:text-white uppercase tracking-tight">
                          {label}
                        </p>
                      </div>
                      <p className="text-2xl font-black text-[#EA1D2C] tabular-nums">
                        $ {payload[0].value?.toLocaleString('en-US', { 
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2 
                        })}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />

            <Area 
              type="monotone" 
              dataKey="valor" 
              stroke="#EA1D2C" 
              strokeWidth={4}
              fillOpacity={1} 
              fill="url(#colorSales)" 
              activeDot={{ 
                r: 6, 
                fill: "#EA1D2C", 
                stroke: "#fff", 
                strokeWidth: 3,
              }}
              dot={{ 
                r: 3, 
                fill: "#EA1D2C", 
                strokeWidth: 0,
                fillOpacity: 0.4
              }}
              animationDuration={2000}
              animationEasing="ease-in-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Fixed Footer: Matches the design of the other charts */}
      <div className="mt-4 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[#EA1D2C]" />
          <p className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-widest">
            Gross Revenue
          </p>
        </div>
        <div className="px-3 py-1 bg-slate-50 dark:bg-[#1C1C1E] rounded-lg border dark:border-white/5 flex items-center gap-1">
          <ShieldCheck size={12} className="text-emerald-500" />
          <span className="text-[8px] font-black text-slate-500 uppercase tracking-tight">Exact Calculation</span>
        </div>
      </div>
      
    </div>
  );
}