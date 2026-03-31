"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { en } from "../locales/en";
import { pt } from "../locales/pt";

const translations = { en, pt };
type Language = "en" | "pt";

interface LanguageContextType {
  lang: Language;
  t: typeof en;
  toggleLanguage: () => void;
  formatCurrency: (value: number) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "en",
  t: en,
  toggleLanguage: () => {},
  formatCurrency: (v) => v.toString(),
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  // 1. Forçamos a começar SEMPRE na mesma língua base do servidor para não quebrar a Hidratação
  const [lang, setLang] = useState<Language>("en");
  const [mounted, setMounted] = useState(false);

  // 2. Só lemos a preferência do utilizador DEPOIS do HTML inicial ser montado com segurança
  useEffect(() => {
    // Silenciamos o aviso do linter porque este double-render inicial
    // é intencional e necessário no Next.js para evitar o erro de Hydration Mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    
    const savedLang = localStorage.getItem("app_lang") as Language;
    if (savedLang === "pt" || savedLang === "en") {
      setLang(savedLang);
    }
  }, []);

  const toggleLanguage = () => {
    const nextLang = lang === "en" ? "pt" : "en";
    setLang(nextLang);
    localStorage.setItem("app_lang", nextLang);
  };

  const formatCurrency = (value: number) => {
    const exchangeRate = 5.0; // 1 USD = 5 BRL
    
    if (lang === "en") {
      const converted = value / exchangeRate;
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(converted);
    }

    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  // 3. Enquanto não montar no cliente, entregamos um contexto invisível (opcionalmente) 
  // mas aqui o principal é garantir que a "lang" inicial é a mesma do servidor
  return (
    <LanguageContext.Provider value={{ lang, t: translations[lang], toggleLanguage, formatCurrency }}>
      {/* Opcional: Se quiser evitar o 'piscar' da língua, pode ocultar até montar. */}
      <div className={`transition-opacity duration-300 ${!mounted ? "opacity-0" : "opacity-100"}`}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);