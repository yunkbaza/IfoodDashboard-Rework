"use client";

import { useState, useEffect } from "react";
import { DndContext, DragEndEvent, useDraggable, useDroppable } from "@dnd-kit/core";
import { getPedidos, atualizarStatusPedido } from "../services/api";
import { Clock, ChefHat, CheckCircle2, Loader2, RefreshCcw } from "lucide-react";

// ✅ RESOLVENDO O "ANY": Criamos uma interface com os tipos reais do seu Banco de Dados
interface Pedido {
  id_pedido: string;
  status: string;
  valor_total: number;
  taxa_entrega: number;
  forma_pagamento: string;
  bairro_destino: string;
  data_hora: string;
}

function KanbanCard({ pedido }: { pedido: Pedido }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: pedido.id_pedido,
    data: { statusAtual: pedido.status }
  });

  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, zIndex: 50 } : undefined;

  return (
    <div ref={setNodeRef} {...listeners} {...attributes} style={style} className="bg-white dark:bg-[#242426] p-4 rounded-xl shadow-sm border border-slate-200 dark:border-[#2C2C2E] cursor-grab active:cursor-grabbing hover:border-[#EA1D2C]/50 transition-colors">
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs font-bold text-slate-500 dark:text-[#8E8E93]">{pedido.id_pedido}</span>
        <span className="text-xs font-black text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-1 rounded-md">
          R$ {pedido.valor_total.toFixed(2)}
        </span>
      </div>
      <p className="text-sm font-bold text-slate-800 dark:text-white mb-2">{pedido.bairro_destino}</p>
      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
        <span>{pedido.forma_pagamento}</span>
      </div>
    </div>
  );
}

interface ColumnProps {
  id: string;
  title: string;
  icon: React.ElementType;
  color: string;
  pedidos: Pedido[];
  limitInfo?: string;
}

function KanbanColumn({ id, title, icon: Icon, color, pedidos, limitInfo }: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  // ✅ RESOLVENDO TAILWIND: Usando rounded-3xl em vez de [24px]
  return (
    <div ref={setNodeRef} className={`flex flex-col bg-slate-100/50 dark:bg-[#1C1C1E]/50 rounded-3xl p-4 border-2 transition-colors ${isOver ? `border-${color}-500 bg-${color}-50 dark:bg-${color}-900/10` : 'border-transparent'}`}>
      <div className="flex items-center gap-3 mb-6 px-2">
        <div className={`p-2 rounded-xl bg-${color}-100 dark:bg-${color}-900/30 text-${color}-600 dark:text-${color}-400`}><Icon size={20} /></div>
        <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-tight">{title}</h3>
        <span className="ml-auto bg-white dark:bg-[#2C2C2E] text-slate-500 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">{pedidos.length}</span>
      </div>
      {/* ✅ RESOLVENDO TAILWIND: Usando min-h-125 (se disponível) ou mantendo o valor fixo se preferir */}
      <div className="flex flex-col gap-3 min-h-[500px]">
        {pedidos.map(p => <KanbanCard key={p.id_pedido} pedido={p} />)}
        {limitInfo && pedidos.length >= 10 && (
           <div className="text-center p-3 text-xs font-bold text-slate-400 border border-dashed border-slate-300 dark:border-[#2C2C2E] rounded-xl mt-2">
             {limitInfo}
           </div>
        )}
      </div>
    </div>
  );
}

export default function KanbanBoard({ periodo }: { periodo: string }) {
  const [pedidos, setPedidos] = useState<Pedido[]>([]); // ✅ Agora é uma lista de Pedidos, não 'any'
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);

  async function fetchPedidos() {
    try {
      const data = await getPedidos(periodo);
      setPedidos(data);
    } catch (error) {
      console.error("Erro ao carregar pedidos para o Kanban", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPedidos();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [periodo]);

  useEffect(() => {
    const wsUrl = "ws://localhost:8000/ws/pedidos"; 
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => setIsLive(true);
    socket.onclose = () => setIsLive(false);

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.action === "new_order" || data.action === "update_status") {
        fetchPedidos();
      }
    };

    return () => socket.close();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [periodo]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return; 

    const idPedido = active.id as string;
    const dataAtual = active.data.current as { statusAtual: string };
    const statusAntigo = dataAtual?.statusAtual;
    const statusNovo = over.id as string;

    if (statusAntigo === statusNovo) return;

    setPedidos(prev => prev.map(p => p.id_pedido === idPedido ? { ...p, status: statusNovo } : p));

    try {
      await atualizarStatusPedido(idPedido, statusNovo);
    } catch (error) {
      console.error("Erro ao salvar status", error);
      setPedidos(prev => prev.map(p => p.id_pedido === idPedido ? { ...p, status: statusAntigo } : p));
    }
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-slate-400" size={32} /></div>;

  return (
    <div>
      <div className="flex items-center gap-2 mb-6 px-4 py-2 bg-slate-50 dark:bg-[#1C1C1E] border border-slate-200 dark:border-[#2C2C2E] rounded-xl w-fit">
        <span className="relative flex h-3 w-3">
          {isLive && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
          <span className={`relative inline-flex rounded-full h-3 w-3 ${isLive ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
        </span>
        <span className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-2">
          {isLive ? 'Sincronização em Tempo Real Ativa' : 'Desconectado'}
          {isLive && <RefreshCcw size={12} className="animate-spin text-slate-400" />}
        </span>
      </div>

      <DndContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <KanbanColumn 
            id="PENDENTE" title="Novos Pedidos" icon={Clock} color="blue" 
            pedidos={pedidos.filter(p => p.status === "PENDENTE" || !p.status)} 
          />
          <KanbanColumn 
            id="PREPARANDO" title="Na Cozinha" icon={ChefHat} color="orange" 
            pedidos={pedidos.filter(p => p.status === "PREPARANDO")} 
          />
          <KanbanColumn 
            id="CONCLUIDO" title="Entregues" icon={CheckCircle2} color="emerald" 
            pedidos={pedidos.filter(p => p.status === "CONCLUIDO").slice(0, 10)} 
            limitInfo="Apenas os últimos 10 visíveis"
          />
        </div>
      </DndContext>
    </div>
  );
}