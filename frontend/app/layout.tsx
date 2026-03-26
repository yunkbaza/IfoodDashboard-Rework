import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "../components/ThemeProvider";
import { LanguageProvider } from "../contexts/LanguageContext"; // ✅ 1. Importação do Provider de Idioma
import { Toaster } from "sonner";

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
  description: "Advanced analytics for iFood stores",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // O suppressHydrationWarning é necessário para evitar conflitos com o next-themes
    <html lang="en" suppressHydrationWarning>
      <body 
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-full flex flex-col bg-slate-50 dark:bg-[#0A0A0B] transition-colors duration-300`}
      >
        <ThemeProvider 
          attribute="class" 
          defaultTheme="system" 
          enableSystem
          disableTransitionOnChange
        >
          {/* ✅ 2. Envolvendo a aplicação com o Provider de Idioma */}
          <LanguageProvider>
            {children}
            
            {/* ✅ 3. Toaster configurado para notificações elegantes */}
            <Toaster 
              position="top-right" 
              richColors 
              closeButton 
              theme="system"
              className="font-sans"
            />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}