"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, Mail, Lock, CheckCircle2 } from "lucide-react";

export default function NovoUsuarioPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simula uma API de cadastro
    setTimeout(() => {
      setIsLoading(false);
      setSucesso(true);
      setTimeout(() => setSucesso(false), 3000);
    }, 1500);
  };

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight text-neutral-800 dark:text-neutral-100 flex items-center gap-3">
          <UserPlus className="w-8 h-8 text-[#E52229]" />
          Cadastrar Novo Usuário
        </h2>
        <p className="text-neutral-500 dark:text-neutral-400 mt-2">
          Adicione professores ou coordenadores ao sistema de gestão.
        </p>
      </div>

      <Card className="border border-neutral-200 dark:border-neutral-800 bg-white/60 dark:bg-neutral-900/60 backdrop-blur-xl shadow-lg rounded-2xl overflow-hidden">
        <form onSubmit={handleSubmit}>
          <CardHeader className="bg-neutral-50/50 dark:bg-neutral-950/50 border-b border-neutral-100 dark:border-neutral-800 pb-6">
            <CardTitle className="text-lg">Informações do Perfil</CardTitle>
            <CardDescription>Preencha os dados de acesso do novo colaborador.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            
            <div className="space-y-2">
              <Label htmlFor="nome" className="text-neutral-700 dark:text-neutral-300">Nome Completo</Label>
              <Input 
                id="nome" 
                placeholder="Ex: João da Silva" 
                required 
                className="h-11 bg-white dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800 focus-visible:ring-[#E52229]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 relative">
                <Label htmlFor="email" className="text-neutral-700 dark:text-neutral-300">E-mail Institucional</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="joao@sp.senai.br" 
                    required 
                    className="pl-9 h-11 bg-white dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800 focus-visible:ring-[#E52229]"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="senha" className="text-neutral-700 dark:text-neutral-300">Senha Provisória</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <Input 
                    id="senha" 
                    type="password" 
                    placeholder="••••••••" 
                    required 
                    className="pl-9 h-11 bg-white dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800 focus-visible:ring-[#E52229]"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="perfil" className="text-neutral-700 dark:text-neutral-300">Perfil de Acesso</Label>
              <Select defaultValue="DOCENTE">
                <SelectTrigger className="w-full h-11 bg-white dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800 focus:ring-[#E52229]">
                  <SelectValue placeholder="Selecione um perfil" />
                </SelectTrigger>
                <SelectContent className="w-full min-w-[260px]">
                  <SelectItem value="DOCENTE">Docente</SelectItem>
                  <SelectItem value="COORDENADOR">Coordenador</SelectItem>
                  <SelectItem value="SECRETARIA">Administrativo</SelectItem>
                  <SelectItem value="OPP">Orientador (OPP)</SelectItem>
                </SelectContent>
              </Select>
            </div>

          </CardContent>
          <CardFooter className="bg-neutral-50/50 dark:bg-neutral-950/50 border-t border-neutral-100 dark:border-neutral-800 px-6 py-4 flex justify-between items-center">
            <Button variant="ghost" type="button" className="text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300">
              Cancelar
            </Button>
            <div className="flex items-center gap-4">
              {sucesso && (
                <span className="text-sm font-medium text-green-600 dark:text-green-500 flex items-center gap-1 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4" /> Cadastrado com sucesso!
                </span>
              )}
              <Button type="submit" disabled={isLoading} className="bg-[#E52229] hover:bg-[#C91A20] text-white px-8 h-10 transition-all hover:shadow-lg shadow-red-500/25">
                {isLoading ? "Salvando..." : "Salvar Usuário"}
              </Button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
