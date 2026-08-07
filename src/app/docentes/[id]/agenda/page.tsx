'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { 
  CalendarDays, 
  Clock, 
  MapPin, 
  Layers, 
  BookOpen, 
  ArrowLeft, 
  GraduationCap, 
  Printer, 
  Percent, 
  CheckCircle2, 
  UserCheck, 
  Sparkles, 
  Briefcase,
  AlertCircle,
  Calendar,
  List,
  LayoutGrid,
  Check
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
  competencias: { id: string; nome: string; area: string }[];
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

const DIAS_SEMANA_MAP = [
  { id: 1, nome: 'Segunda-feira', sigla: 'Seg' },
  { id: 2, nome: 'Terça-feira', sigla: 'Ter' },
  { id: 3, nome: 'Quarta-feira', sigla: 'Qua' },
  { id: 4, nome: 'Quinta-feira', sigla: 'Qui' },
  { id: 5, nome: 'Sexta-feira', sigla: 'Sex' },
  { id: 6, nome: 'Sábado', sigla: 'Sáb' },
];

export default function DocenteAgendaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [docente, setDocente] = useState<DocenteProfile | null>(null);
  const [metricas, setMetricas] = useState<MetricasDocente | null>(null);
  const [agenda, setAgenda] = useState<AgendaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'semanal' | 'mensal' | 'lista'>('semanal');

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await fetch(`/api/docentes/${id}/agenda`);
        if (res.ok) {
          const data = await res.json();
          setDocente(data.docente);
          setMetricas(data.metricas);
          setAgenda(data.agenda || []);
        }
      } catch (error) {
        console.error('Erro ao carregar agenda do docente:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  // Agrupamento por dia da semana
  const agendaPorDia = DIAS_SEMANA_MAP.map((dia) => {
    const aulas = agenda.filter((a) => a.diaSemana === dia.id);
    return {
      ...dia,
      aulas,
    };
  });

  if (loading) {
    return (
      <div className="bg-white dark:bg-neutral-900 rounded-xl p-16 text-center border border-gray-200 dark:border-neutral-800 space-y-3">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-red-600 border-t-transparent" />
        <p className="text-sm font-medium text-gray-500 dark:text-neutral-400">
          Carregando perfil e calendário mensal do docente...
        </p>
      </div>
    );
  }

  if (!docente) {
    return (
      <div className="bg-white dark:bg-neutral-900 rounded-xl p-12 text-center border border-gray-200 dark:border-neutral-800 space-y-4">
        <AlertCircle className="w-12 h-12 mx-auto text-red-500" />
        <h2 className="text-lg font-bold text-gray-900 dark:text-neutral-100">Docente não encontrado</h2>
        <p className="text-xs text-gray-500 dark:text-neutral-400">
          O registro do docente solicitado não existe ou foi removido do sistema.
        </p>
        <Link href="/docentes">
          <Button variant="outline" className="text-xs gap-1.5 mt-2">
            <ArrowLeft className="w-3.5 h-3.5" /> Voltar para Lista de Docentes
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      
      {/* Botão de Voltar e Ações */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/docentes">
            <Button
              variant="outline"
              size="sm"
              className="text-xs font-semibold gap-1.5 border-gray-300 dark:border-neutral-700"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Voltar ao Corpo Docente
            </Button>
          </Link>
          <span className="text-xs text-gray-400 dark:text-neutral-500">|</span>
          <span className="text-xs font-semibold text-gray-500 dark:text-neutral-400">
            Agenda Mensal e Escala Individual
          </span>
        </div>

        <Button
          onClick={handlePrint}
          variant="outline"
          size="sm"
          className="text-xs font-semibold gap-1.5 border-gray-300 dark:border-neutral-700 text-gray-700 dark:text-neutral-300 shadow-2xs"
        >
          <Printer className="w-3.5 h-3.5 text-[#e30613]" /> Imprimir / Exportar Grade
        </Button>
      </div>

      {/* Header do Perfil do Docente */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-200 dark:border-neutral-800 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-950/60 text-[#e30613] font-bold text-2xl flex items-center justify-center shadow-xs shrink-0">
            {docente.nome.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-neutral-100">
                {docente.nome}
              </h1>
              {docente.ativo ? (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200/60">
                  Docente Ativo
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700 dark:bg-neutral-800 dark:text-neutral-300">
                  Inativo
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-neutral-400 mt-1">
              {docente.email} • Regime: <span className="font-semibold text-gray-800 dark:text-neutral-200">{docente.tipoContratacao}</span>
            </p>

            {/* Tags de Áreas */}
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {docente.areas.map((a) => (
                <span
                  key={a.id}
                  className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/60"
                >
                  {a.nome}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Turnos de Disponibilidade */}
        <div className="bg-gray-50 dark:bg-neutral-800/50 p-4 rounded-xl border border-gray-100 dark:border-neutral-800 text-xs space-y-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-neutral-500 block">
            Disponibilidade Semanal Cadastrada:
          </span>
          <div className="flex flex-wrap gap-1.5">
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              docente.dispManha ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300' : 'bg-gray-200 text-gray-400 dark:bg-neutral-800 dark:text-neutral-600'
            }`}>
              Manhã
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              docente.dispTarde ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300' : 'bg-gray-200 text-gray-400 dark:bg-neutral-800 dark:text-neutral-600'
            }`}>
              Tarde
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              docente.dispNoite ? 'bg-indigo-100 text-indigo-900 dark:bg-indigo-950 dark:text-indigo-300' : 'bg-gray-200 text-gray-400 dark:bg-neutral-800 dark:text-neutral-600'
            }`}>
              Noite
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              docente.dispIntegral ? 'bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-300' : 'bg-gray-200 text-gray-400 dark:bg-neutral-800 dark:text-neutral-600'
            }`}>
              Integral
            </span>
          </div>
        </div>
      </div>

      {/* KPI Cards de Capacidade & Produtividade */}
      {metricas && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Carga Contratada */}
          <div className="bg-white dark:bg-neutral-900 p-5 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider">
                Carga Contratada
              </span>
              <div className="text-2xl font-extrabold text-gray-900 dark:text-neutral-100 mt-1">
                {metricas.cargaContratada}h
              </div>
              <span className="text-[11px] text-gray-500 dark:text-neutral-400 font-medium">
                Limite semanal estabelecido
              </span>
            </div>
            <div className="p-3 rounded-xl bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-neutral-300">
              <Briefcase className="w-6 h-6" />
            </div>
          </div>

          {/* Horas Alocadas / Programadas */}
          <div className="bg-white dark:bg-neutral-900 p-5 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider">
                Horas Programadas
              </span>
              <div className="text-2xl font-extrabold text-[#e30613] mt-1">
                {metricas.horasProgramadas}h
              </div>
              <span className="text-[11px] text-[#e30613] font-medium">
                {metricas.totalAulasSemanais} slots de aula na semana
              </span>
            </div>
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 text-[#e30613]">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          {/* Saldo de Horas Livres */}
          <div className="bg-white dark:bg-neutral-900 p-5 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider">
                Saldo Livre
              </span>
              <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                {metricas.horasLivres}h
              </div>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                Disponíveis para novas turmas
              </span>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>

          {/* Taxa de Ocupação */}
          <div className="bg-white dark:bg-neutral-900 p-5 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider">
                Taxa de Ocupação
              </span>
              <span className="text-lg font-bold text-gray-900 dark:text-neutral-100">
                {metricas.taxaOcupacao}%
              </span>
            </div>
            
            <div className="w-full bg-gray-100 dark:bg-neutral-800 h-2.5 rounded-full overflow-hidden my-2">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  metricas.taxaOcupacao >= 100
                    ? 'bg-red-600'
                    : metricas.taxaOcupacao >= 80
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${metricas.taxaOcupacao}%` }}
              />
            </div>

            <span className="text-[11px] text-gray-500 dark:text-neutral-400">
              {metricas.turmasAtendidas} turma(s) • {metricas.ucsMinistradas} UC(s)
            </span>
          </div>
        </div>
      )}

      {/* Barra de Abas de Visualização */}
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-neutral-800 pb-3">
        <div className="flex items-center gap-2">
          <Button
            variant={activeView === 'semanal' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveView('semanal')}
            className={`text-xs font-semibold gap-1.5 ${
              activeView === 'semanal' ? 'bg-[#e30613] hover:bg-[#b7040f] text-white' : ''
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5" /> Grade Semanal
          </Button>
          <Button
            variant={activeView === 'mensal' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveView('mensal')}
            className={`text-xs font-semibold gap-1.5 ${
              activeView === 'mensal' ? 'bg-[#e30613] hover:bg-[#b7040f] text-white' : ''
            }`}
          >
            <Calendar className="w-3.5 h-3.5" /> Calendário Mensal
          </Button>
          <Button
            variant={activeView === 'lista' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveView('lista')}
            className={`text-xs font-semibold gap-1.5 ${
              activeView === 'lista' ? 'bg-[#e30613] hover:bg-[#b7040f] text-white' : ''
            }`}
          >
            <List className="w-3.5 h-3.5" /> Lista Detalhada
          </Button>
        </div>

        <span className="text-xs text-gray-500 dark:text-neutral-400 hidden sm:inline">
          Total de {agenda.length} aula(s) programada(s)
        </span>
      </div>

      {/* ========================================================================= */}
      {/* 1. VISÃO EM GRADE SEMANAL */}
      {/* ========================================================================= */}
      {activeView === 'semanal' && (
        <div className="space-y-4">
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
            {agendaPorDia.map((dia) => (
              <div
                key={dia.id}
                className={`rounded-xl border flex flex-col justify-between transition-all ${
                  dia.aulas.length > 0
                    ? 'bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-800 shadow-sm'
                    : 'bg-gray-50/60 dark:bg-neutral-900/40 border-gray-100 dark:border-neutral-800/40 opacity-70'
                }`}
              >
                {/* Header do Dia */}
                <div className="p-3 border-b border-gray-100 dark:border-neutral-800 flex items-center justify-between bg-gray-50/50 dark:bg-neutral-800/40 rounded-t-xl">
                  <span className="font-bold text-xs text-gray-900 dark:text-neutral-100">
                    {dia.nome}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      dia.aulas.length > 0
                        ? 'bg-red-50 dark:bg-red-950/50 text-[#e30613]'
                        : 'bg-gray-200 dark:bg-neutral-800 text-gray-500'
                    }`}
                  >
                    {dia.aulas.length} aula(s)
                  </span>
                </div>

                {/* Lista de Aulas no Dia */}
                <div className="p-3 space-y-2.5 flex-1 min-h-[160px]">
                  {dia.aulas.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-4 text-gray-400 dark:text-neutral-500 text-[11px] italic">
                      Sem aulas neste dia.
                    </div>
                  ) : (
                    dia.aulas.map((aula) => (
                      <div
                        key={aula.id}
                        className="p-3 rounded-xl border border-red-100 dark:border-red-950/40 bg-red-50/30 dark:bg-red-950/10 text-xs space-y-2 shadow-2xs"
                      >
                        <div>
                          <span className="font-bold text-gray-900 dark:text-neutral-100 block text-xs leading-snug">
                            {aula.uc.nome}
                          </span>
                          <span className="text-[11px] font-semibold text-[#e30613] block mt-0.5">
                            {aula.turma.nome}
                          </span>
                        </div>

                        <div className="pt-2 border-t border-red-100 dark:border-neutral-800 space-y-1 text-[11px] text-gray-600 dark:text-neutral-300">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3 h-3 text-[#e30613] shrink-0" />
                            <span>{aula.horario} ({aula.turma.periodo})</span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3 h-3 text-[#e30613] shrink-0" />
                            <span className="truncate">{aula.local}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. VISÃO EM CALENDÁRIO MENSAL */}
      {/* ========================================================================= */}
      {activeView === 'mensal' && (
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900 dark:text-neutral-100 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#e30613]" /> Calendário Mensal Consolidado
            </h2>
            <span className="text-xs text-gray-500">Mês Letivo Vigente</span>
          </div>

          {/* Grid do Mês */}
          <div className="grid grid-cols-7 gap-2 text-center">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((dia) => (
              <div key={dia} className="p-2 text-xs font-bold text-gray-500 uppercase bg-gray-50 dark:bg-neutral-800/60 rounded-lg">
                {dia}
              </div>
            ))}

            {/* Dias de exemplo do mês com as aulas recorrentes */}
            {Array.from({ length: 35 }).map((_, index) => {
              const dayNumber = (index % 31) + 1;
              const dayOfWeek = (index % 7); // 0 = Dom, 1 = Seg, etc.
              const aulasDesteDia = agenda.filter((a) => a.diaSemana === dayOfWeek);

              return (
                <div
                  key={index}
                  className={`min-h-[90px] p-2 rounded-xl border text-left flex flex-col justify-between transition-colors ${
                    aulasDesteDia.length > 0
                      ? 'bg-red-50/20 dark:bg-red-950/20 border-red-200 dark:border-red-900/40'
                      : 'bg-white dark:bg-neutral-900 border-gray-100 dark:border-neutral-800/60'
                  }`}
                >
                  <span className="text-xs font-bold text-gray-700 dark:text-neutral-300">
                    {dayNumber}
                  </span>

                  <div className="space-y-1 mt-1">
                    {aulasDesteDia.map((aula) => (
                      <div
                        key={aula.id}
                        className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#e30613] text-white truncate shadow-2xs"
                        title={`${aula.uc.nome} - ${aula.turma.nome} (${aula.horario})`}
                      >
                        {aula.uc.nome}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. VISÃO EM LISTA DETALHADA */}
      {/* ========================================================================= */}
      {activeView === 'lista' && (
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-gray-100 dark:border-neutral-800 font-bold text-xs text-gray-900 dark:text-neutral-100">
            Lista Completa de Aulas Atribuídas ({agenda.length})
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600 dark:text-neutral-400">
              <thead className="bg-gray-50 dark:bg-neutral-800/60 text-gray-900 dark:text-neutral-100 font-semibold border-b border-gray-200 dark:border-neutral-800">
                <tr>
                  <th className="py-3 px-4">Dia da Semana</th>
                  <th className="py-3 px-4">Horário / Turno</th>
                  <th className="py-3 px-4">Unidade Curricular</th>
                  <th className="py-3 px-4">Turma</th>
                  <th className="py-3 px-4">Ambiente / Local</th>
                  <th className="py-3 px-4">Vigência</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-neutral-800">
                {agenda.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-400">
                      Nenhuma aula atribuída a este professor até o momento.
                    </td>
                  </tr>
                ) : (
                  agenda.map((aula) => (
                    <tr key={aula.id} className="hover:bg-gray-50 dark:hover:bg-neutral-800/50">
                      <td className="py-3 px-4 font-bold text-gray-900 dark:text-neutral-100">
                        {DIAS_SEMANA_MAP.find((d) => d.id === aula.diaSemana)?.nome}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold">{aula.horario}</span> ({aula.turma.periodo})
                      </td>
                      <td className="py-3 px-4 font-bold text-[#e30613]">
                        {aula.uc.nome}
                      </td>
                      <td className="py-3 px-4 font-semibold text-gray-800 dark:text-neutral-200">
                        {aula.turma.nome}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 text-gray-700 dark:text-neutral-300">
                          <MapPin className="w-3 h-3 text-[#e30613]" /> {aula.local}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[11px]">
                        {new Date(aula.turma.dataInicio).toLocaleDateString('pt-BR')} a{' '}
                        {new Date(aula.turma.dataTermino).toLocaleDateString('pt-BR')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Competências Mapeadas do Docente */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-gray-900 dark:text-neutral-100 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-[#e30613]" /> Competências Técnicas Homologadas ({docente.competencias.length})
        </h2>
        <div className="flex flex-wrap gap-2">
          {docente.competencias.map((c) => (
            <div
              key={c.id}
              className="px-3 py-1.5 rounded-lg border border-purple-200 dark:border-purple-900/50 bg-purple-50 dark:bg-purple-950/30 text-xs font-semibold text-purple-800 dark:text-purple-300 flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5 text-purple-600" />
              <span>{c.nome}</span>
              <span className="text-[10px] text-purple-500 font-normal">({c.area})</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
