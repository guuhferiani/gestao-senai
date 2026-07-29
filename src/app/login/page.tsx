"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ModeToggle } from "@/components/mode-toggle";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setError("E-mail ou senha inválidos.");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setError("Ocorreu um erro ao tentar fazer login.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950 font-sans">
      
      {/* HEADER */}
      <header className="flex h-16 w-full border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        <div className="flex h-full items-center bg-[#E52229] px-8" style={{ clipPath: 'polygon(0 0, 100% 0, 85% 100%, 0% 100%)', width: '220px' }}>
          <Image src="/senai-logo.svg" alt="SENAI" width={120} height={40} className="w-auto h-8" priority />
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex items-center justify-center p-4 relative z-10">
        <Card className="w-full max-w-md border-none shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-none dark:bg-neutral-900 bg-white rounded-md">
          <CardHeader className="pb-6">
            <CardTitle className="text-center text-xl font-bold text-neutral-800 dark:text-neutral-100">
              Bem-vindo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1">
                <Input 
                  id="email" 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="E-mail" 
                  required
                  className="bg-neutral-100 dark:bg-neutral-800 border-0 border-b-2 border-neutral-200 dark:border-neutral-700 focus-visible:ring-0 focus-visible:border-neutral-400 rounded-none h-12 shadow-none"
                />
              </div>
              
              <div className="space-y-1 pt-2">
                <Input 
                  id="password" 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Senha" 
                  required
                  className="bg-neutral-100 dark:bg-neutral-800 border-0 border-b-2 border-neutral-200 dark:border-neutral-700 focus-visible:ring-0 focus-visible:border-neutral-400 rounded-none h-12 shadow-none"
                />
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <div className="flex items-center gap-4 pt-4">
                <Button type="submit" disabled={isLoading} className="bg-[#EF4444] hover:bg-[#DC2626] text-white px-8 h-10 rounded-sm">
                  {isLoading ? "Entrando..." : "Entrar"}
                </Button>
                <Button type="button" onClick={() => { setEmail(""); setPassword(""); setError(""); }} variant="outline" className="border-neutral-300 text-neutral-600 dark:text-neutral-300 h-10 px-8 rounded-sm">
                  Limpar
                </Button>
              </div>
            </form>

            <div className="flex justify-end pt-2">
              <a href="#" className="text-sm text-[#EF4444] hover:underline">
                Esqueceu a senha?
              </a>
            </div>

            <div className="relative flex items-center py-4">
              <div className="flex-grow border-t border-neutral-200 dark:border-neutral-700"></div>
              <span className="flex-shrink-0 mx-4 text-neutral-400 text-xs">ou</span>
              <div className="flex-grow border-t border-neutral-200 dark:border-neutral-700"></div>
            </div>

            <div className="flex justify-center pb-4">
              <Button variant="outline" type="button" className="w-64 h-10 border-neutral-200 rounded-sm text-neutral-600 dark:text-neutral-300 bg-white dark:bg-neutral-800 shadow-sm">
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Fazer Login com o Google
              </Button>
            </div>

          </CardContent>
        </Card>
      </main>

      {/* FOOTER */}
      <footer className="bg-[#E52229] w-full text-white pt-10 pb-6 px-12 mt-auto relative z-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-10">
          
          <div className="max-w-md">
            <div className="mb-4">
              <Image src="/senai-logo.svg" alt="SENAI" width={150} height={45} className="w-auto h-10" />
            </div>
            <p className="text-sm text-red-100/90 leading-relaxed">
              Pelo futuro do trabalho. O Serviço Nacional de Aprendizagem Industrial (SENAI) é um dos cinco maiores complexos de educação profissional do mundo.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="font-bold mb-2">SUPORTE TÉCNICO</h3>
            <div className="flex items-center gap-2 text-sm text-red-100/90">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-mail"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              <span>suporte.interno@sp.senai.br</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-red-100/90">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-phone"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              <span>Suporte TI - Ramal: 4500</span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-red-500/50 flex flex-col md:flex-row justify-between items-center text-xs text-red-200">
          <p>&copy; 2026 SENAI - Todos os direitos reservados.</p>
        </div>
      </footer>

      {/* FIXED DARK MODE TOGGLE */}
      <div className="fixed bottom-6 right-6 z-50">
        <ModeToggle />
      </div>

    </div>
  );
}
