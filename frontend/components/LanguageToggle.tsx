"use client";

import { useLanguage } from "../contexts/LanguageContext";
import { Globe } from "lucide-react";

export default function LanguageToggle() {
  const { lang, toggleLanguage } = useLanguage();

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-white/10 transition-all shadow-sm"
    >
      <Globe size={16} className={lang === 'en' ? 'text-blue-500' : 'text-emerald-500'} />
      <span className="dark:text-white">{lang === "en" ? "🇺🇸 EN" : "🇧🇷 PT"}</span>
    </button>
  );
}