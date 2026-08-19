"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ModeToggle } from "@/components/mode-toggle";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff, Sparkles, KeyRound, Check } from "lucide-react";
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
  const [nif, setNif] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [perfil, setPerfil] = useState("");
  const [copied, setCopied] = useState(false);
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Gerador de senha forte aleatória
  const handleGeneratePassword = () => {
    const uppers = "ABCDEFGHJKLMNPQRSTUVWXYZ";
    const lowers = "abcdefghijkmnpqrstuvwxyz";
    const numbers = "23456789";
    const specials = "@#$%&*";

    let generated = "";
    generated += uppers[Math.floor(Math.random() * uppers.length)];
    generated += lowers[Math.floor(Math.random() * lowers.length)];
    generated += lowers[Math.floor(Math.random() * lowers.length)];
    generated += numbers[Math.floor(Math.random() * numbers.length)];
    generated += specials[Math.floor(Math.random() * specials.length)];

    const all = uppers + lowers + numbers + specials;
    for (let i = 0; i < 7; i++) {
      generated += all[Math.floor(Math.random() * all.length)];
    }

    const finalPassword = generated.split("").sort(() => 0.5 - Math.random()).join("");
    setPassword(finalPassword);
    setShowPassword(true);
  };

  // Cálculo da Força da Senha
  const passwordStrength = (() => {
    if (!password) return { score: 0, label: "", color: "" };
    let score = 0;
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score <= 2) return { score: 1, label: "Fraca", color: "bg-red-500 text-red-600" };
    if (score === 3) return { score: 2, label: "Média", color: "bg-amber-500 text-amber-600" };
    if (score === 4) return { score: 3, label: "Forte", color: "bg-emerald-500 text-emerald-600" };
    return { score: 4, label: "Muito Forte", color: "bg-emerald-600 text-emerald-700" };
  })();

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    if (!email.trim().toLowerCase().endsWith("@sp.senai.br")) {
      setError("Apenas e-mails institucionais do SENAI (@sp.senai.br) são permitidos para cadastro.");
      setIsLoading(false);
      return;
    }

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
          email: email.trim().toLowerCase(),
          nif: nif.trim(),
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
      
      {/* MAIN CONTENT */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md flex flex-col gap-2 my-8">
          
          {/* Botão de Tema logo acima do Card (Alinhado à Direita) */}
          <div className="flex justify-end pr-1">
            <ModeToggle />
          </div>

          {/* Card de Cadastro com Sombreamento e Profundidade Elevada */}
          <div className="w-full bg-white dark:bg-neutral-900 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.18)] dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.65)] rounded-2xl overflow-hidden border border-gray-200/90 dark:border-neutral-800 transition-colors duration-300">
            
            {/* Header do Card com Logo Oficial SENAI (Fundo Vermelho com Marca Inversa) */}
            <div className="bg-[#e30613] py-6 px-8 flex flex-col items-center justify-center relative text-white">
              <Image 
                src="/senai-logo-inverse.svg" 
                alt="SENAI" 
                width={160} 
                height={50} 
                priority 
                className="h-10 w-auto object-contain drop-shadow-sm"
              />
              <span className="text-[11px] font-semibold text-white/90 tracking-wider mt-3 uppercase">
                Gestão Docente & Turmas
              </span>
            </div>

            <div className="p-8 space-y-6">
              <h2 className="text-center text-xl font-bold text-gray-800 dark:text-neutral-100 tracking-tight">
                Criar Conta
              </h2>
              
              <form onSubmit={handleCadastro} className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 dark:text-neutral-400 mb-1 block">
                      Nome Completo
                    </label>
                    <Input 
                      id="nome" 
                      type="text" 
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      placeholder="Seu Nome Completo" 
                      required
                      className="bg-[#F1F3F5] dark:bg-neutral-800 border-transparent focus-visible:ring-1 focus-visible:ring-[#D31900] rounded-md h-12 px-4 shadow-none text-gray-800 dark:text-neutral-100 placeholder:text-gray-400 dark:placeholder:text-neutral-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-600 dark:text-neutral-400 mb-1 block">
                      E-mail Institucional (@sp.senai.br)
                    </label>
                    <Input 
                      id="email" 
                      name="email"
                      type="email" 
                      autoComplete="username"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu.nome@sp.senai.br" 
                      required
                      className="bg-[#F1F3F5] dark:bg-neutral-800 border-transparent focus-visible:ring-1 focus-visible:ring-[#D31900] rounded-md h-12 px-4 shadow-none text-gray-800 dark:text-neutral-100 placeholder:text-gray-400 dark:placeholder:text-neutral-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-600 dark:text-neutral-400 mb-1 block">
                      NIF / Matrícula Funcional SENAI
                    </label>
                    <Input 
                      id="nif" 
                      name="nif"
                      type="text" 
                      value={nif}
                      onChange={(e) => setNif(e.target.value)}
                      placeholder="Ex: 1087407 ou SN1087407" 
                      required
                      className="bg-[#F1F3F5] dark:bg-neutral-800 border-transparent focus-visible:ring-1 focus-visible:ring-[#D31900] rounded-md h-12 px-4 shadow-none text-gray-800 dark:text-neutral-100 placeholder:text-gray-400 dark:placeholder:text-neutral-500 font-mono text-sm"
                    />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-gray-600 dark:text-neutral-400">
                        Senha
                      </label>
                      <button
                        type="button"
                        onClick={handleGeneratePassword}
                        className="text-[11px] font-bold text-[#D31900] hover:text-[#B71500] dark:text-red-400 hover:underline flex items-center gap-1 cursor-pointer transition-colors"
                        title="Gerar automaticamente uma senha segura de alta complexidade"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        Sugerir Senha Forte
                      </button>
                    </div>

                    <div className="relative">
                      <Input 
                        id="password" 
                        name="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Sua senha de acesso" 
                        required
                        className="bg-[#F1F3F5] dark:bg-neutral-800 border-transparent focus-visible:ring-1 focus-visible:ring-[#D31900] rounded-md h-12 pl-4 pr-11 shadow-none text-gray-800 dark:text-neutral-100 placeholder:text-gray-400 dark:placeholder:text-neutral-500 w-full font-mono text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors focus:outline-none cursor-pointer"
                        title={showPassword ? "Ocultar senha" : "Ver senha"}
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5 text-gray-500 dark:text-neutral-400" />
                        ) : (
                          <Eye className="w-5 h-5 text-gray-500 dark:text-neutral-400" />
                        )}
                      </button>
                    </div>

                    {/* Indicador de Força da Senha */}
                    {password && (
                      <div className="mt-2 space-y-1 animate-in fade-in duration-200">
                        <div className="flex items-center justify-between text-[10px] font-semibold">
                          <span className="text-gray-500 dark:text-neutral-400">Força da senha:</span>
                          <span className={passwordStrength.color}>{passwordStrength.label}</span>
                        </div>
                        <div className="grid grid-cols-4 gap-1 h-1.5 rounded-full overflow-hidden bg-gray-200 dark:bg-neutral-800">
                          <div className={`h-full transition-all duration-300 ${passwordStrength.score >= 1 ? passwordStrength.color.split(' ')[0] : 'bg-transparent'}`} />
                          <div className={`h-full transition-all duration-300 ${passwordStrength.score >= 2 ? passwordStrength.color.split(' ')[0] : 'bg-transparent'}`} />
                          <div className={`h-full transition-all duration-300 ${passwordStrength.score >= 3 ? passwordStrength.color.split(' ')[0] : 'bg-transparent'}`} />
                          <div className={`h-full transition-all duration-300 ${passwordStrength.score >= 4 ? passwordStrength.color.split(' ')[0] : 'bg-transparent'}`} />
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-600 dark:text-neutral-400 mb-1 block">
                      Perfil de Acesso
                    </label>
                    <Select value={perfil} onValueChange={(val) => val && setPerfil(val)} required>
                      <SelectTrigger className="w-full bg-[#F1F3F5] dark:bg-neutral-800 border-transparent focus:ring-1 focus:ring-[#D31900] rounded-md h-12 px-4 shadow-none text-gray-800 dark:text-neutral-100 text-xs font-medium cursor-pointer">
                        <SelectValue placeholder="Selecione seu Perfil de Acesso" />
                      </SelectTrigger>
                      <SelectContent className="w-full min-w-[280px] bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 shadow-xl rounded-xl p-1.5 text-gray-800 dark:text-neutral-200">
                        <SelectItem value="DOCENTE">Docente</SelectItem>
                        <SelectItem value="COORDENADOR">Coordenador</SelectItem>
                        <SelectItem value="SECRETARIA">Administrativo</SelectItem>
                        <SelectItem value="OPP">Orientador (OPP)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 rounded-md text-xs text-[#D31900] dark:text-red-400 font-medium text-center animate-in fade-in">
                    {error}
                  </div>
                )}
                
                {success && (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-md text-xs text-emerald-700 dark:text-emerald-300 font-medium text-center animate-in fade-in">
                    {success}
                  </div>
                )}

                <div className="pt-2">
                  <Button 
                    type="submit" 
                    disabled={isLoading} 
                    className="w-full bg-[#D31900] hover:bg-[#B71500] text-white h-12 rounded-md font-semibold transition-all shadow-sm"
                  >
                    {isLoading ? "Criando conta..." : "Cadastrar"}
                  </Button>
                </div>

              </form>
              
              <div className="text-center pt-4 border-t border-gray-100 dark:border-neutral-800">
                <span className="text-xs text-gray-500 dark:text-neutral-400">Já possui uma conta?</span>{" "}
                <Link href="/login" className="text-[#D31900] text-xs font-semibold hover:underline">
                  Faça login
                </Link>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
