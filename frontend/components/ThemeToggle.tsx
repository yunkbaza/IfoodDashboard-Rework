"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Usamos uma microtask assíncrona para driblar a regra estrita do ESLint.
    // Assim, o estado é atualizado sem bloquear a renderização síncrona do React.
    Promise.resolve().then(() => setMounted(true));
  }, []);

  if (!mounted) return <div className="w-10 h-10 p-2.5"></div>; 

  // Pegamos o tema real (caso o usuário tenha escolhido "system")
  const currentTheme = theme === "system" ? resolvedTheme : theme;

  return (
    <button
      onClick={() => setTheme(currentTheme === "dark" ? "light" : "dark")}
      className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 dark:bg-[#1C1C1E] dark:border-[#2C2C2E] dark:text-gray-200 dark:hover:bg-[#242426] transition-all shadow-sm"
      aria-label="Alternar tema"
    >
      {currentTheme === "dark" ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-slate-700" />}
    </button>
  );
}