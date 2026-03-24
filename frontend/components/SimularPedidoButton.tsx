"use client"; // Necessário porque vamos usar eventos de clique (onClick) e Hooks do React

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle } from "lucide-react";

export default function SimularPedidoButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSimularPedido = async () => {
    setLoading(true);
    try {
      // 1. Escolhe um produto aleatório para variar o gráfico de Top Produtos
      const produtos = [
        { nome: "Hambúrguer Artesanal", preco: 35.0 },
        { nome: "Batata Frita", preco: 18.0 },
        { nome: "Refrigerante Lata", preco: 7.0 },
        { nome: "Combo Casal", preco: 85.0 }
      ];
      
      const produtoAleatorio = produtos[Math.floor(Math.random() * produtos.length)];
      const quantidade = Math.floor(Math.random() * 3) + 1;
      const valorTotal = (produtoAleatorio.preco * quantidade) + 5.90;

      const payload = {
        id_pedido: `IFD-${Math.floor(Math.random() * 90000) + 10000}`,
        status: "CONCLUIDO",
        valor_total: valorTotal,
        taxa_entrega: 5.90,
        forma_pagamento: "PIX",
        itens: [
          {
            nome_produto: produtoAleatorio.nome,
            quantidade: quantidade,
            preco_unitario: produtoAleatorio.preco
          }
        ]
      };

      // 2. Envia o novo pedido para a tua API em Python
      await fetch("http://localhost:8000/api/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      // 3. A magia do Next.js: Atualiza os Server Components em background sem piscar a página!
      router.refresh();
      
    } catch (error) {
      console.error("Erro ao simular pedido:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleSimularPedido}
      disabled={loading}
      className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm disabled:opacity-60"
    >
      <PlusCircle size={20} />
      {loading ? "A processar..." : "Simular Novo Pedido"}
    </button>
  );
}