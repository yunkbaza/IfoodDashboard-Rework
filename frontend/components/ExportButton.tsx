"use client";

import { useState } from "react";
import { FileSpreadsheet, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import { downloadRelatorio } from "../services/api";
import { useLanguage } from "../contexts/LanguageContext";

// ✅ INTERFACE ATUALIZADA: Agora aceita periodo e lojaId do page.tsx
export interface ExportProps {
  targetId: string;
  periodo: string;
  lojaId?: number;
}

export default function ExportButton({ targetId, periodo, lojaId }: ExportProps) {
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [isExportingCSV, setIsExportingCSV] = useState(false);
  const { lang } = useLanguage();

  // 📸 EXPORTAÇÃO VISUAL (PDF)
  const handleExportPDF = async () => {
    const element = document.getElementById(targetId);
    if (!element) {
      toast.error(lang === 'en' ? "Could not find the content to export." : "Não foi possível encontrar o conteúdo.");
      return;
    }

    setIsExportingPDF(true);
    const loadingToast = toast.loading(lang === 'en' ? "Generating PDF..." : "Gerando PDF...");

    try {
      const canvas = await html2canvas(element, { 
        scale: 2, 
        useCORS: true, 
        backgroundColor: "#0A0A0B" // Fundo escuro premium para o recorte
      });
      
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      
      const locale = lang === 'en' ? 'en-US' : 'pt-BR';
      const dateToday = new Date().toLocaleDateString(locale).replace(/\//g, '-');
      const fileName = lang === 'en' ? `iFood_Visual_${dateToday}.pdf` : `Relatorio_Visual_iFood_${dateToday}.pdf`;
      
      pdf.save(fileName);
      toast.success(lang === 'en' ? "PDF Downloaded!" : "PDF Descarregado!", { id: loadingToast });
    } catch {
      toast.error(lang === 'en' ? "Error generating PDF" : "Erro ao gerar o PDF", { id: loadingToast });
    } finally { 
      setIsExportingPDF(false); 
    }
  };

  // 📊 EXPORTAÇÃO DE DADOS BRUTOS (CSV) - DADOS REAIS DO BACKEND
  const handleExportCSV = async () => {
    setIsExportingCSV(true);
    const loadingToast = toast.loading(lang === 'en' ? "Generating CSV..." : "Gerando CSV...");
    try {
      await downloadRelatorio(periodo, lojaId);
      toast.success(lang === 'en' ? "Audit CSV Downloaded!" : "CSV Exportado!", { id: loadingToast });
    } catch {
      toast.error(lang === 'en' ? "CSV Error" : "Erro no CSV", { id: loadingToast });
    } finally { 
      setIsExportingCSV(false); 
    }
  };

  return (
    <div className="flex items-center gap-3">
      {/* BOTÃO 1: PDF Visual */}
      <button 
        onClick={handleExportPDF} 
        disabled={isExportingPDF || isExportingCSV} 
        className="flex items-center gap-2 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-200 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 transition-all disabled:opacity-50"
      >
        {isExportingPDF ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} className="text-[#EA1D2C]" />}
        {lang === 'en' ? "Visual PDF" : "PDF Visual"}
      </button>

      {/* BOTÃO 2: CSV Auditoria */}
      <button 
        onClick={handleExportCSV} 
        disabled={isExportingPDF || isExportingCSV} 
        className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] transition-all shadow-xl disabled:opacity-50"
      >
        {isExportingCSV ? <Loader2 size={16} className="animate-spin" /> : <FileSpreadsheet size={16} className="text-[#EA1D2C]" />}
        {lang === 'en' ? "Audit CSV" : "Exportar CSV"}
      </button>
    </div>
  );
}