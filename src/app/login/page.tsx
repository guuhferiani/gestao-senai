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
                  <DialogTrigger className="text-[13px] font-medium text-[#FF0000] hover:underline transition-all">
                    Esqueceu a senha?
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
                      <DialogClose render={<Button variant="outline" className="border-gray-300 dark:border-neutral-700 text-gray-700 dark:text-neutral-300" />}>
                        Cancelar
                      </DialogClose>
                      <Button className="bg-[#FF0000] hover:bg-[#CC0000] text-white">
                        Continuar
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </form>

            <div className="text-center pt-2">
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
