"use client";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface HorarioData {
  hora: string;
  pedidos: number;
}

export default function HorariosChart({ data }: { data: HorarioData[] }) {
  return (
    <div className="h-full w-full flex flex-col">
      <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Fluxo por Horário</h2>
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorHora" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EA1D2C" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#EA1D2C" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2C2C2E" opacity={0.1} />
            <XAxis 
              dataKey="hora" 
              axisLine={false} 
              tickLine={false} 
              fontSize={12} 
              className="fill-slate-500 dark:fill-gray-400"
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              fontSize={12} 
              className="fill-slate-500 dark:fill-gray-400"
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1C1C1E', borderRadius: '12px', border: 'none', color: '#fff' }}
              itemStyle={{ color: '#EA1D2C' }}
            />
            <Area 
              type="monotone" 
              dataKey="pedidos" 
              stroke="#EA1D2C" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorHora)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}