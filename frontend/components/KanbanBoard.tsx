"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  DndContext, 
  DragEndEvent, 
  DragStartEvent, // ✅ IMPORTADO: Tipagem correta para o início do Drag
  DragOverlay, 
  useSensor, 
  useSensors, 
  PointerSensor, 
  closestCorners 
} from "@dnd-kit/core";
import { SortableContext, useSortable, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { getPedidos, atualizarStatusPedido } from "../services/api";
import { Clock, ChefHat, CheckCircle2, Loader2, RefreshCcw, MapPin, CreditCard } from "lucide-react";
import { toast } from "sonner";

// ✅ TIPAGEM ESTRITA BASEADA NO BACKEND PYTHON
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
// 🃏 COMPONENTE: CARD DO PEDIDO (DRAGGABLE)
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
      {/* Faixa lateral para dar cor ao card baseado no status */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${pedido.status === 'PENDENTE' ? 'bg-[#EA1D2C]' : pedido.status === 'PREPARANDO' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
      
      <div className="flex justify-between items-start mb-3">
        <div>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">ID do Pedido</span>
          <span className="text-sm font-black text-slate-900 dark:text-white">{pedido.id_pedido}</span>
        </div>
        <div className="text-right">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Valor Total</span>
          <span className="text-sm font-black text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-lg tabular-nums">
            R$ {pedido.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
          <span className="text-[10px] font-bold uppercase tracking-wider">{pedido.forma_pagamento}</span>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 🏛️ COMPONENTE: COLUNA (DROPPABLE)
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
  // Mapeamento de temas para cores dinâmicas (Tailwind seguro)
  const themeStyles = {
    danger: { bg: 'bg-[#EA1D2C]/10', text: 'text-[#EA1D2C]', border: 'border-[#EA1D2C]/20' },
    warning: { bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/20' },
    success: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/20' }
  };

  return (
    <div className="flex flex-col bg-slate-50 dark:bg-white/5 rounded-[40px] p-6 border border-slate-200 dark:border-white/5 h-full">
      
      {/* Cabeçalho da Coluna */}
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

      {/* Área Dropável com Contexto de Ordenação */}
      <SortableContext items={pedidos.map(p => p.id_pedido)}>
        <div className="flex-1 flex flex-col gap-4 min-h-[500px] overflow-y-auto custom-scrollbar pr-2 pb-4">
          {pedidos.map(p => <KanbanCard key={p.id_pedido} pedido={p} />)}
          
          {pedidos.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-white/10 rounded-3xl opacity-50 min-h-[150px]">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Solte pedidos aqui</span>
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
// 🚀 COMPONENTE PRINCIPAL: KANBAN BOARD
// ==========================================
export default function KanbanBoard({ periodo }: { periodo: string }) {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const [activePedido, setActivePedido] = useState<Pedido | null>(null);

  // Configuração dos sensores de arrasto (evita arrastar acidentalmente ao clicar)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const fetchPedidos = useCallback(async () => {
    try {
      const data = await getPedidos(periodo);
      setPedidos(data);
    } catch (error) {
      toast.error("Erro ao sincronizar pedidos da cozinha.");
    } finally {
      setLoading(false);
    }
  }, [periodo]);

  useEffect(() => {
    fetchPedidos();
  }, [fetchPedidos]);

  // Conexão WebSocket para Live Updates
  useEffect(() => {
    const wsUrl = "ws://127.0.0.1:8000/ws/pedidos"; 
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => setIsLive(true);
    socket.onclose = () => setIsLive(false);

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.action === "new_order" || data.action === "update_status") {
        fetchPedidos(); // Atualiza a tela automaticamente se o Python enviar um sinal
      }
    };

    return () => socket.close();
  }, [fetchPedidos]);

  // ✅ CORREÇÃO: Tipado corretamente como DragStartEvent
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const pedido = pedidos.find(p => p.id_pedido === active.id);
    if (pedido) setActivePedido(pedido);
  };

  // Quando o usuário solta o card
  const handleDragEnd = async (event: DragEndEvent) => {
    setActivePedido(null);
    const { active, over } = event;
    if (!over) return; 

    const idPedido = active.id as string;
    
    // Descobre o status atual e o status de destino
    const pedidoArrastado = pedidos.find(p => p.id_pedido === idPedido);
    if (!pedidoArrastado) return;

    const statusAntigo = pedidoArrastado.status || 'PENDENTE';
    
    // O 'over.id' pode ser o ID de outro card ou o ID da coluna
    let statusNovo = over.id as string;
    const pedidoDestino = pedidos.find(p => p.id_pedido === over.id);
    if (pedidoDestino) {
      statusNovo = pedidoDestino.status || 'PENDENTE';
    }

    // Se não mudou de coluna, reordena visualmente
    if (statusAntigo === statusNovo) {
      const activeIndex = pedidos.findIndex(p => p.id_pedido === active.id);
      const overIndex = pedidos.findIndex(p => p.id_pedido === over.id);
      if (activeIndex !== overIndex) {
        setPedidos(arrayMove(pedidos, activeIndex, overIndex));
      }
      return;
    }

    // OPTIMISTIC UI: Atualiza a tela Imediatamente antes do servidor responder
    setPedidos(prev => prev.map(p => p.id_pedido === idPedido ? { ...p, status: statusNovo } : p));

    // Salva no Banco de Dados
    try {
      await atualizarStatusPedido(idPedido, statusNovo);
      toast.success(`Pedido movido para ${statusNovo}`);
    } catch (error) {
      // ROLLBACK: Se o servidor falhar, desfaz a alteração na tela
      toast.error("Falha ao atualizar o servidor. Revertendo ação.");
      setPedidos(prev => prev.map(p => p.id_pedido === idPedido ? { ...p, status: statusAntigo } : p));
    }
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-[#EA1D2C]" size={40} />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Preparando Estação de Trabalho</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col animate-in fade-in duration-500">
      
      {/* Badge de Status do WebSocket */}
      <div className="flex items-center gap-3 mb-8 px-5 py-3 bg-slate-50 dark:bg-[#111113] border border-slate-200 dark:border-white/5 rounded-2xl w-fit shadow-sm">
        <span className="relative flex h-3 w-3">
          {isLive && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
          <span className={`relative inline-flex rounded-full h-3 w-3 ${isLive ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
        </span>
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 flex items-center gap-2">
          {isLive ? 'Link de Cozinha: Ativo' : 'Link de Cozinha: Offline'}
          {isLive && <RefreshCcw size={14} className="animate-spin text-slate-400" />}
        </span>
      </div>

      {/* Área de Drag and Drop */}
      <DndContext 
        sensors={sensors} 
        collisionDetection={closestCorners} 
        onDragStart={handleDragStart} 
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1">
          {/* Coluna 1: Novos Pedidos (Vermelho iFood) */}
          <SortableContext id="PENDENTE" items={pedidos.filter(p => p.status === "PENDENTE" || !p.status).map(p => p.id_pedido)}>
            <KanbanColumn 
              id="PENDENTE" title="Novos Pedidos" icon={Clock} theme="danger" 
              pedidos={pedidos.filter(p => p.status === "PENDENTE" || !p.status)} 
            />
          </SortableContext>

          {/* Coluna 2: Em Preparo (Amarelo/Laranja) */}
          <SortableContext id="PREPARANDO" items={pedidos.filter(p => p.status === "PREPARANDO").map(p => p.id_pedido)}>
            <KanbanColumn 
              id="PREPARANDO" title="Na Cozinha" icon={ChefHat} theme="warning" 
              pedidos={pedidos.filter(p => p.status === "PREPARANDO")} 
            />
          </SortableContext>

          {/* Coluna 3: Concluídos (Verde) */}
          <SortableContext id="CONCLUIDO" items={pedidos.filter(p => p.status === "CONCLUIDO").map(p => p.id_pedido)}>
            <KanbanColumn 
              id="CONCLUIDO" title="Despachados" icon={CheckCircle2} theme="success" 
              pedidos={pedidos.filter(p => p.status === "CONCLUIDO").slice(0, 10)} 
              limitInfo="Apenas os últimos 10 tickets visíveis na tela"
            />
          </SortableContext>
        </div>

        {/* Efeito visual de "fantasma" do card enquanto ele é arrastado */}
        <DragOverlay>
          {activePedido ? <KanbanCard pedido={activePedido} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}