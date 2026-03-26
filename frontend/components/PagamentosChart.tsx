"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface PagamentoData {
  tipo: string;
  valor: number;
}

export default function PagamentosChart({ data }: { data: PagamentoData[] }) {
  // Mapeamento de cores baseado nos tipos enviados pelo backend
  const COLORS: Record<string, string> = {
    'PIX': '#10b981',
    'CARTÃO DE CRÉDITO': '#EA1D2C',
    'CARTÃO DE DÉBITO': '#FF7A00',
    'DINHEIRO': '#f59e0b',
    'CARTAO': '#EA1D2C'
  };

  const getColor = (tipo: string) => {
    const key = tipo.toUpperCase();
    return COLORS[key] || '#8E8E93';
  };

  // Cálculo do total para as porcentagens
  const total = data.reduce((acc, entry) => acc + entry.valor, 0);

  return (
    <div className="h-full w-full flex flex-col">
      <div className="mb-2">
        <h2 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">
          Métodos de Pagamento
        </h2>
        <p className="text-[10px] text-slate-500 dark:text-[#8E8E93] font-bold uppercase tracking-widest">
          Preferência de faturamento
        </p>
      </div>
      
      <div className="flex-1 w-full min-h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="80%" 
              startAngle={180}
              endAngle={0}
              innerRadius={80}
              outerRadius={125}
              paddingAngle={8}
              dataKey="valor"
              nameKey="tipo"
              stroke="none"
              animationBegin={0}
              animationDuration={1200}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={getColor(entry.tipo)} 
                  className="outline-none hover:opacity-80 transition-opacity cursor-pointer"
                />
              ))}
            </Pie>
            
            <Tooltip 
              cursor={{ fill: 'transparent' }}
              contentStyle={{ 
                backgroundColor: '#1C1C1E', 
                borderRadius: '12px', 
                border: 'none',
                color: '#fff',
                fontSize: '12px',
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.3)'
              }}
              // ✅ CORREÇÃO TS DEFINITIVA: Adicionado 'readonly' à definição do array
              formatter={(value: number | string | readonly (number | string)[] | undefined) => {
                // Tratamos o valor caso ele venha como array ou valor único
                const rawValue = Array.isArray(value) ? value[0] : value;
                const numericValue = Number(rawValue) || 0;
                const percent = total > 0 ? ((numericValue / total) * 100).toFixed(1) : "0";
                
                return [`${numericValue} pedidos (${percent}%)`, 'Volume'];
              }}
            />
            
            <Legend 
              verticalAlign="bottom" 
              align="center"
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ paddingBottom: '15px' }}
              formatter={(value: string) => (
                <span className="text-[10px] font-black text-slate-500 dark:text-gray-400 uppercase tracking-widest ml-1">
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