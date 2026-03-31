"use client";

import { useLanguage } from "../contexts/LanguageContext";
import { Globe } from "lucide-react";
import { useEffect, useState } from "react";

export default function LanguageToggle() {
  const { lang, toggleLanguage } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Silenciamos o aviso do linter porque este double-render inicial
    // é estritamente intencional e necessário no Next.js para evitar o Hydration Mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm opacity-0">
        <Globe size={16} />
        <span>-- --</span>
      </div>
    );
  }

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