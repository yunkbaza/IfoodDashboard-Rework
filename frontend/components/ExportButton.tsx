"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import { useLanguage } from "../contexts/LanguageContext"; // ✅ IMPORTADO

export default function ExportButton({ targetId }: { targetId: string }) {
  const [isExporting, setIsExporting] = useState(false);
  const { lang } = useLanguage(); // ✅ PEGANDO O IDIOMA ATUAL

  const handleExport = async () => {
    const element = document.getElementById(targetId);
    if (!element) {
      toast.error(lang === 'en' ? "Could not find the content to export." : "Não foi possível encontrar o conteúdo.");
      return;
    }

    setIsExporting(true);
    const loadingMsg = lang === 'en' ? "Compiling PDF report..." : "Compilando relatório em PDF...";
    const loadingToast = toast.loading(loadingMsg);

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
      });

      const imgData = canvas.toDataURL("image/png");
      
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4"
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      
      // ✅ FORMATO DE DATA DINÂMICO NO NOME DO ARQUIVO
      const locale = lang === 'en' ? 'en-US' : 'pt-BR';
      const dateToday = new Date().toLocaleDateString(locale).replace(/\//g, '-');
      const fileName = lang === 'en' ? `iFood_Report_${dateToday}.pdf` : `Relatorio_iFood_${dateToday}.pdf`;
      
      pdf.save(fileName);

      const successMsg = lang === 'en' ? "Report downloaded successfully!" : "Relatório baixado com sucesso!";
      toast.success(successMsg, { id: loadingToast });
    } catch (error) {
      console.error(error);
      const errorMsg = lang === 'en' ? "An error occurred while generating the PDF." : "Erro ao gerar o PDF.";
      toast.error(errorMsg, { id: loadingToast });
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
      {lang === 'en' ? "Export PDF" : "Exportar PDF"}
    </button>
  );
}