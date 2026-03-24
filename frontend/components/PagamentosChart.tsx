"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface PagamentoData {
  tipo: string;
  valor: number;
}

export default function PagamentosChart({ data }: { data: PagamentoData[] }) {
  // Paleta oficial iFood Pro
  const COLORS: Record<string, string> = {
    'CARTAO': '#EA1D2C', 
    'PIX': '#10b981',    
    'DINHEIRO': '#f59e0b' 
  };

  const getColor = (tipo: string) => COLORS[tipo.toUpperCase()] || '#8E8E93';

  // Cálculo do volume total para as porcentagens
  const total = data.reduce((acc, entry) => acc + entry.valor, 0);

  return (
    <div className="h-full w-full flex flex-col">
      <div className="mb-2">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white transition-colors">
          Métodos de Pagamento
        </h2>
        <p className="text-sm text-slate-500 dark:text-[#8E8E93] font-medium transition-colors">
          Preferência de faturamento
        </p>
      </div>
      
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="48%"
              innerRadius={75}
              outerRadius={110}
              paddingAngle={6}
              dataKey="valor"
              nameKey="tipo"
              stroke="none"
              animationBegin={200}
              animationDuration={1000}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={getColor(entry.tipo)} 
                  className="hover:opacity-85 transition-opacity cursor-pointer outline-none"
                />
              ))}
            </Pie>
            
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1C1C1E', 
                borderRadius: '16px', 
                border: '1px solid #2C2C2E',
                color: '#fff',
                padding: '12px',
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.5)'
              }}
              itemStyle={{ fontWeight: 'bold', fontSize: '14px' }}
              // CORREÇÃO DEFINITIVA: Adicionado 'readonly' para aceitar o array interno do Recharts
              formatter={(value: string | number | readonly (string | number)[] | undefined) => {
                const rawValue = Array.isArray(value) ? value[0] : value;
                const val = Number(rawValue) || 0;
                const percent = total > 0 ? ((val / total) * 100).toFixed(1) : "0";
                
                return [`${val} pedidos (${percent}%)`, 'Volume'];
              }}
            />
            
            <Legend 
              verticalAlign="bottom" 
              align="center"
              iconType="circle"
              iconSize={10}
              wrapperStyle={{ paddingTop: '20px' }}
              // Tipagem segura para a legenda também
              formatter={(value: string) => (
                <span className="text-xs font-bold text-slate-600 dark:text-gray-400 uppercase tracking-widest ml-1">
                  {value}
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}