import { Trophy } from "lucide-react";

interface Product {
  nome: string;
  quantidade: number;
  receita: number;
}

export default function TopProducts({ data }: { data: Product[] }) {
  return (
    <div className="h-full w-full flex flex-col">
      <div className="flex items-center gap-3 mb-6">
        {/* Troféu com o Vermelho iFood */}
        <Trophy className="text-[#EA1D2C]" size={26} />
        <h2 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight transition-colors">
          Top Produtos
        </h2>
      </div>
      
      <div className="flex-1 flex flex-col gap-3 overflow-y-auto pr-2">
        {data.map((produto, index) => (
          <div 
            key={index} 
            // Fundo interativo: Branco no claro, Grafite no escuro
            className="flex items-center justify-between p-4 bg-slate-50 dark:bg-[#242426] rounded-2xl border border-slate-100 dark:border-[#2C2C2E] hover:border-slate-200 dark:hover:border-[#48484A] hover:bg-slate-100 dark:hover:bg-[#2A2A2D] transition-all cursor-default group"
          >
            <div className="flex items-center gap-4">
              {/* Círculo da posição (1º, 2º...) */}
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-[#2C2C2E] font-bold text-slate-700 dark:text-gray-200 shadow-sm group-hover:border-slate-300 dark:group-hover:border-[#48484A] transition-colors">
                {index + 1}
              </div>
              <div>
                <p className="font-semibold text-slate-800 dark:text-gray-100 text-base transition-colors">
                  {produto.nome}
                </p>
                <p className="text-sm text-slate-500 dark:text-[#8E8E93] mt-0.5 transition-colors">
                  {produto.quantidade} unidades vendidas
                </p>
              </div>
            </div>
            {/* Receita: Verde escuro no modo claro, verde neon no escuro */}
            <div className="font-bold text-emerald-600 dark:text-emerald-400 text-lg tracking-tight transition-colors">
              R$ {produto.receita.toFixed(2).replace('.', ',')}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}