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
import { Mail, RotateCcw, Eye, EyeOff, CheckCircle2, AlertCircle, Sparkles, Lock, ArrowLeft, KeyRound } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Estados do Modal de Recuperação de Senha
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [resetStep, setResetStep] = useState<1 | 2 | 3>(1);
  const [resetEmail, setResetEmail] = useState("");
  const [resetNif, setResetNif] = useState("");
  const [resetUserName, setResetUserName] = useState("");
  const [resetNovaSenha, setResetNovaSenha] = useState("");
  const [resetConfirmSenha, setResetConfirmSenha] = useState("");
  const [resetShowPassword, setResetShowPassword] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState("");

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

  // Gerador de senha forte para redefinição
  const handleGenerateResetPassword = () => {
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
    setResetNovaSenha(finalPassword);
    setResetConfirmSenha(finalPassword);
    setResetShowPassword(true);
  };

  // Força da Senha na redefinição
  const resetStrength = (() => {
    if (!resetNovaSenha) return { score: 0, label: "", color: "" };
    let score = 0;
    if (resetNovaSenha.length >= 8) score += 1;
    if (resetNovaSenha.length >= 12) score += 1;
    if (/[A-Z]/.test(resetNovaSenha) && /[a-z]/.test(resetNovaSenha)) score += 1;
    if (/[0-9]/.test(resetNovaSenha)) score += 1;
    if (/[^A-Za-z0-9]/.test(resetNovaSenha)) score += 1;

    if (score <= 2) return { score: 1, label: "Fraca", color: "bg-red-500 text-red-600" };
    if (score === 3) return { score: 2, label: "Média", color: "bg-amber-500 text-amber-600" };
    if (score === 4) return { score: 3, label: "Forte", color: "bg-emerald-500 text-emerald-600" };
    return { score: 4, label: "Muito Forte", color: "bg-emerald-600 text-emerald-700" };
  })();

  // Etapa 1: Validar E-mail + NIF
  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError("");
    setResetLoading(true);

    try {
      const res = await fetch("/api/recuperar-senha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "verificar",
          email: resetEmail.trim().toLowerCase(),
          nif: resetNif.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setResetError(data.error || "Dados não conferem.");
        return;
      }

      setResetUserName(data.nome || "");
      setResetStep(2);
    } catch (err: any) {
      setResetError(err.message || "Erro ao verificar identidade.");
    } finally {
      setResetLoading(false);
    }
  };

  // Etapa 2: Redefinir Senha
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError("");

    if (resetNovaSenha.length < 6) {
      setResetError("A nova senha deve possuir pelo menos 6 caracteres.");
      return;
    }

    if (resetNovaSenha !== resetConfirmSenha) {
      setResetError("As senhas digitadas não coincidem. Verifique e tente novamente.");
      return;
    }

    setResetLoading(true);

    try {
      const res = await fetch("/api/recuperar-senha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "redefinir",
          email: resetEmail.trim().toLowerCase(),
          nif: resetNif.trim(),
          novaSenha: resetNovaSenha.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setResetError(data.error || "Erro ao redefinir senha.");
        return;
      }

      setResetStep(3);
    } catch (err: any) {
      setResetError(err.message || "Erro ao redefinir senha.");
    } finally {
      setResetLoading(false);
    }
  };

  // Finalizar e preencher no login
  const handleFinishReset = () => {
    setEmail(resetEmail);
    setPassword("");
    setIsResetOpen(false);
    setResetStep(1);
    setResetEmail("");
    setResetNif("");
    setResetNovaSenha("");
    setResetConfirmSenha("");
    setResetError("");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] dark:bg-neutral-950 font-sans transition-colors duration-300">
      
      {/* MAIN CONTENT */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md flex flex-col gap-2">
          
          {/* Botão de Tema logo acima do Card (Alinhado à Direita) */}
          <div className="flex justify-end pr-1">
            <ModeToggle />
          </div>

          {/* Card de Login com Sombreamento e Profundidade Elevada */}
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
                      placeholder="coordenador@sp.senai.br" 
                      required
                      className="bg-[#F1F3F5] dark:bg-neutral-800 border-transparent focus-visible:ring-1 focus-visible:ring-[#D31900] rounded-md h-12 px-4 shadow-none text-gray-800 dark:text-neutral-100 placeholder:text-gray-400 dark:placeholder:text-neutral-500"
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
                        className="bg-[#F1F3F5] dark:bg-neutral-800 border-transparent focus-visible:ring-1 focus-visible:ring-[#D31900] rounded-md h-12 pl-4 pr-11 shadow-none text-gray-800 dark:text-neutral-100 placeholder:text-gray-400 dark:placeholder:text-neutral-500 w-full"
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
                  <div className="p-3 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 rounded-md text-xs text-[#D31900] dark:text-red-400 font-medium text-center animate-in fade-in">
                    {error}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <div className="flex gap-3">
                    <Button 
                      type="submit" 
                      disabled={isLoading} 
                      className="bg-[#D31900] hover:bg-[#B71500] text-white h-11 px-8 rounded-md font-semibold transition-all shadow-sm"
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
                  <button
                    type="button"
                    onClick={() => {
                      setIsResetOpen(true);
                      setResetStep(1);
                      setResetError("");
                      setResetEmail(email || "");
                    }}
                    className="text-xs font-semibold text-[#D31900] hover:underline transition-all cursor-pointer"
                  >
                    Esqueceu a senha?
                  </button>
                </div>
              </form>

              {/* ========================================================================= */}
              {/* MODAL DE AUTOATENDIMENTO: RECUPERAR SENHA (3 ETAPAS) */}
              {/* ========================================================================= */}
              <Dialog open={isResetOpen} onOpenChange={setIsResetOpen}>
                <DialogContent className="sm:max-w-[440px] bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-800 rounded-2xl p-6 shadow-2xl">
                  {/* ETAPA 1: VALIDAR E-MAIL + NIF */}
                  {resetStep === 1 && (
                    <form onSubmit={handleVerifyEmail} className="space-y-4">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-gray-900 dark:text-neutral-100 font-bold text-base">
                          <div className="p-2 rounded-xl bg-red-50 dark:bg-red-950/50 text-[#D31900]">
                            <RotateCcw className="w-5 h-5" />
                          </div>
                          Recuperar Senha
                        </DialogTitle>
                        <DialogDescription className="text-gray-500 dark:text-neutral-400 text-xs">
                          Informe seu e-mail institucional e o seu <strong>NIF (Matrícula Funcional)</strong> para autenticar a titularidade da conta com segurança.
                        </DialogDescription>
                      </DialogHeader>

                      <div className="py-1 space-y-3">
                        <div>
                          <label className="text-xs font-semibold text-gray-700 dark:text-neutral-300 block mb-1">
                            E-mail Institucional <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-neutral-500 pointer-events-none" />
                            <Input
                              id="reset-email"
                              type="email"
                              placeholder="seu.nome@sp.senai.br"
                              value={resetEmail}
                              onChange={(e) => setResetEmail(e.target.value)}
                              required
                              className="pl-10 h-11 bg-gray-50 dark:bg-neutral-800 border-gray-200 dark:border-neutral-700 text-gray-800 dark:text-neutral-200 text-xs rounded-xl"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-gray-700 dark:text-neutral-300 block mb-1">
                            NIF / Matrícula SENAI <span className="text-red-500">*</span>
                          </label>
                          <Input
                            id="reset-nif"
                            type="text"
                            placeholder="Ex: 100001 ou 1087407"
                            value={resetNif}
                            onChange={(e) => setResetNif(e.target.value)}
                            required
                            className="h-11 bg-gray-50 dark:bg-neutral-800 border-gray-200 dark:border-neutral-700 text-gray-800 dark:text-neutral-200 text-xs rounded-xl font-mono"
                          />
                        </div>
                      </div>

                      {resetError && (
                        <div className="p-3 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 rounded-xl text-xs text-[#D31900] dark:text-red-400 font-medium flex items-center gap-2 animate-in fade-in">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span>{resetError}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-gray-100 dark:border-neutral-800">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsResetOpen(false)}
                          className="text-xs h-9"
                        >
                          Cancelar
                        </Button>
                        <Button
                          type="submit"
                          disabled={resetLoading || !resetEmail.trim() || !resetNif.trim()}
                          className="bg-[#D31900] hover:bg-[#B71500] text-white font-semibold text-xs h-9 px-4"
                        >
                          {resetLoading ? "Verificando..." : "Validar Identidade →"}
                        </Button>
                      </div>
                    </form>
                  )}

                  {/* ETAPA 2: DEFINIR NOVA SENHA */}
                  {resetStep === 2 && (
                    <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-gray-900 dark:text-neutral-100 font-bold text-base">
                          <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600">
                            <KeyRound className="w-5 h-5" />
                          </div>
                          Criar Nova Senha
                        </DialogTitle>
                        <DialogDescription className="text-gray-500 dark:text-neutral-400 text-xs">
                          Conta confirmada para <strong className="text-gray-900 dark:text-neutral-200">{resetUserName}</strong> ({resetEmail}).
                        </DialogDescription>
                      </DialogHeader>

                      <div className="space-y-3 py-1">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-xs font-semibold text-gray-700 dark:text-neutral-300">
                              Nova Senha <span className="text-red-500">*</span>
                            </label>
                            <button
                              type="button"
                              onClick={handleGenerateResetPassword}
                              className="text-[11px] font-bold text-[#D31900] hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              Sugerir Senha Forte
                            </button>
                          </div>

                          <div className="relative">
                            <Input
                              id="reset-new-password"
                              type={resetShowPassword ? "text" : "password"}
                              autoComplete="new-password"
                              placeholder="Mínimo 6 caracteres"
                              value={resetNovaSenha}
                              onChange={(e) => setResetNovaSenha(e.target.value)}
                              required
                              className="pr-10 h-11 bg-gray-50 dark:bg-neutral-800 border-gray-200 dark:border-neutral-700 text-xs rounded-xl font-mono"
                            />
                            <button
                              type="button"
                              onClick={() => setResetShowPassword(!resetShowPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-neutral-200"
                            >
                              {resetShowPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>

                          {/* Indicador de força */}
                          {resetNovaSenha && (
                            <div className="mt-1.5 space-y-1">
                              <div className="flex items-center justify-between text-[10px] font-semibold">
                                <span className="text-gray-500 dark:text-neutral-400">Força:</span>
                                <span className={resetStrength.color}>{resetStrength.label}</span>
                              </div>
                              <div className="grid grid-cols-4 gap-1 h-1 rounded-full overflow-hidden bg-gray-200 dark:bg-neutral-800">
                                <div className={`h-full ${resetStrength.score >= 1 ? resetStrength.color.split(' ')[0] : 'bg-transparent'}`} />
                                <div className={`h-full ${resetStrength.score >= 2 ? resetStrength.color.split(' ')[0] : 'bg-transparent'}`} />
                                <div className={`h-full ${resetStrength.score >= 3 ? resetStrength.color.split(' ')[0] : 'bg-transparent'}`} />
                                <div className={`h-full ${resetStrength.score >= 4 ? resetStrength.color.split(' ')[0] : 'bg-transparent'}`} />
                              </div>
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-gray-700 dark:text-neutral-300 block mb-1">
                            Confirmar Nova Senha <span className="text-red-500">*</span>
                          </label>
                          <Input
                            id="reset-confirm-password"
                            type={resetShowPassword ? "text" : "password"}
                            autoComplete="new-password"
                            placeholder="Repita a nova senha"
                            value={resetConfirmSenha}
                            onChange={(e) => setResetConfirmSenha(e.target.value)}
                            required
                            className="h-11 bg-gray-50 dark:bg-neutral-800 border-gray-200 dark:border-neutral-700 text-xs rounded-xl font-mono"
                          />
                        </div>
                      </div>

                      {resetError && (
                        <div className="p-3 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 rounded-xl text-xs text-[#D31900] dark:text-red-400 font-medium flex items-center gap-2 animate-in fade-in">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span>{resetError}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-neutral-800">
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => { setResetStep(1); setResetError(""); }}
                          className="text-xs h-9 gap-1"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" /> Voltar
                        </Button>
                        <Button
                          type="submit"
                          disabled={resetLoading || !resetNovaSenha || !resetConfirmSenha}
                          className="bg-[#D31900] hover:bg-[#B71500] text-white font-semibold text-xs h-9 px-4"
                        >
                          {resetLoading ? "Salvando..." : "Salvar Nova Senha"}
                        </Button>
                      </div>
                    </form>
                  )}

                  {/* ETAPA 3: CONFIRMAÇÃO DE SUCESSO */}
                  {resetStep === 3 && (
                    <div className="text-center py-4 space-y-4 animate-in fade-in zoom-in-95 duration-200">
                      <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-xs">
                        <CheckCircle2 className="w-8 h-8" />
                      </div>

                      <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-neutral-100">
                          Senha Redefinida!
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-neutral-400 mt-1 max-w-xs mx-auto">
                          As credenciais da conta <strong>{resetEmail}</strong> foram atualizadas com sucesso.
                        </p>
                      </div>

                      <div className="pt-2">
                        <Button
                          type="button"
                          onClick={handleFinishReset}
                          className="w-full bg-[#D31900] hover:bg-[#B71500] text-white font-semibold h-11 rounded-xl text-xs shadow-sm"
                        >
                          Ir para o Login
                        </Button>
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>

              <div className="text-center pt-2 border-t border-gray-100 dark:border-neutral-800">
                <span className="text-xs text-gray-500 dark:text-neutral-400">
                  Ainda não tem conta?{" "}
                  <Link href="/cadastro" className="text-[#D31900] font-semibold hover:underline">
                    Cadastre-se
                  </Link>
                </span>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
