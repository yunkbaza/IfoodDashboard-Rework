"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  DndContext, 
  DragEndEvent, 
  DragStartEvent, 
  DragOverlay, 
  useSensor, 
  useSensors, 
  PointerSensor, 
  closestCorners,
  useDroppable // ✅ CORREÇÃO 1: Importado para tornar a coluna "soltável" mesmo vazia
} from "@dnd-kit/core";
import { SortableContext, useSortable, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { getPedidos, atualizarStatusPedido } from "../services/api";
import { Clock, ChefHat, CheckCircle2, Loader2, RefreshCcw, MapPin, CreditCard } from "lucide-react";
import { toast } from "sonner";

// STRICT TYPING BASED ON PYTHON BACKEND
export interface Pedido {
  id_pedido: string;
  status: string;
  valor_total: number;
  taxa_entrega: number;
  forma_pagamento: string;
  bairro_destino: string;
  data_hora: string;
}

// ==========================================
// 🃏 COMPONENT: ORDER CARD (DRAGGABLE)
// ==========================================
function KanbanCard({ pedido }: { pedido: Pedido }) {
  const { 
    attributes, listeners, setNodeRef, transform, transition, isDragging 
  } = useSortable({
    id: pedido.id_pedido,
    data: { tipo: "Pedido", pedido }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners} 
      className="bg-white dark:bg-[#111113] p-5 rounded-3xl shadow-sm border border-slate-200 dark:border-white/5 cursor-grab active:cursor-grabbing hover:border-[#EA1D2C]/40 hover:shadow-md transition-all group relative overflow-hidden"
    >
      {/* Side stripe for status color coding */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${pedido.status === 'PENDENTE' ? 'bg-[#EA1D2C]' : pedido.status === 'PREPARANDO' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
      
      <div className="flex justify-between items-start mb-3">
        <div>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Order ID</span>
          <span className="text-sm font-black text-slate-900 dark:text-white">{pedido.id_pedido}</span>
        </div>
        <div className="text-right">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Total Value</span>
          <span className="text-sm font-black text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-lg tabular-nums">
            $ {pedido.valor_total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      <div className="space-y-2 mt-4 pt-4 border-t border-slate-100 dark:border-white/5">
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
          <MapPin size={14} className="text-slate-400" />
          <span className="text-xs font-bold truncate">{pedido.bairro_destino}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
          <CreditCard size={14} className="text-slate-400" />
          <span className="text-[10px] font-bold uppercase tracking-wider">
            {pedido.forma_pagamento === 'Cartão de Crédito' ? 'Credit Card' : 
             pedido.forma_pagamento === 'Cartão de Débito' ? 'Debit Card' : 
             pedido.forma_pagamento === 'Dinheiro' ? 'Cash' : pedido.forma_pagamento}
          </span>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 🏛️ COMPONENT: COLUMN (DROPPABLE)
// ==========================================
interface ColumnProps {
  id: string;
  title: string;
  icon: React.ElementType;
  theme: 'danger' | 'warning' | 'success';
  pedidos: Pedido[];
  limitInfo?: string;
}

function KanbanColumn({ id, title, icon: Icon, theme, pedidos, limitInfo }: ColumnProps) {
  // ✅ CORREÇÃO 2: A coluna agora é uma zona de drop oficial
  const { setNodeRef } = useDroppable({ id });

  const themeStyles = {
    danger: { bg: 'bg-[#EA1D2C]/10', text: 'text-[#EA1D2C]', border: 'border-[#EA1D2C]/20' },
    warning: { bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/20' },
    success: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/20' }
  };

  return (
    <div className="flex flex-col bg-slate-50 dark:bg-white/5 rounded-[40px] p-6 border border-slate-200 dark:border-white/5 h-full">
      
      {/* Column Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-2xl ${themeStyles[theme].bg} ${themeStyles[theme].text}`}>
            <Icon size={22} strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tighter text-lg leading-none">{title}</h3>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{pedidos.length} tickets</span>
          </div>
        </div>
      </div>

      {/* Sortable Context with Droppable Ref */}
      <SortableContext items={pedidos.map(p => p.id_pedido)}>
        {/* ✅ O setNodeRef garante que a coluna vazia aceite o card */}
        <div ref={setNodeRef} className="flex-1 flex flex-col gap-4 min-h-[500px] overflow-y-auto custom-scrollbar pr-2 pb-4">
          {pedidos.map(p => <KanbanCard key={p.id_pedido} pedido={p} />)}
          
          {pedidos.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-white/10 rounded-3xl opacity-50 min-h-[150px]">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Drop orders here</span>
            </div>
          )}

          {limitInfo && pedidos.length >= 10 && (
             <div className="text-center p-3 text-[10px] font-black uppercase tracking-widest text-slate-400 border border-dashed border-slate-300 dark:border-white/10 rounded-2xl mt-2">
               {limitInfo}
             </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}

// ==========================================
// 🚀 MAIN COMPONENT: KANBAN BOARD
// ==========================================
export default function KanbanBoard({ periodo }: { periodo: string }) {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const [activePedido, setActivePedido] = useState<Pedido | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const fetchPedidos = useCallback(async () => {
    try {
      const data = await getPedidos(periodo);
      setPedidos(data);
    } catch (error) {
      toast.error("Failed to sync kitchen orders.");
    } finally {
      setLoading(false);
    }
  }, [periodo]);

  useEffect(() => {
    fetchPedidos();
  }, [fetchPedidos]);

  // WebSocket for Live Updates
  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://127.0.0.1:8000/ws/pedidos"; 
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
  }, [fetchPedidos]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const pedido = pedidos.find(p => p.id_pedido === active.id);
    if (pedido) setActivePedido(pedido);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActivePedido(null);
    const { active, over } = event;
    if (!over) return; 

    const idPedido = active.id as string;
    const overId = over.id as string;
    
    const pedidoArrastado = pedidos.find(p => p.id_pedido === idPedido);
    if (!pedidoArrastado) return;

    const statusAntigo = pedidoArrastado.status || 'PENDENTE';
    
    // ✅ CORREÇÃO 3: Lógica aprimorada para descobrir se soltou na coluna ou em outro card
    const colunasValidas = ["PENDENTE", "PREPARANDO", "CONCLUIDO"];
    let statusNovo = statusAntigo;

    if (colunasValidas.includes(overId)) {
      statusNovo = overId; // Soltou no espaço vazio da coluna
    } else {
      const pedidoDestino = pedidos.find(p => p.id_pedido === overId);
      if (pedidoDestino) {
        statusNovo = pedidoDestino.status || 'PENDENTE'; // Soltou em cima de outro card
      }
    }

    // Reordenação na mesma coluna
    if (statusAntigo === statusNovo) {
      const activeIndex = pedidos.findIndex(p => p.id_pedido === active.id);
      const overIndex = pedidos.findIndex(p => p.id_pedido === over.id);
      if (activeIndex !== overIndex) {
        setPedidos(arrayMove(pedidos, activeIndex, overIndex));
      }
      return;
    }

    // OPTIMISTIC UI: Update screen instantly
    setPedidos(prev => prev.map(p => p.id_pedido === idPedido ? { ...p, status: statusNovo } : p));

    // Save to Database
    try {
      await atualizarStatusPedido(idPedido, statusNovo);
      const niceStatusName = statusNovo === 'PREPARANDO' ? 'In Kitchen' : statusNovo === 'CONCLUIDO' ? 'Dispatched' : 'New Orders';
      toast.success(`Order moved to ${niceStatusName}`);
    } catch (error) {
      // ROLLBACK: Revert action on failure
      toast.error("Failed to update server. Reverting action.");
      setPedidos(prev => prev.map(p => p.id_pedido === idPedido ? { ...p, status: statusAntigo } : p));
    }
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-[#EA1D2C]" size={40} />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Preparing Workstation</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col animate-in fade-in duration-500">
      
      {/* WebSocket Status Badge */}
      <div className="flex items-center gap-3 mb-8 px-5 py-3 bg-slate-50 dark:bg-[#111113] border border-slate-200 dark:border-white/5 rounded-2xl w-fit shadow-sm">
        <span className="relative flex h-3 w-3">
          {isLive && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
          <span className={`relative inline-flex rounded-full h-3 w-3 ${isLive ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
        </span>
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 flex items-center gap-2">
          {isLive ? 'Kitchen Link: Active' : 'Kitchen Link: Offline'}
          {isLive && <RefreshCcw size={14} className="animate-spin text-slate-400" />}
        </span>
      </div>

      {/* Drag and Drop Area */}
      <DndContext 
        sensors={sensors} 
        collisionDetection={closestCorners} 
        onDragStart={handleDragStart} 
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1">
          {/* Column 1: New Orders */}
          <SortableContext id="PENDENTE" items={pedidos.filter(p => p.status === "PENDENTE" || !p.status).map(p => p.id_pedido)}>
            <KanbanColumn 
              id="PENDENTE" title="New Orders" icon={Clock} theme="danger" 
              pedidos={pedidos.filter(p => p.status === "PENDENTE" || !p.status)} 
            />
          </SortableContext>

          {/* Column 2: In Kitchen */}
          <SortableContext id="PREPARANDO" items={pedidos.filter(p => p.status === "PREPARANDO").map(p => p.id_pedido)}>
            <KanbanColumn 
              id="PREPARANDO" title="In Kitchen" icon={ChefHat} theme="warning" 
              pedidos={pedidos.filter(p => p.status === "PREPARANDO")} 
            />
          </SortableContext>

          {/* Column 3: Dispatched */}
          <SortableContext id="CONCLUIDO" items={pedidos.filter(p => p.status === "CONCLUIDO").map(p => p.id_pedido)}>
            <KanbanColumn 
              id="CONCLUIDO" title="Dispatched" icon={CheckCircle2} theme="success" 
              pedidos={pedidos.filter(p => p.status === "CONCLUIDO").slice(0, 10)} 
              limitInfo="Only the latest 10 tickets are visible"
            />
          </SortableContext>
        </div>

        {/* Ghost element while dragging */}
        <DragOverlay>
          {activePedido ? <KanbanCard pedido={activePedido} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}