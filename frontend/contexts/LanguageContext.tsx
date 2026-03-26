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
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "en",
  t: en,
  toggleLanguage: () => {},
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  // ✅ CORREÇÃO: Lazy Initializer. 
  // O React executa essa função apenas UMA vez, no início do ciclo de vida.
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

  return (
    <LanguageContext.Provider value={{ lang, t: translations[lang], toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);