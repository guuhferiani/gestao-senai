import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { SessionProvider } from "@/components/providers/session-provider";
import { AppShell } from "@/components/layout/app-shell";

const montserrat = Montserrat({
  weight: ['300', '400', '500', '600', '700', '900'],
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: "Gestão Docente - SENAI",
  description: "Plataforma oficial de gerenciamento docente e turmas SENAI",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Gestão SENAI",
  },
};

export const viewport: Viewport = {
  themeColor: "#e30613",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${montserrat.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <link rel="icon" href="/senai-icon-inverse.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/senai-icon-inverse.svg" />
      </head>
      <body className="min-h-full flex font-sans bg-[#F8F9FA] dark:bg-neutral-950 text-gray-900 dark:text-neutral-100 overflow-hidden transition-colors">
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light" // Forçar light theme por padrão (Padrão SENAI)
            enableSystem={false}
            disableTransitionOnChange
          >
            <AppShell>
              {children}
            </AppShell>
          </ThemeProvider>
        </SessionProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function(err) {
                    console.log('ServiceWorker registration failed: ', err);
                  });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
