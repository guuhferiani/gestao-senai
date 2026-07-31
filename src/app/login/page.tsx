"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ModeToggle } from "@/components/mode-toggle";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { Mail, RotateCcw, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: email.trim().toLowerCase(),
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
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] dark:bg-neutral-950 font-sans transition-colors duration-300 relative">
      
      {/* Botão de Trocar Tema (Topo Direito) */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        <span className="text-xs text-gray-500 dark:text-neutral-400 hidden sm:inline">Tema:</span>
        <ModeToggle />
      </div>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white dark:bg-neutral-900 shadow-lg rounded-xl overflow-hidden border border-gray-200/80 dark:border-neutral-800 transition-colors duration-300">
          
          {/* Header do Card com Logo SENAI */}
          <div className="bg-[#FF0000] py-6 px-8 flex flex-col items-center justify-center text-white relative">
            <div className="flex items-center gap-3">
              <span className="font-black italic text-4xl tracking-wider">SENAI</span>
            </div>
            <span className="text-xs font-medium opacity-90 tracking-wide mt-1 uppercase">
              Gestão Docente & Turmas
            </span>
          </div>

          <div className="p-8 space-y-6">
            <h2 className="text-center text-xl font-bold text-gray-800 dark:text-neutral-100 tracking-tight">
              Bem-vindo
            </h2>
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600 dark:text-neutral-400 mb-1 block">
                    E-mail Institucional
                  </label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu.nome@sp.senai.br" 
                    required
                    className="bg-[#F1F3F5] dark:bg-neutral-800 border-transparent focus-visible:ring-1 focus-visible:ring-[#FF0000] rounded-md h-12 px-4 shadow-none text-gray-800 dark:text-neutral-100 placeholder:text-gray-400 dark:placeholder:text-neutral-500"
                  />
                </div>
                
                <div>
                  <label className="text-xs font-semibold text-gray-600 dark:text-neutral-400 mb-1 block">
                    Senha
                  </label>
                  <div className="relative">
                    <Input 
                      id="password" 
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Sua senha" 
                      required
                      className="bg-[#F1F3F5] dark:bg-neutral-800 border-transparent focus-visible:ring-1 focus-visible:ring-[#FF0000] rounded-md h-12 pl-4 pr-11 shadow-none text-gray-800 dark:text-neutral-100 placeholder:text-gray-400 dark:placeholder:text-neutral-500 w-full"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors focus:outline-none"
                      title={showPassword ? "Ocultar senha" : "Ver senha"}
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5 text-gray-500 dark:text-neutral-400" />
                      ) : (
                        <Eye className="w-5 h-5 text-gray-500 dark:text-neutral-400" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 rounded-md text-xs text-[#FF0000] dark:text-red-400 font-medium text-center animate-in fade-in">
                  {error}
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <div className="flex gap-3">
                  <Button 
                    type="submit" 
                    disabled={isLoading} 
                    className="bg-[#FF0000] hover:bg-[#CC0000] text-white h-11 px-8 rounded-md font-semibold transition-all shadow-sm"
                  >
                    {isLoading ? "Entrando..." : "Entrar"}
                  </Button>
                  <Button 
                    type="button" 
                    onClick={() => { setEmail(""); setPassword(""); setError(""); }} 
                    variant="outline" 
                    className="border-gray-300 dark:border-neutral-700 text-gray-700 dark:text-neutral-300 h-11 px-6 rounded-md hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors shadow-none"
                  >
                    Limpar
                  </Button>
                </div>
              </div>

              <div className="flex justify-end mt-1">
                <Dialog>
                  <DialogTrigger className="text-xs font-medium text-[#FF0000] hover:underline transition-all">
                    Esqueceu a senha?
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px] bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-800 rounded-lg">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2 text-gray-800 dark:text-neutral-100 font-bold">
                        <RotateCcw className="w-5 h-5 text-[#FF0000]" />
                        Recuperar Senha
                      </DialogTitle>
                      <DialogDescription className="text-gray-500 dark:text-neutral-400 text-xs">
                        Insira o seu e-mail cadastrado (@sp.senai.br) para validar sua identidade.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-neutral-500" />
                        <Input
                          id="reset-email"
                          placeholder="seu.nome@sp.senai.br"
                          className="pl-10 h-12 bg-gray-50 dark:bg-neutral-800 border-gray-200 dark:border-neutral-700 text-gray-800 dark:text-neutral-200 text-sm"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-3">
                      <DialogClose render={<Button variant="outline" className="border-gray-300 dark:border-neutral-700 text-gray-700 dark:text-neutral-300">Cancelar</Button>} />
                      <Button className="bg-[#FF0000] hover:bg-[#CC0000] text-white font-semibold">
                        Enviar Código
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </form>

            <div className="text-center pt-2 border-t border-gray-100 dark:border-neutral-800">
              <span className="text-xs text-gray-500 dark:text-neutral-400">
                Ainda não tem conta?{" "}
                <Link href="/cadastro" className="text-[#FF0000] font-semibold hover:underline">
                  Cadastre-se
                </Link>
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
