"use client";

import { useState } from "react";
import { PlusCircle } from "lucide-react";

export default function SimularPedidoButton() {
  const [loading, setLoading] = useState(false);

  const handleSimularPedido = async () => {
    setLoading(true);
    try {
      // 1. Produtos agora incluem o 'custo' para o Lucro Líquido não ficar zerado
      const produtos = [
        { nome: "Hambúrguer Artesanal", preco: 35.0, custo: 12.0 },
        { nome: "Batata Frita", preco: 18.0, custo: 4.5 },
        { nome: "Refrigerante Lata", preco: 7.0, custo: 2.8 },
        { nome: "Combo Casal", preco: 85.0, custo: 32.0 }
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
        bairro_destino: "Centro", // Para aparecer no gráfico de bairros
        data_hora: new Date().toISOString(), // Envia o dia e hora exatos de agora
        itens: [
          {
            nome_produto: produtoAleatorio.nome,
            quantidade: quantidade,
            preco_unitario: produtoAleatorio.preco,
            custo_producao: produtoAleatorio.custo * quantidade // Calcula o custo total do item
          }
        ]
      };

      // 2. Trocado para 127.0.0.1 para evitar bloqueios do Mac
      const response = await fetch("http://127.0.0.1:8000/api/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error("Falha ao simular o pedido na API");
      }

      // 3. Força a página a recarregar para o useEffect buscar os dados novos e atualizar a tela
      window.location.reload();
      
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