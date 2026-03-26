import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "../components/ThemeProvider";
import { Toaster } from "sonner"; // ✅ 1. Importação da biblioteca de notificações

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
    // O suppressHydrationWarning PRECISA estar aqui por causa do next-themes
    <html lang="pt-BR" suppressHydrationWarning>
      <body 
        // ✅ 2. As variáveis das fontes precisam estar no className para o Tailwind as reconhecer
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-full flex flex-col bg-slate-50 dark:bg-[#111111] transition-colors duration-300`}
      >
        <ThemeProvider 
          attribute="class" 
          defaultTheme="system" 
          enableSystem
          disableTransitionOnChange // Adicionado para evitar bugs de transição no carregamento
        >
          {children}
          
          {/* ✅ 3. O Toaster que vai renderizar os avisos elegantes no canto superior direito */}
          <Toaster 
            position="top-right" 
            richColors 
            closeButton 
            theme="system"
            className="font-sans" // Garante que a notificação usa a fonte Geist
          />
        </ThemeProvider>
      </body>
    </html>
  );
}