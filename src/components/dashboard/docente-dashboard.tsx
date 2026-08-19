'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  CalendarDays, 
  Clock, 
  MapPin, 
  GraduationCap, 
  BookOpen, 
  Layers, 
  Briefcase, 
  Printer, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw,
  Eye,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AgendaItem {
  id: string;
  diaSemana: number;
  horario: string;
  local: string;
  turma: {
    id: string;
    nome: string;
    tipoCurso: string;
    periodo: string;
    area: string;
    dataInicio: string;
    dataTermino: string;
  };
  uc: {
    id: string;
    nome: string;
  };
}

interface DocenteProfile {
  id: string;
  nome: string;
  email: string;
  ativo: boolean;
  tipoContratacao: string;
  cargaHorariaContratada: number;
  dispManha: boolean;
  dispTarde: boolean;
  dispNoite: boolean;
  dispIntegral: boolean;
  observacoes: string | null;
  areas: { id: string; nome: string }[];
  competencias: { id: string; nome: string }[];
}

interface MetricasDocente {
  cargaContratada: number;
  horasProgramadas: number;
  horasLivres: number;
  taxaOcupacao: number;
  totalAulasSemanais: number;
  turmasAtendidas: number;
  ucsMinistradas: number;
}

const DIAS_SEMANA = [
  { id: 1, nome: 'Segunda-feira', sigla: 'Seg' },
  { id: 2, nome: 'Terça-feira', sigla: 'Ter' },
  { id: 3, nome: 'Quarta-feira', sigla: 'Qua' },
  { id: 4, nome: 'Quinta-feira', sigla: 'Qui' },
  { id: 5, nome: 'Sexta-feira', sigla: 'Sex' },
  { id: 6, nome: 'Sábado', sigla: 'Sáb' },
];

export function DocenteDashboard() {
  const [docente, setDocente] = useState<DocenteProfile | null>(null);
  const [metricas, setMetricas] = useState<MetricasDocente | null>(null);
  const [agenda, setAgenda] = useState<AgendaItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDocenteData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/docentes/me');
      if (res.ok) {
        const data = await res.json();
        setDocente(data.docente);
        setMetricas(data.metricas);
        setAgenda(data.agenda || []);
      }
    } catch (error) {
      console.error('Erro ao carregar dados do docente:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocenteData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-[#e30613]" />
          <span className="text-sm text-gray-500 font-medium">Carregando sua programação de aulas...</span>
        </div>
      </div>
    );
  }

  // Agrupar agenda por dia da semana
  const agendaPorDia = DIAS_SEMANA.map((dia) => ({
    ...dia,
    aulas: agenda.filter((a) => a.diaSemana === dia.id),
  }));

  // Turmas únicas atendidas pelo professor
  const turmasUnicas = Array.from(
    new Map(agenda.map((a) => [a.turma.id, a.turma])).values()
  );

  return (
    <div className="space-y-6 pb-16">
      {/* Banner de Boas-Vindas Personalizado */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-200 dark:border-neutral-800 p-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 dark:bg-red-950/60 text-[#e30613]">
              Portal do Docente SENAI
            </span>
            <span className="text-xs text-gray-400 font-medium">
              Regime: {docente?.tipoContratacao || 'CLT 40h'}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-neutral-100">
            Olá, Professor(a) {docente?.nome?.split(' ')[0]}!
          </h1>
          <p className="text-xs md:text-sm text-gray-500 dark:text-neutral-400 mt-1 max-w-2xl">
            Acompanhe sua agenda semanal de aulas, turmas atribuídas, horários de planejamento e competências homologadas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => window.print()}
            variant="outline"
            className="border-gray-300 dark:border-neutral-700 text-gray-700 dark:text-neutral-300 gap-1.5 text-xs font-medium cursor-pointer"
          >
            <Printer className="w-4 h-4 text-[#e30613]" /> Imprimir Grade
          </Button>
          <Link href="/docentes">
            <Button className="bg-[#e30613] hover:bg-[#b7040f] text-white text-xs font-semibold gap-1.5 shadow-sm cursor-pointer">
              <CalendarDays className="w-4 h-4" /> Ver Minha Agenda
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 Cards de Métricas e Carga Horária Pessoal */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Carga Horária Contratada */}
        <div className="bg-white dark:bg-neutral-900 p-5 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider">
              Carga Contratada
            </span>
            <div className="text-2xl font-bold text-gray-900 dark:text-neutral-100 mt-1">
              {metricas?.cargaContratada || 40}h / sem
            </div>
            <span className="text-[11px] text-gray-500 dark:text-neutral-400 font-medium">
              Regime {docente?.tipoContratacao || 'CLT'}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
            <Briefcase className="w-6 h-6" />
          </div>
        </div>

        {/* Horas em Sala de Aula */}
        <div className="bg-white dark:bg-neutral-900 p-5 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider">
              Aulas Atribuídas
            </span>
            <div className="text-2xl font-bold text-[#e30613] mt-1">
              {metricas?.horasProgramadas || 0}h / sem
            </div>
            <span className="text-[11px] text-gray-500 dark:text-neutral-400 font-medium">
              {metricas?.totalAulasSemanais || 0} bloco(s) de aula
            </span>
          </div>
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 text-[#e30613]">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Horas Livres / Planejamento */}
        <div className="bg-white dark:bg-neutral-900 p-5 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider">
              Horas de Planejamento
            </span>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              {metricas?.horasLivres || 0}h / sem
            </div>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              Disponível para preparo
            </span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>

        {/* Turmas sob Responsabilidade */}
        <div className="bg-white dark:bg-neutral-900 p-5 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider">
              Minhas Turmas
            </span>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
              {metricas?.turmasAtendidas || 0}
            </div>
            <span className="text-[11px] text-gray-500 dark:text-neutral-400 font-medium">
              {metricas?.ucsMinistradas || 0} UCs ministradas
            </span>
          </div>
          <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
            <GraduationCap className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Grade Semanal das Minhas Aulas */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-200 dark:border-neutral-800 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-neutral-100 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#e30613]" /> Minha Grade Semanal de Aulas
            </h2>
            <p className="text-xs text-gray-500 dark:text-neutral-400 mt-0.5">
              Programação semanal de sala de aula e laboratórios alocados para você.
            </p>
          </div>
          <span className="text-xs font-semibold text-gray-500 dark:text-neutral-400 bg-gray-100 dark:bg-neutral-800 px-2.5 py-1 rounded-lg">
            Ocupação: {metricas?.taxaOcupacao || 0}%
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-5">
          {agendaPorDia.map((dia) => (
            <div
              key={dia.id}
              className={`rounded-xl border p-4 transition-all ${
                dia.aulas.length > 0
                  ? 'bg-red-50/20 dark:bg-red-950/10 border-red-200/60 dark:border-red-900/40 shadow-xs'
                  : 'bg-gray-50/50 dark:bg-neutral-800/30 border-gray-200/60 dark:border-neutral-800/60'
              }`}
            >
              <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-neutral-800">
                <span className="font-bold text-sm text-gray-900 dark:text-neutral-100">
                  {dia.nome}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    dia.aulas.length > 0
                      ? 'bg-red-100 dark:bg-red-950/60 text-[#e30613]'
                      : 'bg-gray-200/70 dark:bg-neutral-700 text-gray-500'
                  }`}
                >
                  {dia.aulas.length > 0 ? `${dia.aulas.length} aula(s)` : 'Sem aula'}
                </span>
              </div>

              <div className="mt-3 space-y-2.5">
                {dia.aulas.length === 0 ? (
                  <p className="text-xs text-gray-400 italic py-2">
                    Horário livre / planejamento
                  </p>
                ) : (
                  dia.aulas.map((aula) => (
                    <div
                      key={aula.id}
                      className="bg-white dark:bg-neutral-900 p-3 rounded-lg border border-red-100 dark:border-red-900/30 shadow-xs space-y-1"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-gray-900 dark:text-neutral-100 truncate max-w-[170px]" title={aula.turma.nome}>
                          {aula.turma.nome}
                        </span>
                        <span className="font-mono text-[10px] text-[#e30613] font-semibold">
                          {aula.horario}
                        </span>
                      </div>
                      <div className="text-[11px] text-gray-600 dark:text-neutral-300 flex items-center gap-1 font-medium">
                        <BookOpen className="w-3 h-3 text-gray-400 shrink-0" />
                        <span className="truncate" title={aula.uc.nome}>{aula.uc.nome}</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-2.5 h-2.5 text-gray-400" /> {aula.local}
                        </span>
                        <span className="uppercase text-[9px] font-bold px-1.5 py-0.2 rounded bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-400">
                          {aula.turma.periodo}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Grid Inferior: Minhas Turmas & Minhas Competências */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Minhas Turmas */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100 dark:border-neutral-800">
            <div>
              <h3 className="font-bold text-gray-900 dark:text-neutral-100 text-sm flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-purple-600" /> Minhas Turmas Ativas
              </h3>
              <p className="text-xs text-gray-500 dark:text-neutral-400 mt-0.5">
                Turmas em andamento onde você ministra aulas.
              </p>
            </div>
            <Link href="/turmas" className="text-xs font-semibold text-[#e30613] hover:underline flex items-center gap-1">
              Ver todas <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {turmasUnicas.length === 0 ? (
            <p className="text-xs text-gray-400 italic py-4 text-center">
              Você ainda não possui turmas atribuídas no momento.
            </p>
          ) : (
            <div className="space-y-2.5">
              {turmasUnicas.map((t) => (
                <div
                  key={t.id}
                  className="p-3 rounded-lg border border-gray-100 dark:border-neutral-800 bg-gray-50/50 dark:bg-neutral-800/40 flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-xs text-gray-900 dark:text-neutral-100">
                      {t.nome}
                    </div>
                    <div className="text-[11px] text-gray-500 dark:text-neutral-400 mt-0.5">
                      Área: <span className="font-semibold text-gray-700 dark:text-neutral-300">{t.area}</span> • Período: {t.periodo}
                    </div>
                  </div>
                  <Link href="/turmas">
                    <Button variant="ghost" size="sm" className="text-xs h-7 text-[#e30613] hover:bg-red-50 dark:hover:bg-red-950/40">
                      <Eye className="w-3.5 h-3.5 mr-1" /> Grade
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Minhas Competências Homologadas */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100 dark:border-neutral-800">
            <div>
              <h3 className="font-bold text-gray-900 dark:text-neutral-100 text-sm flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600" /> Minhas Competências Homologadas
              </h3>
              <p className="text-xs text-gray-500 dark:text-neutral-400 mt-0.5">
                Unidades Curriculares habilitadas para seu perfil pedagógico.
              </p>
            </div>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/50 px-2.5 py-0.5 rounded-full">
              {docente?.competencias?.length || 0} UCs
            </span>
          </div>

          {(!docente?.competencias || docente.competencias.length === 0) ? (
            <p className="text-xs text-gray-400 italic py-4 text-center">
              Nenhuma competência registrada. Contate seu Orientador (OPP) ou Coordenação.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {docente.competencias.map((comp) => (
                <span
                  key={comp.id}
                  className="px-3 py-1 rounded-lg text-xs font-medium bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/40 flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3 h-3 text-blue-600" />
                  {comp.nome}
                </span>
              ))}
            </div>
          )}

          {docente?.areas && docente.areas.length > 0 && (
            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-neutral-800">
              <span className="text-[11px] font-semibold text-gray-400 block mb-1.5">
                Áreas de Atuação Homologadas:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {docente.areas.map((a) => (
                  <span
                    key={a.id}
                    className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-neutral-300"
                  >
                    {a.nome}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
