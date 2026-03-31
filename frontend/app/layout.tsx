import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "../components/ThemeProvider";
import { LanguageProvider } from "../contexts/LanguageContext";
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
    <html lang="en" suppressHydrationWarning>
      <body 
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-full flex flex-col bg-slate-50 dark:bg-[#0A0A0B] transition-colors duration-300`}
        // ✅ Corrigido: suppressHydrationWarning adicionado ao body para evitar erros de extensões/Playwright
        suppressHydrationWarning
      >
        <ThemeProvider 
          attribute="class" 
          defaultTheme="system" 
          enableSystem
          disableTransitionOnChange
        >
          <LanguageProvider>
            {children}
            
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