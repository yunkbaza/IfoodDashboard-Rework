"use client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface BairroData {
  bairro: string;
  pedidos: number;
}

export default function BairrosChart({ data }: { data: BairroData[] }) {
  // Cores alternadas para um visual moderno
  const colors = ['#EA1D2C', '#FF4D5A', '#B7141F', '#FF8A93'];

  return (
    <div className="h-full w-full flex flex-col">
      <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Pedidos por Região</h2>
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 30, right: 30 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#2C2C2E" opacity={0.1} />
            <XAxis type="number" hide />
            <YAxis 
              dataKey="bairro" 
              type="category" 
              width={100}
              axisLine={false}
              tickLine={false}
              fontSize={13}
              fontWeight={600}
              className="fill-slate-600 dark:fill-gray-400"
            />
            <Tooltip 
              cursor={{fill: 'transparent'}}
              contentStyle={{ backgroundColor: '#1C1C1E', borderRadius: '12px', border: 'none', color: '#fff' }}
            />
            <Bar dataKey="pedidos" radius={[0, 8, 8, 0]} barSize={25}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}