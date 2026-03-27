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
  formatCurrency: (value: number) => string; // ✅ Adicionado
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "en",
  t: en,
  toggleLanguage: () => {},
  formatCurrency: (v) => v.toString(),
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>(() => {
    if (typeof window !== "undefined") {
      const savedLang = localStorage.getItem("app_lang") as Language;
      return savedLang || "en";
    }
    return "en";
  });

  const toggleLanguage = () => {
    const nextLang = lang === "en" ? "pt" : "en";
    setLang(nextLang);
    localStorage.setItem("app_lang", nextLang);
  };

  // ✅ Lógica de Conversão e Formatação Real
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

  return (
    <LanguageContext.Provider value={{ lang, t: translations[lang], toggleLanguage, formatCurrency }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);