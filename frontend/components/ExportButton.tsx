"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";

export default function ExportButton({ targetId }: { targetId: string }) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    // Procura o elemento HTML que queremos transformar em PDF
    const element = document.getElementById(targetId);
    if (!element) {
      toast.error("Não foi possível encontrar o conteúdo para exportar.");
      return;
    }

    setIsExporting(true);
    // Dispara a notificação de loading que configurámos no passo anterior!
    const loadingToast = toast.loading("A compilar relatório em PDF...");

    try {
      // 1. Tira uma 'fotografia' de alta qualidade da secção do Dashboard
      const canvas = await html2canvas(element, {
        scale: 2, // Aumenta a resolução para não ficar desfocado
        useCORS: true,
      });

      const imgData = canvas.toDataURL("image/png");
      
      // 2. Configura a página do PDF (Formato Paisagem para caberem os gráficos)
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4"
      });

      // 3. Calcula as proporções para a imagem caber perfeitamente na folha A4
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      
      // 4. Gera o nome do ficheiro com a data de hoje
      const dataHoje = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
      pdf.save(`Relatorio_iFood_${dataHoje}.pdf`);

      // Atualiza a notificação para sucesso
      toast.success("Relatório transferido com sucesso!", { id: loadingToast });
    } catch (error) {
      console.error(error);
      toast.error("Ocorreu um erro ao gerar o PDF.", { id: loadingToast });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className="flex items-center gap-2 bg-slate-100 dark:bg-[#2C2C2E] text-slate-700 dark:text-slate-200 px-4 py-2 rounded-xl text-xs font-bold uppercase hover:bg-slate-200 dark:hover:bg-[#3C3C3E] transition-all shadow-sm"
    >
      {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
      Exportar PDF
    </button>
  );
}