import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { SessionProvider } from "@/components/providers/session-provider";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

const roboto = Roboto({
  weight: ['400', '500', '700', '900'],
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: "Gestão Docente - SENAI",
  description: "Plataforma de gerenciamento docente",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${roboto.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex font-sans bg-[#F8F9FA] text-gray-900 overflow-hidden">
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light" // Forçar light theme por padrão (Padrão SENAI)
            enableSystem={false}
            disableTransitionOnChange
          >
            <Sidebar />
            
            <div className="flex flex-col flex-1 h-screen overflow-hidden ml-16 hover:ml-16 transition-all duration-300">
              <Topbar />
              
              <main className="flex-1 overflow-y-auto p-6">
                {children}
              </main>
            </div>
            
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
