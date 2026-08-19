'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { 
  CalendarDays, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  MapPin, 
  Layers, 
  Users, 
  UserCheck, 
  UserX, 
  AlertCircle, 
  Edit, 
  Trash2, 
  Percent, 
  BookOpen, 
  Check, 
  HelpCircle,
  GraduationCap,
  ChevronRight,
  RefreshCw,
  ShieldAlert,
  ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CustomSelect } from '@/components/ui/custom-select';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';

interface Turma {
  id: string;
  nome: string;
  tipoCurso: string;
  periodo: string;
  dataInicio: string;
  dataTermino: string;
  diasSemana: string;
  aulasSemanais: number;
  totalAulas: number;
  area: {
    id: string;
    nome: string;
  };
  atribuicoes: AtribuicaoItem[];
}

interface AtribuicaoItem {
  id: string;
  turmaId: string;
  ucId: string;
  docenteId: string | null;
  diaSemana: number;
  horario: string;
  local: string | null;
  uc: {
    id: string;
    nome: string;
    areaId: string;
  };
  docente?: {
    id: string;
    cargaHorariaContratada: number;
    tipoContratacao: string;
    usuario: {
      nome: string;
      email: string;
    };
  } | null;
}

interface DocenteDisponivel {
  id: string;
  nome: string;
  email: string;
  tipoContratacao: string;
  cargaHorariaContratada: number;
  horasAlocadas: number;
  status: 'DISPONIVEL' | 'INDISPONIVEL';
  motivo: string;
  temCompetencia: boolean;
  temArea: boolean;
  temTurno: boolean;
  conflito: {
    turmaNome: string;
    ucNome: string;
    horario: string;
  } | null;
}

const DIAS_SEMANA_MAP = [
  { id: 1, nome: 'Segunda-feira', sigla: 'Seg' },
  { id: 2, nome: 'Terça-feira', sigla: 'Ter' },
  { id: 3, nome: 'Quarta-feira', sigla: 'Qua' },
  { id: 4, nome: 'Quinta-feira', sigla: 'Qui' },
  { id: 5, nome: 'Sexta-feira', sigla: 'Sex' },
  { id: 6, nome: 'Sábado', sigla: 'Sáb' },
];

export default function AtribuicoesPage() {
  const { data: session, status: sessionStatus } = useSession();
  const userPerfil = (session?.user as any)?.perfil;
  const isAuthorized = userPerfil === 'COORDENADOR' || userPerfil === 'SECRETARIA' || userPerfil === 'OPP';

  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [selectedTurmaId, setSelectedTurmaId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Métricas
  const [metricas, setMetricas] = useState({
    totalSlots: 0,
    slotsAtribuidos: 0,
    slotsPendentes: 0,
    taxaGeralOcupacao: 0,
  });

  // Modal de Atribuição Inteligente (Painel Verde/Vermelho)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<AtribuicaoItem | null>(null);
  const [disponibilidadeDocentes, setDisponibilidadeDocentes] = useState<DocenteDisponivel[]>([]);
  const [loadingDisponibilidade, setLoadingDisponibilidade] = useState(false);
  const [slotLocal, setSlotLocal] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Carregar turmas e matriz
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/atribuicoes');
      if (res.ok) {
        const data = await res.json();
        setTurmas(data.turmas || []);
        setMetricas(data.metricas || {
          totalSlots: 0,
          slotsAtribuidos: 0,
          slotsPendentes: 0,
          taxaGeralOcupacao: 0,
        });

        if (data.turmas && data.turmas.length > 0 && !selectedTurmaId) {
          setSelectedTurmaId(data.turmas[0].id);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar atribuições:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showFeedback = (type: 'success' | 'error', text: string) => {
    setFeedbackMessage({ type, text });
    setTimeout(() => setFeedbackMessage(null), 5000);
  };

  // Turma atualmente selecionada para visualização da grade
  const selectedTurma = useMemo(() => {
    return turmas.find((t) => t.id === selectedTurmaId) || turmas[0] || null;
  }, [turmas, selectedTurmaId]);

  // Abrir Modal Inteligente de Atribuição
  const handleOpenAssign = async (slot: AtribuicaoItem) => {
    setSelectedSlot(slot);
    setSlotLocal(slot.local || '');
    setIsModalOpen(true);
    setDisponibilidadeDocentes([]);
    setLoadingDisponibilidade(true);

    try {
      const res = await fetch(
        `/api/atribuicoes/disponibilidade?turmaId=${slot.turmaId}&ucId=${slot.ucId}&diaSemana=${slot.diaSemana}&horario=${encodeURIComponent(
          slot.horario
        )}`
      );

      if (res.ok) {
        const data = await res.json();
        setDisponibilidadeDocentes(data.docentes || []);
      }
    } catch (error) {
      console.error('Erro ao carregar disponibilidade:', error);
    } finally {
      setLoadingDisponibilidade(false);
    }
  };

  // Atribuir Docente ao Slot
  const handleAssignDocente = async (docenteId: string) => {
    if (!selectedSlot) return;

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/atribuicoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          atribuicaoId: selectedSlot.id,
          docenteId,
          local: slotLocal,
          diaSemana: selectedSlot.diaSemana,
          horario: selectedSlot.horario,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        showFeedback('error', data.error || 'Erro ao atribuir docente.');
        return;
      }

      showFeedback('success', 'Professor atribuído à aula com sucesso!');
      setIsModalOpen(false);
      await fetchData();
    } catch (error: any) {
      showFeedback('error', error.message || 'Erro inesperado.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Salvar apenas o local da aula
  const handleSaveLocalOnly = async () => {
    if (!selectedSlot) return;

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/atribuicoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          atribuicaoId: selectedSlot.id,
          docenteId: selectedSlot.docenteId,
          local: slotLocal,
          diaSemana: selectedSlot.diaSemana,
          horario: selectedSlot.horario,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        showFeedback('error', data.error || 'Erro ao salvar local.');
        return;
      }

      showFeedback('success', 'Local da aula atualizado com sucesso!');
      setIsModalOpen(false);
      await fetchData();
    } catch (error: any) {
      showFeedback('error', error.message || 'Erro inesperado.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Desalocar Docente do Slot
  const handleUnassign = async (atribuicaoId: string) => {
    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/atribuicoes?id=${atribuicaoId}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (!res.ok) {
        showFeedback('error', data.error || 'Erro ao desalocar professor.');
        return;
      }

      showFeedback('success', 'Docente desalocado. A aula retornou ao status pendente.');
      setIsModalOpen(false);
      await fetchData();
    } catch (error: any) {
      showFeedback('error', error.message || 'Erro inesperado.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Separar docentes disponíveis e indisponíveis
  const docentesAptos = useMemo(() => {
    return disponibilidadeDocentes.filter((d) => d.status === 'DISPONIVEL');
  }, [disponibilidadeDocentes]);

  const docentesBloqueados = useMemo(() => {
    return disponibilidadeDocentes.filter((d) => d.status !== 'DISPONIVEL');
  }, [disponibilidadeDocentes]);

  // Agrupamento das atribuições da turma selecionada por dia da semana
  const atribuicoesPorDia = useMemo(() => {
    if (!selectedTurma) return {};
    const map: { [key: number]: AtribuicaoItem[] } = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };

    selectedTurma.atribuicoes.forEach((atrib) => {
      if (map[atrib.diaSemana]) {
        map[atrib.diaSemana].push(atrib);
      } else {
        map[atrib.diaSemana] = [atrib];
      }
    });

    return map;
  }, [selectedTurma]);

  // Dias ativos na turma selecionada
  const diasAtivosDaTurma = useMemo(() => {
    if (!selectedTurma?.diasSemana) return [1, 2, 3, 4, 5];
    const siglas = selectedTurma.diasSemana.split(',').map((s) => s.trim());
    return DIAS_SEMANA_MAP.filter((d) => siglas.includes(d.sigla)).map((d) => d.id);
  }, [selectedTurma]);

  // Métricas da turma selecionada
  const totalSlotsTurma = selectedTurma?.atribuicoes.length || 0;
  const atribuidosTurma = selectedTurma?.atribuicoes.filter((a) => a.docenteId !== null).length || 0;
  const percentualTurma = totalSlotsTurma > 0 ? Math.round((atribuidosTurma / totalSlotsTurma) * 100) : 0;

  // Se estiver carregando sessão
  if (sessionStatus === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-2">
          <RefreshCw className="w-6 h-6 animate-spin text-[#e30613]" />
          <span className="text-xs text-gray-500 font-medium">Verificando permissões...</span>
        </div>
      </div>
    );
  }

  // Se perfil não tiver autorização (Docente)
  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center animate-in fade-in">
        <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-950/50 text-[#e30613] flex items-center justify-center mb-4 shadow-sm border border-red-200 dark:border-red-900/50">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-neutral-100">
          Acesso Restrito
        </h2>
        <p className="text-xs text-gray-500 dark:text-neutral-400 mt-2 max-w-md leading-relaxed">
          A <strong>Matriz de Atribuição & Grade Semanal</strong> é gerenciada pela <strong>Coordenação</strong>, <strong>Secretaria</strong> e <strong>Orientadores (OPP)</strong>. Para consultar seus horários e turmas atribuídas, acesse sua <Link href="/docentes" className="text-[#e30613] underline font-bold">Agenda de Docente</Link>.
        </p>
        <div className="mt-6">
          <Link href="/dashboard">
            <Button className="bg-[#e30613] hover:bg-[#b7040f] text-white text-xs font-semibold gap-2 shadow-sm cursor-pointer">
              <ArrowLeft className="w-4 h-4" /> Voltar ao Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header Corporativo SENAI */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 dark:border-neutral-800 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-neutral-100">
              Matriz de Atribuição & Grade
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-950/60 text-[#e30613]">
              Painel de Disponibilidade em Tempo Real
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-neutral-400 mt-1">
            Distribuição inteligente de professores nas Unidades Curriculares com prevenção automática de conflitos de horários.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={fetchData}
            variant="outline"
            className="border-gray-300 dark:border-neutral-700 text-gray-700 dark:text-neutral-300 gap-1.5 text-xs font-medium"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Atualizar Matriz
          </Button>
        </div>
      </div>

      {/* Alerta de Feedback */}
      {feedbackMessage && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center justify-between shadow-xs ${
            feedbackMessage.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
              : 'bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedbackMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
            )}
            <span className="font-semibold">{feedbackMessage.text}</span>
          </div>
          <button
            onClick={() => setFeedbackMessage(null)}
            className="text-xs hover:underline font-bold"
          >
            Fechar
          </button>
        </div>
      )}

      {/* KPI Cards de Ocupação da Unidade */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total de Aulas */}
        <div className="bg-white dark:bg-neutral-900 p-5 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider">
              Aulas Programadas
            </span>
            <div className="text-2xl font-extrabold text-gray-900 dark:text-neutral-100 mt-1">
              {metricas.totalSlots}
            </div>
            <span className="text-[11px] text-gray-500 dark:text-neutral-400 font-medium">
              Slots semanais em todas as turmas
            </span>
          </div>
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 text-[#e30613]">
            <CalendarDays className="w-6 h-6" />
          </div>
        </div>

        {/* Aulas Atribuídas (Concluídas) */}
        <div className="bg-white dark:bg-neutral-900 p-5 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider">
              Docentes Escalados
            </span>
            <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
              {metricas.slotsAtribuidos}
            </div>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              Aulas com professor definido
            </span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Aulas Pendentes */}
        <div className="bg-white dark:bg-neutral-900 p-5 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider">
              Aulas Pendentes
            </span>
            <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">
              {metricas.slotsPendentes}
            </div>
            <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
              Aguardando atribuição do gestor
            </span>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        {/* Taxa Geral de Ocupação */}
        <div className="bg-white dark:bg-neutral-900 p-5 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider">
              Ocupação da Grade
            </span>
            <div className="text-2xl font-extrabold text-gray-900 dark:text-neutral-100 mt-1">
              {metricas.taxaGeralOcupacao}%
            </div>
            <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">
              Eficiência geral da unidade
            </span>
          </div>
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
            <Percent className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Seletor de Turma & Barra de Controle */}
      <div className="bg-white dark:bg-neutral-900 p-5 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="w-full md:w-96">
          <Label className="text-xs font-bold text-gray-700 dark:text-neutral-300 block mb-1.5">
            Selecione a Turma para Gerenciar a Grade Semanal:
          </Label>
          <CustomSelect
            value={selectedTurmaId}
            onChange={setSelectedTurmaId}
            icon={GraduationCap}
            placeholder="Selecione uma turma..."
            options={turmas.map((t) => ({
              value: t.id,
              label: `${t.nome} (${t.area.nome})`,
            }))}
          />
        </div>

        {selectedTurma && (
          <div className="flex flex-wrap items-center gap-4 text-xs pt-2 md:pt-0 border-t md:border-t-0 border-gray-100 dark:border-neutral-800">
            <div>
              <span className="text-gray-400 text-[11px] block">Área & Período</span>
              <span className="font-bold text-gray-800 dark:text-neutral-200">
                {selectedTurma.area.nome} • Turno {selectedTurma.periodo}
              </span>
            </div>

            <div>
              <span className="text-gray-400 text-[11px] block">Vigência</span>
              <span className="font-semibold text-gray-800 dark:text-neutral-200">
                {new Date(selectedTurma.dataInicio).toLocaleDateString('pt-BR')} a{' '}
                {new Date(selectedTurma.dataTermino).toLocaleDateString('pt-BR')}
              </span>
            </div>

            <div>
              <span className="text-gray-400 text-[11px] block">Preenchimento da Turma</span>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-[#e30613]">{percentualTurma}%</span>
                <span className="text-gray-500 text-[11px]">
                  ({atribuidosTurma} de {totalSlotsTurma} aulas)
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Matriz Visual da Grade Semanal */}
      {loading ? (
        <div className="bg-white dark:bg-neutral-900 rounded-xl p-16 text-center border border-gray-200 dark:border-neutral-800">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-red-600 border-t-transparent mb-3" />
          <p className="text-sm text-gray-500 dark:text-neutral-400 font-medium">
            Carregando grade semanal e disponibilidade docente...
          </p>
        </div>
      ) : !selectedTurma ? (
        <div className="bg-white dark:bg-neutral-900 rounded-xl p-12 text-center border border-gray-200 dark:border-neutral-800 space-y-3">
          <CalendarDays className="w-12 h-12 mx-auto text-gray-300 dark:text-neutral-700" />
          <p className="text-base font-bold text-gray-800 dark:text-neutral-200">
            Nenhuma turma cadastrada no momento
          </p>
          <p className="text-xs text-gray-500 dark:text-neutral-400">
            Cadastre turmas na tela de "Turmas e Ocupação" para estruturar a grade de atribuição.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900 dark:text-neutral-100 flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-[#e30613]" />
              Grade Semanal: {selectedTurma.nome}
            </h2>
            <span className="text-xs text-gray-500 dark:text-neutral-400">
              Dias letivos: {selectedTurma.diasSemana}
            </span>
          </div>

          {/* Grid de Colunas por Dia da Semana (Segunda a Sábado) */}
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
            {DIAS_SEMANA_MAP.map((dia) => {
              const aulasDoDia = atribuicoesPorDia[dia.id] || [];
              const isDiaLetivo = diasAtivosDaTurma.includes(dia.id);

              return (
                <div
                  key={dia.id}
                  className={`rounded-xl border flex flex-col justify-between transition-all ${
                    isDiaLetivo
                      ? 'bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-800 shadow-sm'
                      : 'bg-gray-50/70 dark:bg-neutral-900/40 border-gray-100 dark:border-neutral-800/40 opacity-70'
                  }`}
                >
                  {/* Cabeçalho do Dia */}
                  <div className="p-3.5 border-b border-gray-100 dark:border-neutral-800/80 flex items-center justify-between bg-gray-50/50 dark:bg-neutral-800/40 rounded-t-xl">
                    <span className="font-bold text-xs text-gray-900 dark:text-neutral-100">
                      {dia.nome}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        isDiaLetivo
                          ? 'bg-red-50 dark:bg-red-950/50 text-[#e30613]'
                          : 'bg-gray-200 dark:bg-neutral-800 text-gray-500'
                      }`}
                    >
                      {aulasDoDia.length} aula(s)
                    </span>
                  </div>

                  {/* Cards de Aulas no Dia */}
                  <div className="p-3 space-y-2.5 flex-1 min-h-[160px]">
                    {aulasDoDia.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center p-4 text-gray-400 dark:text-neutral-500 text-[11px] italic">
                        {isDiaLetivo ? 'Nenhuma aula alocada neste dia.' : 'Sem aulas programadas.'}
                      </div>
                    ) : (
                      aulasDoDia.map((slot) => {
                        const isAtribuido = slot.docenteId !== null && slot.docente !== null;

                        return (
                          <div
                            key={slot.id}
                            className={`p-3 rounded-xl border transition-all text-xs flex flex-col justify-between space-y-2.5 ${
                              isAtribuido
                                ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200/80 dark:border-emerald-900/40 shadow-2xs'
                                : 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200/80 dark:border-amber-900/40 shadow-2xs'
                            }`}
                          >
                            <div>
                              {/* UC e Horário */}
                              <div className="flex items-start justify-between gap-1">
                                <span className="font-bold text-gray-900 dark:text-neutral-100 leading-snug line-clamp-2">
                                  {slot.uc.nome}
                                </span>
                              </div>

                              <div className="flex items-center gap-1 text-[11px] text-gray-500 dark:text-neutral-400 mt-1">
                                <Clock className="w-3 h-3 shrink-0" />
                                <span>{slot.horario}</span>
                              </div>

                              {/* Local */}
                              <div className="flex items-center gap-1 text-[11px] text-gray-600 dark:text-neutral-300 mt-1">
                                <MapPin className="w-3 h-3 shrink-0 text-[#e30613]" />
                                <span className="truncate">
                                  {slot.local || 'Local a definir'}
                                </span>
                              </div>
                            </div>

                            {/* Informações do Professor */}
                            <div className="pt-2 border-t border-gray-200/60 dark:border-neutral-800/60">
                              {isAtribuido ? (
                                <div className="space-y-2">
                                  <div className="flex items-center gap-1.5">
                                    <div className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0">
                                      ✓
                                    </div>
                                    <div className="truncate">
                                      <span className="font-bold text-emerald-900 dark:text-emerald-300 truncate block text-[11px]">
                                        {slot.docente?.usuario?.nome}
                                      </span>
                                      <span className="text-[10px] text-emerald-700/80 dark:text-emerald-400/80 block">
                                        {slot.docente?.tipoContratacao}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="flex items-center justify-between gap-1 pt-1">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleOpenAssign(slot)}
                                      className="text-[10px] h-6 px-2 text-gray-700 dark:text-neutral-300 hover:text-gray-900"
                                    >
                                      Alterar
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleUnassign(slot.id)}
                                      className="text-[10px] h-6 px-2 text-red-600 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-950/40"
                                      title="Desalocar docente"
                                    >
                                      Desalocar
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
                                    <AlertTriangle className="w-4 h-4 shrink-0" />
                                    <span className="text-[11px] font-semibold">
                                      Pendente de Docente
                                    </span>
                                  </div>

                                  <Button
                                    size="sm"
                                    onClick={() => handleOpenAssign(slot)}
                                    className="w-full bg-[#e30613] hover:bg-[#b7040f] text-white text-[11px] font-semibold h-7 shadow-2xs gap-1"
                                  >
                                    <UserCheck className="w-3.5 h-3.5" /> Atribuir Docente
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL INTELIGENTE DE ATRIBUIÇÃO DOCENTE COM PAINEL VERDE / VERMELHO */}
      {/* ========================================================================= */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-3xl md:max-w-4xl lg:max-w-5xl w-[95vw] min-h-[620px] max-h-[95vh] overflow-y-auto p-6 md:p-8 flex flex-col justify-between">
          <DialogHeader className="border-b border-gray-200 dark:border-neutral-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/50 text-[#e30613]">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-gray-900 dark:text-neutral-100">
                  Painel de Disponibilidade Docente em Tempo Real
                </DialogTitle>
                <DialogDescription className="text-xs text-gray-500 dark:text-neutral-400 mt-0.5">
                  Análise inteligente de competência técnica, turno, carga horária e prevenção de conflitos de choque de horários.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {selectedSlot && (
            <div className="space-y-6 pt-2 flex-1">
              {/* Card Resumo do Slot de Aula */}
              <div className="bg-gray-50 dark:bg-neutral-800/40 p-4 rounded-xl border border-gray-200 dark:border-neutral-800 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-gray-400 text-[11px] block">Unidade Curricular</span>
                  <span className="font-bold text-gray-900 dark:text-neutral-100">
                    {selectedSlot.uc.nome}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 text-[11px] block">Turma & Turno</span>
                  <span className="font-bold text-gray-900 dark:text-neutral-100">
                    {selectedTurma?.nome} ({selectedTurma?.periodo})
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 text-[11px] block">Dia & Horário</span>
                  <span className="font-bold text-gray-900 dark:text-neutral-100">
                    {DIAS_SEMANA_MAP.find((d) => d.id === selectedSlot.diaSemana)?.nome} • {selectedSlot.horario}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 text-[11px] block">Ambiente Pedagógico (Local)</span>
                  <Input
                    placeholder="Ex: Lab TI 01, Oficina CNC..."
                    value={slotLocal}
                    onChange={(e) => setSlotLocal(e.target.value)}
                    className="h-8 text-xs mt-1 bg-white dark:bg-neutral-900"
                  />
                </div>
              </div>

              {/* Status e Consulta de Docentes */}
              {loadingDisponibilidade ? (
                <div className="p-12 text-center text-gray-500 space-y-2">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-red-600 border-t-transparent" />
                  <p className="text-xs font-medium">Cruzando competências e checando choque de horários...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* SEÇÃO 1: DOCENTES APTOS E DISPONÍVEIS (VERDE) */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-emerald-500" />
                      <h3 className="font-bold text-xs uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                        Docentes Aptos & Disponíveis ({docentesAptos.length})
                      </h3>
                      <span className="text-[11px] text-gray-400">
                        Possuem competência técnica na UC, atuam na área e estão livres neste horário.
                      </span>
                    </div>

                    {docentesAptos.length === 0 ? (
                      <div className="p-6 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-amber-800 dark:text-amber-300 text-xs text-center">
                        Nenhum professor livre e competente encontrado para esta UC neste turno e horário.
                      </div>
                    ) : (
                      <div className="grid gap-3 sm:grid-cols-2">
                        {docentesAptos.map((docente) => {
                          const isCurrent = selectedSlot.docenteId === docente.id;

                          return (
                            <div
                              key={docente.id}
                              className={`p-4 rounded-xl border transition-all flex flex-col justify-between space-y-3 ${
                                isCurrent
                                  ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-400 dark:border-emerald-700 shadow-sm ring-1 ring-emerald-500'
                                  : 'bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-800 hover:border-emerald-300 dark:hover:border-emerald-800 shadow-xs'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center text-xs shrink-0">
                                    {docente.nome.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <div className="font-bold text-gray-900 dark:text-neutral-100 text-xs">
                                      {docente.nome}
                                    </div>
                                    <div className="text-[11px] text-gray-500 dark:text-neutral-400">
                                      {docente.tipoContratacao} • {docente.horasAlocadas}h de {docente.cargaHorariaContratada}h alocadas
                                    </div>
                                  </div>
                                </div>

                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200/60">
                                  ✓ Disponível
                                </span>
                              </div>

                              <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-neutral-800">
                                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                                  Competência validada
                                </span>

                                <Button
                                  size="sm"
                                  disabled={isSubmitting || isCurrent}
                                  onClick={() => handleAssignDocente(docente.id)}
                                  className={`text-xs font-semibold h-7 px-3 shadow-xs ${
                                    isCurrent
                                      ? 'bg-emerald-600 text-white cursor-default'
                                      : 'bg-[#e30613] hover:bg-[#b7040f] text-white'
                                  }`}
                                >
                                  {isCurrent ? 'Docente Alocado' : 'Atribuir a Esta Aula'}
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* SEÇÃO 2: DOCENTES INDISPONÍVEIS OU COM CONFLITO (VERMELHO) */}
                  {docentesBloqueados.length > 0 && (
                    <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-neutral-800">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-red-500" />
                        <h3 className="font-bold text-xs uppercase tracking-wider text-red-700 dark:text-red-400">
                          Docentes Indisponíveis ou com Bloqueio ({docentesBloqueados.length})
                        </h3>
                        <span className="text-[11px] text-gray-400">
                          Bloqueados por choque de horário, ausência de competência na UC ou limite de contrato.
                        </span>
                      </div>

                      <div className="grid gap-2.5 sm:grid-cols-2">
                        {docentesBloqueados.map((docente) => (
                          <div
                            key={docente.id}
                            className="p-3.5 rounded-xl border border-red-200/60 dark:border-red-900/30 bg-red-50/30 dark:bg-red-950/20 text-xs space-y-2 opacity-85"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="font-bold text-gray-900 dark:text-neutral-100">
                                {docente.nome}
                              </div>
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300">
                                🚫 Bloqueado
                              </span>
                            </div>

                            <div className="p-2 rounded-lg bg-white/70 dark:bg-neutral-900/60 border border-red-100 dark:border-red-950/60 text-[11px] text-red-800 dark:text-red-300 flex items-start gap-1.5">
                              <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-600 mt-0.5" />
                              <span>{docente.motivo}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <DialogFooter className="pt-4 border-t border-gray-200 dark:border-neutral-800 flex items-center justify-between gap-3">
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              className="text-xs"
            >
              Fechar
            </Button>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                disabled={isSubmitting}
                onClick={handleSaveLocalOnly}
                className="text-xs font-semibold"
              >
                Salvar Apenas Local
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
