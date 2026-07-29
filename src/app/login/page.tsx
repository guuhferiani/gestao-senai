"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ModeToggle } from "@/components/mode-toggle";
import Image from "next/image";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Mail, RotateCcw } from "lucide-react";

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
    <div className="min-h-screen flex flex-col bg-neutral-100 dark:bg-neutral-950 font-sans transition-colors duration-500">
      
      {/* HEADER */}
      <header className="flex h-16 w-full border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm transition-colors duration-500">
        <div className="flex h-full items-center bg-[#E52229] px-8 transition-transform hover:scale-[1.02] duration-300" style={{ clipPath: 'polygon(0 0, 100% 0, 85% 100%, 0% 100%)', width: '220px' }}>
          <Image src="/senai-logo.svg" alt="SENAI" width={120} height={40} className="w-auto h-8" priority />
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex items-center justify-center p-4 relative z-10 overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/10 dark:bg-red-500/5 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse" style={{ animationDelay: '1s' }} />

        <Card className="w-full max-w-md border border-white/40 dark:border-white/10 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] backdrop-blur-xl bg-white/80 dark:bg-neutral-900/80 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.15)] dark:hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6)]">
          <CardHeader className="pb-6 pt-8">
            <CardTitle className="text-center text-2xl font-bold text-neutral-800 dark:text-neutral-100 tracking-tight">
              Bem-vindo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 px-8 pb-8">
            
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-1 relative group">
                <Input 
                  id="email" 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="E-mail" 
                  required
                  className="bg-neutral-100/50 dark:bg-neutral-800/50 border-0 border-b-2 border-neutral-200 dark:border-neutral-700 focus-visible:ring-0 focus-visible:border-[#E52229] rounded-t-md rounded-b-none h-12 shadow-none transition-all duration-300 px-4 group-hover:bg-neutral-100 dark:group-hover:bg-neutral-800"
                />
              </div>
              
              <div className="space-y-1 relative group">
                <Input 
                  id="password" 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Senha" 
                  required
                  className="bg-neutral-100/50 dark:bg-neutral-800/50 border-0 border-b-2 border-neutral-200 dark:border-neutral-700 focus-visible:ring-0 focus-visible:border-[#E52229] rounded-t-md rounded-b-none h-12 shadow-none transition-all duration-300 px-4 group-hover:bg-neutral-100 dark:group-hover:bg-neutral-800"
                />
              </div>

              {error && (
                <div className="animate-in fade-in slide-in-from-top-1 text-sm text-red-500 bg-red-50 dark:bg-red-950/30 p-3 rounded-md border border-red-200 dark:border-red-900/50 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-alert-circle"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  {error}
                </div>
              )}

              <div className="flex items-center gap-4 pt-2">
                <Button type="submit" disabled={isLoading} className="flex-1 bg-[#E52229] hover:bg-[#C91A20] text-white h-11 rounded-md transition-all duration-300 hover:shadow-lg hover:shadow-red-500/25 active:scale-[0.98]">
                  {isLoading ? "Entrando..." : "Entrar"}
                </Button>
                <Button type="button" onClick={() => { setEmail(""); setPassword(""); setError(""); }} variant="outline" className="flex-1 border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 h-11 rounded-md transition-all duration-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 active:scale-[0.98]">
                  Limpar
                </Button>
              </div>
            </form>

            <div className="flex justify-end pt-1">
              <Dialog>
                <DialogTrigger asChild>
                  <button className="text-sm font-medium text-neutral-500 hover:text-[#E52229] dark:text-neutral-400 dark:hover:text-[#E52229] transition-colors hover:underline underline-offset-4">
                    Esqueceu a senha?
                  </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden bg-[#F4F4F5] dark:bg-neutral-900 border-none rounded-xl shadow-2xl">
                  <div className="p-6">
                    <DialogHeader className="mb-4">
                      <DialogTitle className="flex items-center gap-2 text-xl font-bold text-slate-800 dark:text-white">
                        <div className="relative flex items-center justify-center">
                          <RotateCcw className="w-6 h-6 text-slate-700 dark:text-slate-300" strokeWidth={2.5} />
                          <div className="absolute inset-0 m-auto w-2 h-2 bg-[#F4F4F5] dark:bg-neutral-900 rounded-full flex items-center justify-center">
                             <div className="w-1.5 h-1.5 bg-slate-700 dark:bg-slate-300 rounded-full border border-slate-700 dark:border-slate-300" />
                          </div>
                        </div>
                        Recuperar Senha
                      </DialogTitle>
                      <DialogDescription className="text-slate-500 dark:text-slate-400 text-base mt-2">
                        Insira o seu e-mail cadastrado para validar sua identidade.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <Input
                          id="reset-email"
                          placeholder="E-mail"
                          className="pl-10 h-12 bg-white dark:bg-neutral-950 border-slate-200 dark:border-neutral-800 rounded-md focus-visible:ring-1 focus-visible:ring-slate-300 dark:focus-visible:ring-slate-700 shadow-sm"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-neutral-950/50 p-6 flex justify-between items-center border-t border-slate-200 dark:border-neutral-800/50 rounded-b-xl">
                    <DialogClose asChild>
                      <button className="text-sm font-semibold text-slate-800 dark:text-slate-200 hover:text-slate-600 dark:hover:text-slate-400 transition-colors">
                        Cancelar
                      </button>
                    </DialogClose>
                    <Button type="button" className="bg-[#E52229] hover:bg-[#C91A20] text-white rounded-md px-6 py-5 text-sm font-semibold transition-all hover:shadow-lg shadow-red-500/20 active:scale-[0.98]">
                      Continuar
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-neutral-200 dark:border-neutral-800"></div>
              <span className="flex-shrink-0 mx-4 text-neutral-400 text-xs font-medium uppercase tracking-wider">ou</span>
              <div className="flex-grow border-t border-neutral-200 dark:border-neutral-800"></div>
            </div>

            <div className="flex justify-center pb-2">
              <Button variant="outline" type="button" className="w-full h-11 border-neutral-200 dark:border-neutral-800 rounded-md text-neutral-600 dark:text-neutral-300 bg-white dark:bg-neutral-900 shadow-sm hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all hover:shadow-md">
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
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
            <p className="text-sm text-red-100/90 leading-relaxed font-light">
              Pelo futuro do trabalho. O Serviço Nacional de Aprendizagem Industrial (SENAI) é um dos cinco maiores complexos de educação profissional do mundo.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="font-bold mb-2 tracking-wide text-sm">SUPORTE TÉCNICO</h3>
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
      <div className="fixed bottom-6 right-6 z-50 transition-transform hover:scale-110 duration-300">
        <ModeToggle />
      </div>

    </div>
  );
}
