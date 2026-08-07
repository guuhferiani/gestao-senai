export const dynamic = 'force-dynamic';

import { prisma } from "@/lib/prisma";
import { StatCard } from "@/components/dashboard/stat-card";
import { Users, Calendar, BookOpen, BarChart3, Plus, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  // 1. Fetch metrics concurrently
  const [
    totalDocentes,
    totalTurmas,
    totalAreas,
    turmasRecentes,
    docentesRecentes
  ] = await Promise.all([
    prisma.docente.count(),
    prisma.turma.count(),
    prisma.areaTecnologica.count(),
    prisma.turma.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { area: true }
    }),
    prisma.docente.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { usuario: true }
    })
  ]);

  // Taxa de ocupação (Mocked for now - wait for Atribuicao logic)
  const taxaOcupacao = 45; 

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 dark:border-neutral-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-neutral-100">
            Visão Geral
          </h1>
          <p className="text-sm text-gray-500 dark:text-neutral-400 mt-1">
            Indicadores acadêmicos consolidados, capacidade docente e turmas programadas.
          </p>
        </div>
        <Link href="/turmas">
          <Button className="bg-[#e30613] hover:bg-[#b7040f] text-white gap-2 font-semibold shadow-sm text-xs">
            <Plus className="w-4 h-4" />
            Nova Turma
          </Button>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total de Docentes"
          value={totalDocentes}
          icon={Users}
          description="Professores cadastrados na unidade"
        />
        <StatCard
          title="Turmas Ativas"
          value={totalTurmas}
          icon={Calendar}
          description="Turmas programadas ou em andamento"
        />
        <StatCard
          title="Áreas Tecnológicas"
          value={totalAreas}
          icon={BookOpen}
          description="Segmentos de atuação disponíveis"
        />
        <StatCard
          title="Taxa de Ocupação Média"
          value={`${taxaOcupacao}%`}
          icon={BarChart3}
          description="Capacidade alocada vs disponível"
        />
      </div>

      {/* Tables Section */}
      <div className="grid gap-6 md:grid-cols-2">
        
        {/* Turmas Recentes */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-200 dark:border-neutral-800 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-gray-900 dark:text-neutral-100 text-sm">Turmas Recentes</h2>
              <p className="text-xs text-gray-500 dark:text-neutral-400 mt-0.5">Últimas programações criadas</p>
            </div>
            <Link href="/turmas" className="text-xs text-[#e30613] hover:underline font-semibold flex items-center gap-1">
              Ver todas <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-gray-50 dark:bg-neutral-800/60 text-gray-500 dark:text-neutral-400 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-5 py-3">Nome</th>
                  <th className="px-5 py-3">Área</th>
                  <th className="px-5 py-3">Período</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-neutral-800 font-medium">
                {turmasRecentes.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-5 py-6 text-center text-gray-500 dark:text-neutral-400 text-xs">
                      Nenhuma turma cadastrada no momento.
                    </td>
                  </tr>
                ) : (
                  turmasRecentes.map((turma) => (
                    <tr key={turma.id} className="hover:bg-gray-50 dark:hover:bg-neutral-800/40 transition-colors">
                      <td className="px-5 py-3.5 font-bold text-gray-900 dark:text-neutral-100">{turma.nome}</td>
                      <td className="px-5 py-3.5 text-gray-600 dark:text-neutral-300">{turma.area.nome}</td>
                      <td className="px-5 py-3.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/40">
                          {turma.periodo}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Docentes Recentes */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-200 dark:border-neutral-800 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-gray-900 dark:text-neutral-100 text-sm">Docentes Adicionados</h2>
              <p className="text-xs text-gray-500 dark:text-neutral-400 mt-0.5">Últimos professores cadastrados</p>
            </div>
            <Link href="/docentes" className="text-xs text-[#e30613] hover:underline font-semibold flex items-center gap-1">
              Ver todos <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-gray-50 dark:bg-neutral-800/60 text-gray-500 dark:text-neutral-400 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-5 py-3">Docente</th>
                  <th className="px-5 py-3">Contrato</th>
                  <th className="px-5 py-3">C.H.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-neutral-800 font-medium">
                {docentesRecentes.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-5 py-6 text-center text-gray-500 dark:text-neutral-400 text-xs">
                      Nenhum docente cadastrado no momento.
                    </td>
                  </tr>
                ) : (
                  docentesRecentes.map((docente) => (
                    <tr key={docente.id} className="hover:bg-gray-50 dark:hover:bg-neutral-800/40 transition-colors">
                      <td className="px-5 py-3.5 font-bold text-gray-900 dark:text-neutral-100">
                        {docente.usuario?.nome || "Sem nome"}
                      </td>
                      <td className="px-5 py-3.5 text-gray-600 dark:text-neutral-300">{docente.tipoContratacao}</td>
                      <td className="px-5 py-3.5">
                        <span className="font-semibold text-gray-900 dark:text-neutral-100">
                          {docente.cargaHorariaContratada}h
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
