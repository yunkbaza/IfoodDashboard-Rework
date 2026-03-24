"use client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DailySalesData {
  data: string;  
  valor: number; 
}

export default function SalesChart({ data }: { data: DailySalesData[] }) {
  return (
    <div className="h-full w-full flex flex-col">
      <h2 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight mb-6 transition-colors">
        Evolução do Faturamento
      </h2>
      
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart 
            data={data} 
            // Ajustei as margens para o gráfico respirar e não ficar espremido nas bordas
            margin={{ top: 10, right: 20, left: 10, bottom: 10 }}
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              vertical={false} 
              stroke="#2C2C2E" 
              opacity={0.1} 
            />
            
            <XAxis 
              dataKey="data" 
              stroke="#8E8E93" 
              fontSize={11} 
              tickLine={false} 
              axisLine={false} 
              dy={10} 
            />
            
            <YAxis 
              stroke="#8E8E93" 
              fontSize={11} 
              tickLine={false} 
              axisLine={false} 
              tickFormatter={(value) => `R$${value}`} 
              // Removi o dx negativo para a label não fugir do gráfico
              width={60}
            />
            
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1C1C1E', 
                borderRadius: '16px', 
                border: '1px solid #2C2C2E', 
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.5)',
                color: '#fff',
                padding: '12px'
              }}
              itemStyle={{ color: '#EA1D2C', fontWeight: 'bold' }}
              cursor={{ stroke: '#EA1D2C', strokeWidth: 1, strokeDasharray: '4 4' }}
            />
            
            <Line 
              type="monotone" 
              dataKey="valor" 
              name="Faturamento"
              stroke="#EA1D2C" 
              strokeWidth={4} 
              // Restaurado o visual premium dos pontos
              dot={{ r: 5, fill: '#1C1C1E', stroke: '#EA1D2C', strokeWidth: 2 }} 
              activeDot={{ r: 8, fill: '#EA1D2C', stroke: '#fff', strokeWidth: 2 }} 
              // Sombra suave na linha para dar profundidade
              style={{ filter: "drop-shadow(0px 4px 8px rgba(234, 29, 44, 0.3))" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}