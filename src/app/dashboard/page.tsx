'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  Users, 
  Calendar, 
  BookOpen, 
  BarChart3, 
  Plus, 
  ArrowRight, 
  CalendarDays, 
  Sparkles, 
  History, 
  UserCog, 
  FileSpreadsheet, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  Layers, 
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { DocenteDashboard } from '@/components/dashboard/docente-dashboard';

interface DashboardStats {
  metricasGlobais: {
    totalDocentes: number;
    totalTurmas: number;
    totalAreas: number;
    totalUCs: number;
    totalCargaContratada: number;
    totalHorasAlocadas: number;
    eficienciaGeral: number;
  };
  regimesData: {
    nome: string;
    quantidade: number;
    cor: string;
  }[];
  ocupacaoPorArea: {
    areaId: string;
    areaNome: string;
    totalDocentes: number;
    totalUCs: number;
    cargaTotal: number;
    horasAlocadas: number;
    taxaOcupacao: number;
  }[];
  turmasResumo: {
    id: string;
    nome: string;
    areaNome: string;
    periodo: string;
    tipoCurso: string;
    totalSlots: number;
    preenchidos: number;
    percentual: number;
  }[];
}

export default function DashboardPage() {
  const { data: session, status: sessionStatus } = useSession();
  const userPerfil = (session?.user as any)?.perfil;

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/dashboard/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userPerfil !== 'DOCENTE') {
      fetchStats();
    }
  }, [userPerfil]);

  // Se o usuário logado for DOCENTE, exibe o painel pedagógico restrito exclusivo dele
  if (userPerfil === 'DOCENTE') {
    return <DocenteDashboard />;
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Header Corporativo SENAI */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 dark:border-neutral-800 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-neutral-100">
              Painel Executivo & Indicadores
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-950/60 text-[#e30613]">
              Gestão Integrada SENAI
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-neutral-400 mt-1">
            Visão consolidada da capacidade docente, preenchimento de turmas e governança acadêmica.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={fetchStats}
            variant="outline"
            size="sm"
            className="border-gray-300 dark:border-neutral-700 text-gray-700 dark:text-neutral-300 gap-1.5 text-xs font-medium"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Atualizar
          </Button>

          <Link href="/turmas">
            <Button className="bg-[#e30613] hover:bg-[#b7040f] text-white gap-2 font-semibold shadow-sm text-xs h-9">
              <Plus className="w-4 h-4" /> Nova Turma
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 KPI Cards Modernos */}
      {stats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Eficiência Geral */}
          <div className="bg-white dark:bg-neutral-900 p-5 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider">
                  Eficiência Geral
                </span>
                <div className="text-2xl font-extrabold text-gray-900 dark:text-neutral-100 mt-1">
                  {stats.metricasGlobais.eficienciaGeral}%
                </div>
              </div>
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
            <div className="w-full bg-gray-100 dark:bg-neutral-800 h-2.5 rounded-full overflow-hidden mt-3">
              <div
                className="bg-[#e30613] h-full transition-all duration-500 rounded-full"
                style={{ width: `${stats.metricasGlobais.eficienciaGeral}%` }}
              />
            </div>
            <span className="text-[11px] text-gray-400 mt-1">
              {stats.metricasGlobais.totalHorasAlocadas}h de {stats.metricasGlobais.totalCargaContratada}h alocadas
            </span>
          </div>

          {/* Total de Docentes */}
          <div className="bg-white dark:bg-neutral-900 p-5 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider">
                Corpo Docente Ativo
              </span>
              <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                {stats.metricasGlobais.totalDocentes}
              </div>
              <span className="text-[11px] text-gray-500 dark:text-neutral-400 font-medium">
                Professores cadastrados na unidade
              </span>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              <Users className="w-6 h-6" />
            </div>
          </div>

          {/* Turmas Ofertadas */}
          <div className="bg-white dark:bg-neutral-900 p-5 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider">
                Turmas Ofertadas
              </span>
              <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">
                {stats.metricasGlobais.totalTurmas}
              </div>
              <span className="text-[11px] text-gray-500 dark:text-neutral-400 font-medium">
                Turmas regulares, CAI e FIC
              </span>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
              <Calendar className="w-6 h-6" />
            </div>
          </div>

          {/* Estrutura Acadêmica */}
          <div className="bg-white dark:bg-neutral-900 p-5 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider">
                Áreas & Disciplinas
              </span>
              <div className="text-2xl font-extrabold text-[#e30613] mt-1">
                {stats.metricasGlobais.totalAreas} / {stats.metricasGlobais.totalUCs}
              </div>
              <span className="text-[11px] text-[#e30613] font-medium">
                Áreas Tecnológicas e UCs mapeadas
              </span>
            </div>
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 text-[#e30613]">
              <BookOpen className="w-6 h-6" />
            </div>
          </div>
        </div>
      )}

      {/* Seção de Gráficos e Distribuição */}
      {stats && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Gráfico 1: Ocupação por Área Tecnológica */}
          <div className="lg:col-span-2 bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 p-6 shadow-sm space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-neutral-800 pb-3">
                <div>
                  <h2 className="text-sm font-bold text-gray-900 dark:text-neutral-100 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-[#e30613]" /> Taxa de Ocupação por Área Tecnológica
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-neutral-400 mt-0.5">
                    Horas alocadas na grade vs capacidade total contratada por departamento
                  </p>
                </div>
                <Link href="/atribuicoes" className="text-xs font-bold text-[#e30613] hover:underline flex items-center gap-1">
                  Atribuir <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="mt-4 space-y-4">
                {stats.ocupacaoPorArea.map((area) => (
                  <div key={area.areaId} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-gray-800 dark:text-neutral-200">
                        {area.areaNome} ({area.totalDocentes} docentes • {area.totalUCs} UCs)
                      </span>
                      <span className="font-extrabold text-gray-900 dark:text-neutral-100">
                        {area.taxaOcupacao}% <span className="text-gray-400 text-[10px] font-normal">({area.horasAlocadas}h / {area.cargaTotal}h)</span>
                      </span>
                    </div>

                    <div className="w-full bg-gray-100 dark:bg-neutral-800 h-3 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          area.taxaOcupacao >= 100
                            ? 'bg-red-600'
                            : area.taxaOcupacao >= 60
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${area.taxaOcupacao}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 dark:border-neutral-800 text-[11px] text-gray-400 flex items-center justify-between">
              <span>Legenda: Verde (Saldo Livre) • Amarelo (Equilibrado) • Vermelho (No Limite)</span>
              <Link href="/relatorios" className="font-bold text-gray-700 dark:text-neutral-300 hover:text-[#e30613]">
                Ver Relatório Completo →
              </Link>
            </div>
          </div>

          {/* Gráfico 2: Distribuição por Regime de Contrato */}
          <div className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 p-6 shadow-sm space-y-4 flex flex-col justify-between">
            <div>
              <div className="border-b border-gray-100 dark:border-neutral-800 pb-3">
                <h2 className="text-sm font-bold text-gray-900 dark:text-neutral-100 flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#e30613]" /> Quadro por Regime de Contrato
                </h2>
                <p className="text-xs text-gray-500 dark:text-neutral-400 mt-0.5">
                  Proporção de docentes CLT 40h, 20h e Horistas
                </p>
              </div>

              <div className="mt-5 space-y-4">
                {stats.regimesData.map((reg) => {
                  const percentual = stats.metricasGlobais.totalDocentes > 0 
                    ? Math.round((reg.quantidade / stats.metricasGlobais.totalDocentes) * 100)
                    : 0;

                  return (
                    <div key={reg.nome} className="p-3.5 rounded-xl border border-gray-100 dark:border-neutral-800 bg-gray-50/50 dark:bg-neutral-800/40 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-gray-900 dark:text-neutral-100 flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full inline-block"
                            style={{ backgroundColor: reg.cor }}
                          />
                          {reg.nome}
                        </span>
                        <span className="font-extrabold text-gray-900 dark:text-neutral-100">
                          {reg.quantidade} docente(s) ({percentual}%)
                        </span>
                      </div>

                      <div className="w-full bg-gray-200 dark:bg-neutral-700 h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${percentual}%`, backgroundColor: reg.cor }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 dark:border-neutral-800 text-center">
              <Link href="/docentes" className="text-xs font-bold text-[#e30613] hover:underline">
                Gerenciar Corpo Docente →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Tabela de Próximas Turmas & Hub de Acesso Rápido */}
      {stats && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Tabela de Turmas */}
          <div className="lg:col-span-2 bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-gray-100 dark:border-neutral-800 flex items-center justify-between text-xs">
              <span className="font-bold text-gray-900 dark:text-neutral-100">
                Turmas Recentes & Preenchimento da Grade
              </span>
              <Link href="/turmas" className="font-bold text-[#e30613] hover:underline">
                Ver Todas ({stats.metricasGlobais.totalTurmas}) →
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-600 dark:text-neutral-400">
                <thead className="bg-gray-50 dark:bg-neutral-800/60 text-gray-900 dark:text-neutral-100 font-semibold border-b border-gray-200 dark:border-neutral-800">
                  <tr>
                    <th className="py-3 px-5">Turma</th>
                    <th className="py-3 px-5">Área / Turno</th>
                    <th className="py-3 px-5">Preenchimento</th>
                    <th className="py-3 px-5 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-neutral-800">
                  {stats.turmasResumo.map((t) => (
                    <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-colors">
                      <td className="py-3.5 px-5 font-bold text-gray-900 dark:text-neutral-100">
                        {t.nome}
                      </td>
                      <td className="py-3.5 px-5">
                        <span className="font-medium text-gray-700 dark:text-neutral-300">{t.areaNome}</span>
                        <span className="block text-[10px] text-gray-400 font-semibold">Turno {t.periodo}</span>
                      </td>
                      <td className="py-3.5 px-5 min-w-[140px]">
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span className="font-bold">{t.percentual}%</span>
                          <span className="text-gray-400">{t.preenchidos}/{t.totalSlots} aulas</span>
                        </div>
                        <div className="w-full bg-gray-100 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-[#e30613] h-full rounded-full transition-all"
                            style={{ width: `${t.percentual}%` }}
                          />
                        </div>
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <Link href={`/atribuicoes?turmaId=${t.id}`}>
                          <Button size="sm" variant="ghost" className="h-7 text-xs font-bold text-[#e30613] hover:bg-red-50 dark:hover:bg-red-950/40">
                            Grade →
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Hub de Acesso Rápido */}
          <div className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-gray-900 dark:text-neutral-100 flex items-center gap-2 border-b border-gray-100 dark:border-neutral-800 pb-3">
              <Sparkles className="w-4 h-4 text-[#e30613]" /> Acesso Rápido & Módulos
            </h2>

            <div className="grid gap-2.5 text-xs">
              <Link
                href="/atribuicoes"
                className="p-3 rounded-xl border border-gray-100 dark:border-neutral-800 bg-gray-50/50 dark:bg-neutral-800/40 hover:border-red-300 dark:hover:border-red-900/60 hover:bg-white dark:hover:bg-neutral-800 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-red-50 dark:bg-red-950/50 text-[#e30613]">
                    <CalendarDays className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-gray-900 dark:text-neutral-100 group-hover:text-[#e30613] transition-colors block">
                      Matriz de Atribuição & Grade
                    </span>
                    <span className="text-[10px] text-gray-400">Painel de disponibilidade em tempo real</span>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#e30613] group-hover:translate-x-0.5 transition-all" />
              </Link>

              <Link
                href="/simulador"
                className="p-3 rounded-xl border border-gray-100 dark:border-neutral-800 bg-gray-50/50 dark:bg-neutral-800/40 hover:border-red-300 dark:hover:border-red-900/60 hover:bg-white dark:hover:bg-neutral-800 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/50 text-purple-600">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-gray-900 dark:text-neutral-100 group-hover:text-[#e30613] transition-colors block">
                      Simulador de Demanda
                    </span>
                    <span className="text-[10px] text-gray-400">Previsão e cálculo de contratações</span>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#e30613] group-hover:translate-x-0.5 transition-all" />
              </Link>

              <Link
                href="/relatorios"
                className="p-3 rounded-xl border border-gray-100 dark:border-neutral-800 bg-gray-50/50 dark:bg-neutral-800/40 hover:border-red-300 dark:hover:border-red-900/60 hover:bg-white dark:hover:bg-neutral-800 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-gray-900 dark:text-neutral-100 group-hover:text-[#e30613] transition-colors block">
                      Exportação Excel (.CSV)
                    </span>
                    <span className="text-[10px] text-gray-400">Gargalos e relatórios de ocupação</span>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#e30613] group-hover:translate-x-0.5 transition-all" />
              </Link>

              <Link
                href="/auditoria"
                className="p-3 rounded-xl border border-gray-100 dark:border-neutral-800 bg-gray-50/50 dark:bg-neutral-800/40 hover:border-red-300 dark:hover:border-red-900/60 hover:bg-white dark:hover:bg-neutral-800 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600">
                    <History className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-gray-900 dark:text-neutral-100 group-hover:text-[#e30613] transition-colors block">
                      Auditoria & Logs
                    </span>
                    <span className="text-[10px] text-gray-400">Rastreabilidade de alterações</span>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#e30613] group-hover:translate-x-0.5 transition-all" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
