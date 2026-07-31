export const dynamic = 'force-dynamic';

import { prisma } from "@/lib/prisma";
import { StatCard } from "@/components/dashboard/stat-card";
import { Users, Calendar, BookOpen, BarChart3 } from "lucide-react";
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Visão Geral</h1>
        <Button className="bg-[#D31900] hover:bg-[#B71500] text-white">
          + Nova Turma
        </Button>
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
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="font-semibold text-gray-800">Turmas Recentes</h2>
            <Link href="/turmas" className="text-sm text-[#D31900] hover:underline font-medium">
              Ver todas
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500 font-medium">
                <tr>
                  <th className="px-6 py-3">Nome</th>
                  <th className="px-6 py-3">Área</th>
                  <th className="px-6 py-3">Período</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {turmasRecentes.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                      Nenhuma turma encontrada.
                    </td>
                  </tr>
                ) : (
                  turmasRecentes.map((turma) => (
                    <tr key={turma.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">{turma.nome}</td>
                      <td className="px-6 py-4 text-gray-600">{turma.area.nome}</td>
                      <td className="px-6 py-4 text-gray-600">{turma.periodo}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Docentes Recentes */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="font-semibold text-gray-800">Docentes Adicionados</h2>
            <Link href="/docentes" className="text-sm text-[#D31900] hover:underline font-medium">
              Ver todos
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500 font-medium">
                <tr>
                  <th className="px-6 py-3">Nome</th>
                  <th className="px-6 py-3">Contrato</th>
                  <th className="px-6 py-3">C.H.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {docentesRecentes.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                      Nenhum docente encontrado.
                    </td>
                  </tr>
                ) : (
                  docentesRecentes.map((docente) => (
                    <tr key={docente.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">{docente.usuario?.nome || "Sem nome"}</td>
                      <td className="px-6 py-4 text-gray-600">{docente.tipoContratacao}</td>
                      <td className="px-6 py-4 text-gray-600">{docente.cargaHorariaContratada}h</td>
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
