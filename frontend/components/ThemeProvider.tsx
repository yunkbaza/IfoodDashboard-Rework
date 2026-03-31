"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider, type ThemeProviderProps } from "next-themes";

// ✅ Silenciador do "Falso Positivo" no React 19 / Next.js
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  const originalError = console.error;
  
  // Substituímos 'any[]' por 'Parameters<typeof console.error>' 
  // Isso resolve o erro do ESLint mantendo o TypeScript 100% satisfeito e seguro.
  console.error = (...args: Parameters<typeof console.error>) => {
    if (typeof args[0] === "string" && args[0].includes("Encountered a script tag")) {
      return; 
    }
    originalError.apply(console, args);
  };
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props}>
      {children}
    </NextThemesProvider>
  );
}