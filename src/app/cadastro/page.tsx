"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function CadastroPage() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [perfil, setPerfil] = useState("");
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    if (!perfil) {
      setError("Por favor, selecione um perfil.");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/cadastro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome,
          email,
          senha: password,
          perfil,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Ocorreu um erro ao criar a conta.");
      }

      setSuccess("Conta criada com sucesso! Redirecionando para login...");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
      
    } catch (err: any) {
      setError(err.message || "Ocorreu um erro ao tentar criar a conta.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] dark:bg-neutral-950 font-sans transition-colors duration-300">
      
      {/* HEADER */}
      <header className="flex h-20 w-full bg-white dark:bg-neutral-900 shadow-sm relative overflow-hidden border-t-[4px] border-[#FF0000] transition-colors duration-300">
        <div 
          className="absolute top-0 left-0 bottom-0 bg-[#FF0000] flex items-center justify-center z-10" 
          style={{ width: '320px', clipPath: 'polygon(0 0, 100% 0, 85% 100%, 0% 100%)' }}
        >
          <Image src="/senai-logo.svg" alt="SENAI" width={220} height={70} className="w-auto h-12 mr-8" priority />
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white dark:bg-neutral-900 shadow-md rounded-md overflow-hidden my-8 transition-colors duration-300">
          <div className="p-10 space-y-8">
            <h1 className="text-center text-2xl font-bold text-gray-800 dark:text-neutral-100 tracking-tight">
              Criar Conta
            </h1>
            
            <form onSubmit={handleCadastro} className="space-y-4">
              <div className="space-y-3">
                <Input 
                  id="nome" 
                  type="text" 
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Nome Completo" 
                  required
                  className="bg-[#F1F3F5] dark:bg-neutral-800 border-transparent focus-visible:ring-0 focus-visible:border-gray-300 dark:focus-visible:border-neutral-600 rounded-sm h-12 px-4 shadow-none text-gray-700 dark:text-neutral-200 placeholder:text-gray-400 dark:placeholder:text-neutral-500"
                />

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

                <Select value={perfil} onValueChange={setPerfil} required>
                  <SelectTrigger className="bg-[#F1F3F5] dark:bg-neutral-800 border-transparent focus:ring-0 rounded-sm h-12 px-4 shadow-none text-gray-700 dark:text-neutral-200">
                    <SelectValue placeholder="Selecione seu Perfil" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-800 text-gray-800 dark:text-neutral-200">
                    <SelectItem value="DOCENTE">Docente</SelectItem>
                    <SelectItem value="COORDENADOR">Gestão (Coordenador)</SelectItem>
                    <SelectItem value="OPP">Orientador (OPP)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {error && (
                <div className="text-sm text-[#FF0000] font-medium text-center">
                  {error}
                </div>
              )}
              
              {success && (
                <div className="text-sm text-green-600 dark:text-green-500 font-medium text-center">
                  {success}
                </div>
              )}

              <div className="pt-4">
                <Button 
                  type="submit" 
                  disabled={isLoading} 
                  className="w-full bg-[#FF0000] hover:bg-[#CC0000] text-white h-12 rounded-sm font-semibold transition-colors shadow-none"
                >
                  {isLoading ? "Criando conta..." : "Cadastrar"}
                </Button>
              </div>

            </form>
            
            <div className="text-center text-sm pt-4 border-t border-gray-100 dark:border-neutral-800">
              <span className="text-gray-500 dark:text-neutral-400">Já possui uma conta?</span>{" "}
              <Link href="/login" className="text-[#FF0000] font-semibold hover:underline">
                Faça login
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
