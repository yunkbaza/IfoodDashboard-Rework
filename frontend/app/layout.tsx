import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "../components/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "iFood Pro Dashboard",
  description: "Análise avançada de estatísticas para lojas iFood",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // O suppressHydrationWarning PRECISA estar aqui
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-slate-50 dark:bg-[#111111] transition-colors duration-300">
        <ThemeProvider 
          attribute="class" 
          defaultTheme="system" 
          enableSystem
          disableTransitionOnChange // Adicione isso para evitar bugs de transição no carregamento
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}