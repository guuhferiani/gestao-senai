"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { Mail, RotateCcw } from "lucide-react";
import Link from "next/link";
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
    <div className="h-full flex flex-col bg-[#F8F9FA] dark:bg-neutral-950 font-sans transition-colors duration-300">
      
      {/* MAIN CONTENT */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white dark:bg-neutral-900 shadow-md rounded-md overflow-hidden transition-colors duration-300">
          <div className="p-10 space-y-8">
            <h1 className="text-center text-2xl font-bold text-gray-800 dark:text-neutral-100 tracking-tight">
              Bem-vindo
            </h1>
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Input 
                  id="email" 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="E-mail" 
                  required
                  className="bg-[#F1F3F5] dark:bg-neutral-800 border-transparent focus-visible:ring-0 focus-visible:border-gray-300 dark:focus-visible:border-neutral-600 rounded-sm h-12 px-4 shadow-none text-gray-700 dark:text-neutral-200 placeholder:text-gray-400 dark:placeholder:text-neutral-500"
                />
                
                <Input 
                  id="password" 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Senha" 
                  required
                  className="bg-[#F1F3F5] dark:bg-neutral-800 border-transparent focus-visible:ring-0 focus-visible:border-gray-300 dark:focus-visible:border-neutral-600 rounded-sm h-12 px-4 shadow-none text-gray-700 dark:text-neutral-200 placeholder:text-gray-400 dark:placeholder:text-neutral-500"
                />
              </div>

              {error && (
                <div className="text-sm text-[#FF0000] font-medium text-center">
                  {error}
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <div className="flex gap-3">
                  <Button 
                    type="submit" 
                    disabled={isLoading} 
                    className="bg-[#FF0000] hover:bg-[#CC0000] text-white h-10 px-8 rounded-sm font-semibold transition-colors shadow-none"
                  >
                    {isLoading ? "..." : "Entrar"}
                  </Button>
                  <Button 
                    type="button" 
                    onClick={() => { setEmail(""); setPassword(""); setError(""); }} 
                    variant="outline" 
                    className="border-gray-300 dark:border-neutral-700 text-gray-700 dark:text-neutral-300 h-10 px-6 rounded-sm hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors shadow-none"
                  >
                    Limpar
                  </Button>
                </div>
              </div>

              <div className="flex justify-end mt-1">
                <Dialog>
                  <DialogTrigger asChild>
                    <button className="text-[13px] font-medium text-[#FF0000] hover:underline transition-all">
                      Esqueceu a senha?
                    </button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px] bg-white dark:bg-neutral-900 border-none rounded-md">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2 text-gray-800 dark:text-neutral-100">
                        <RotateCcw className="w-5 h-5" />
                        Recuperar Senha
                      </DialogTitle>
                      <DialogDescription className="text-gray-500 dark:text-neutral-400">
                        Insira o seu e-mail cadastrado para validar sua identidade.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-neutral-500" />
                        <Input
                          id="reset-email"
                          placeholder="E-mail"
                          className="pl-10 h-12 bg-white dark:bg-neutral-950 border-gray-200 dark:border-neutral-800 text-gray-800 dark:text-neutral-200"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-3">
                      <DialogClose asChild>
                        <Button variant="outline" className="border-gray-300 dark:border-neutral-700 text-gray-700 dark:text-neutral-300">Cancelar</Button>
                      </DialogClose>
                      <Button className="bg-[#FF0000] hover:bg-[#CC0000] text-white">
                        Continuar
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </form>

            <div className="relative flex items-center py-4">
              <div className="flex-grow border-t border-gray-200 dark:border-neutral-800"></div>
              <span className="flex-shrink-0 mx-4 text-gray-400 dark:text-neutral-500 text-xs font-medium">ou</span>
              <div className="flex-grow border-t border-gray-200 dark:border-neutral-800"></div>
            </div>

            <div className="flex justify-center pb-2">
              <Button 
                variant="outline" 
                type="button" 
                className="w-full h-11 border-gray-300 dark:border-neutral-700 rounded-sm text-gray-600 dark:text-neutral-300 bg-white dark:bg-neutral-900 shadow-none hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors flex items-center justify-center gap-3 font-medium"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Fazer Login com o Google
              </Button>
            </div>
            
            <div className="text-center text-sm pt-2">
              <span className="text-gray-500 dark:text-neutral-400">Ainda não tem conta?</span>{" "}
              <Link href="/cadastro" className="text-[#FF0000] font-semibold hover:underline">
                Cadastre-se
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
