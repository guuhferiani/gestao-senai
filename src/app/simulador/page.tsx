'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { 
  Sparkles, 
  Plus, 
  Trash2, 
  Printer, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Users, 
  Clock, 
  GraduationCap, 
  Layers, 
  Briefcase, 
  RefreshCw, 
  HelpCircle,
  BarChart3,
  TrendingUp,
  FileSpreadsheet,
  ArrowRight,
  ShieldAlert,
  ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CustomSelect } from '@/components/ui/custom-select';

interface TurmaSimulada {
  id: string;
  nome: string;
  areaId: string;
  areaNome: string;
  tipoCurso: string;
  periodo: string;
  aulasSemanais: number;
}

interface AreaTecnologica {
  id: string;
  nome: string;
}

interface MetricasSimulacao {
  totalTurmasSimuladas: number;
  demandaTotalGeral: number;
  horasAtendidasPeloQuadro: number;
  deficitHorasGeral: number;
  novosDocentesRecomendadosGeral: number;
  autossuficiente: boolean;
}

interface DiagnosticoArea {
  areaId: string;
  areaNome: string;
  totalDocentesAtuais: number;
  horasLivresAtuais: number;
  demandaHorasSimulada: number;
  turmasSimuladasQtd: number;
  saldoFinalHoras: number;
  deficit: number;
  status: 'AUTOSSUFICIENTE' | 'DEFICIT' | 'ALERTA';
  taxaOcupacaoProjetada: number;
  qtdDocentesNecessarios: number;
  recomendacaoContratacao: string;
}

export default function SimuladorPage() {
  const { data: session, status: sessionStatus } = useSession();
  const userPerfil = (session?.user as any)?.perfil;
  const isAuthorized = userPerfil === 'COORDENADOR' || userPerfil === 'SECRETARIA';

  const [areas, setAreas] = useState<AreaTecnologica[]>([]);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);

  // Cenário de Turmas Simuladas
  const [turmasSimuladas, setTurmasSimuladas] = useState<TurmaSimulada[]>([]);

  // Formulário de Nova Turma Simulada
  const [novaTurma, setNovaTurma] = useState({
    nome: '',
    areaId: '',
    tipoCurso: 'TECNICO',
    periodo: 'NOITE',
    aulasSemanais: 20,
  });

  // Resultados da Simulação Preditiva
  const [metricas, setMetricas] = useState<MetricasSimulacao | null>(null);
  const [diagnosticoAreas, setDiagnosticoAreas] = useState<DiagnosticoArea[]>([]);

  // Carregar Áreas Tecnológicas
  useEffect(() => {
    async function loadAreas() {
      try {
        setLoading(true);
        const res = await fetch('/api/areas');
        if (res.ok) {
          const data = await res.json();
          setAreas(data || []);
          if (data && data.length > 0) {
            setNovaTurma((prev) => ({ ...prev, areaId: data[0].id }));
          }
        }
      } catch (error) {
        console.error('Erro ao carregar áreas para simulação:', error);
      } finally {
        setLoading(false);
      }
    }
    loadAreas();
  }, []);

  // Executar recálculo da simulação
  const runSimulation = async (scenario: TurmaSimulada[]) => {
    try {
      setCalculating(true);
      const res = await fetch('/api/simulador', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ turmas: scenario }),
      });

      if (res.ok) {
        const data = await res.json();
        setMetricas(data.metricasSimulacao);
        setDiagnosticoAreas(data.diagnosticoAreas || []);
      }
    } catch (error) {
      console.error('Erro ao calcular simulação:', error);
    } finally {
      setCalculating(false);
    }
  };

  // Recalcular sempre que o cenário for alterado
  useEffect(() => {
    if (areas.length > 0) {
      runSimulation(turmasSimuladas);
    }
  }, [turmasSimuladas, areas]);

  // Adicionar Turma ao Cenário
  const handleAddTurma = (e: React.FormEvent) => {
    e.preventDefault();
    const areaSelected = areas.find((a) => a.id === novaTurma.areaId);
    const turmaToAdd: TurmaSimulada = {
      id: `sim-${Date.now()}`,
      nome: novaTurma.nome.trim() || `Turma Simulada ${turmasSimuladas.length + 1} (${areaSelected?.nome})`,
      areaId: novaTurma.areaId,
      areaNome: areaSelected?.nome || 'Área Tecnológica',
      tipoCurso: novaTurma.tipoCurso,
      periodo: novaTurma.periodo,
      aulasSemanais: Number(novaTurma.aulasSemanais),
    };

    const updated = [...turmasSimuladas, turmaToAdd];
    setTurmasSimuladas(updated);
    setNovaTurma((prev) => ({ ...prev, nome: '' }));
  };

  // Remover Turma do Cenário
  const handleRemoveTurma = (id: string) => {
    const updated = turmasSimuladas.filter((t) => t.id !== id);
    setTurmasSimuladas(updated);
  };

  // Limpar Cenário
  const handleClearAll = () => {
    setTurmasSimuladas([]);
  };

  // Carregar Cenários Prontos
  const loadPresetTI = () => {
    const tiArea = areas.find((a) => a.nome.toLowerCase().includes('informática') || a.nome.toLowerCase().includes('tecnologia')) || areas[0];
    if (!tiArea) return;

    const preset: TurmaSimulada[] = [
      {
        id: `sim-ti-1`,
        nome: 'Técnico em Desenvolvimento de Sistemas 2027/1 (Noturno)',
        areaId: tiArea.id,
        areaNome: tiArea.nome,
        tipoCurso: 'TECNICO',
        periodo: 'NOITE',
        aulasSemanais: 20,
      },
      {
        id: `sim-ti-2`,
        nome: 'Técnico em Redes de Computadores 2027/1 (Noturno)',
        areaId: tiArea.id,
        areaNome: tiArea.nome,
        tipoCurso: 'TECNICO',
        periodo: 'NOITE',
        aulasSemanais: 20,
      },
    ];
    setTurmasSimuladas(preset);
  };

  const loadPresetGeral = () => {
    if (areas.length === 0) return;
    const preset: TurmaSimulada[] = areas.map((area, idx) => ({
      id: `sim-area-${idx}`,
      nome: `Curso Técnico em ${area.nome} 2027/1`,
      areaId: area.id,
      areaNome: area.nome,
      tipoCurso: 'TECNICO',
      periodo: idx % 2 === 0 ? 'MANHA' : 'NOITE',
      aulasSemanais: 20,
    }));
    setTurmasSimuladas(preset);
  };

  const handlePrint = () => {
    window.print();
  };

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

  // Se perfil não tiver autorização (Docente ou OPP)
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
          O <strong>Simulador de Capacidade & Contratações</strong> é um módulo estratégico exclusivo da <strong>Coordenação</strong> e <strong>Secretaria Administrativa</strong>. Seu perfil atual é <span className="font-bold text-gray-800 dark:text-neutral-200">{userPerfil || 'DOCENTE'}</span>.
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
    <div className="space-y-6 pb-16">
      {/* Header Corporativo SENAI */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 dark:border-neutral-800 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-neutral-100">
              Simulador de Capacidade & Contratações
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-950/60 text-[#e30613] animate-pulse">
              Laboratório Preditivo SENAI
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-neutral-400 mt-1">
            Planeje a abertura de novas turmas para os próximos semestres e calcule em tempo real o déficit de horas e necessidade de contratação.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={handlePrint}
            variant="outline"
            size="sm"
            className="border-gray-300 dark:border-neutral-700 text-gray-700 dark:text-neutral-300 gap-1.5 text-xs font-medium"
          >
            <Printer className="w-3.5 h-3.5 text-[#e30613]" /> Imprimir Diagnóstico
          </Button>
        </div>
      </div>

      {/* 4 KPI Cards Preditivos */}
      {metricas && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Demanda Total Simulada */}
          <div className="bg-white dark:bg-neutral-900 p-5 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider">
                Demanda Total Projetada
              </span>
              <div className="text-2xl font-extrabold text-gray-900 dark:text-neutral-100 mt-1">
                {metricas.demandaTotalGeral}h / sem
              </div>
              <span className="text-[11px] text-gray-500 dark:text-neutral-400 font-medium">
                {metricas.totalTurmasSimuladas} turma(s) no cenário
              </span>
            </div>
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          {/* Horas Supridas pelo Quadro Atual */}
          <div className="bg-white dark:bg-neutral-900 p-5 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider">
                Supridas pelo Quadro Atual
              </span>
              <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                {metricas.horasAtendidasPeloQuadro}h
              </div>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                Horas livres absorvidas pelos professores
              </span>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>

          {/* Déficit de Horas */}
          <div className="bg-white dark:bg-neutral-900 p-5 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider">
                Déficit Semanal
              </span>
              <div className={`text-2xl font-extrabold mt-1 ${
                metricas.deficitHorasGeral > 0 ? 'text-[#e30613]' : 'text-emerald-600'
              }`}>
                {metricas.deficitHorasGeral > 0 ? `-${metricas.deficitHorasGeral}h` : '0h (Atendido)'}
              </div>
              <span className="text-[11px] text-gray-500 dark:text-neutral-400 font-medium">
                {metricas.deficitHorasGeral > 0 ? 'Horas de aula descobertas' : 'Quadro 100% autossuficiente'}
              </span>
            </div>
            <div className={`p-3 rounded-xl ${
              metricas.deficitHorasGeral > 0 
                ? 'bg-red-50 dark:bg-red-950/50 text-[#e30613]' 
                : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600'
            }`}>
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>

          {/* Novos Professores Necessários */}
          <div className="bg-white dark:bg-neutral-900 p-5 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider">
                Contratações Sugeridas
              </span>
              <div className="text-2xl font-extrabold text-purple-600 dark:text-purple-400 mt-1">
                {metricas.novosDocentesRecomendadosGeral > 0 
                  ? `+${metricas.novosDocentesRecomendadosGeral} Docente(s)` 
                  : 'Nenhuma (0)'}
              </div>
              <span className="text-[11px] text-purple-600 dark:text-purple-400 font-medium">
                {metricas.novosDocentesRecomendadosGeral > 0 ? 'Para cobrir o déficit' : 'Sem necessidade imediata'}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </div>
      )}

      {/* Configurador de Cenário Preditivo */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-neutral-800 pb-4">
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-neutral-100 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#e30613]" /> Configuração do Cenário de Turmas
            </h2>
            <p className="text-xs text-gray-500 dark:text-neutral-400 mt-0.5">
              Adicione as turmas planejadas para o próximo semestre para recalcular a capacidade acadêmica instantaneamente.
            </p>
          </div>

          {/* Cenários Rápidos */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] text-gray-400 font-semibold mr-1">Cenários Rápidos:</span>
            <Button
              variant="outline"
              size="sm"
              onClick={loadPresetTI}
              className="text-[11px] h-7 gap-1 border-gray-300 dark:border-neutral-700"
            >
              + 2 Turmas TI Noturno
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={loadPresetGeral}
              className="text-[11px] h-7 gap-1 border-gray-300 dark:border-neutral-700"
            >
              + 1 Turma p/ Cada Área
            </Button>
            {turmasSimuladas.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                className="text-[11px] h-7 text-red-600 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-950/40"
              >
                Limpar Cenário
              </Button>
            )}
          </div>
        </div>

        {/* Formulário de Adição de Turma Simulada */}
        <form onSubmit={handleAddTurma} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5 items-end">
          <div className="lg:col-span-2">
            <Label htmlFor="nome" className="text-xs font-semibold">
              Identificador da Turma Simulada
            </Label>
            <Input
              id="nome"
              placeholder="Ex: Técnico em Automação - 2027/1"
              value={novaTurma.nome}
              onChange={(e) => setNovaTurma({ ...novaTurma, nome: e.target.value })}
              className="mt-1.5 text-xs h-10 rounded-xl"
            />
          </div>

          <div>
            <Label htmlFor="areaId" className="text-xs font-semibold">
              Área Tecnológica
            </Label>
            <div className="mt-1.5">
              <CustomSelect
                value={novaTurma.areaId}
                onChange={(val) => setNovaTurma({ ...novaTurma, areaId: val })}
                icon={Layers}
                options={areas.map((a) => ({ value: a.id, label: a.nome }))}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="periodo" className="text-xs font-semibold">
              Turno das Aulas
            </Label>
            <div className="mt-1.5">
              <CustomSelect
                value={novaTurma.periodo}
                onChange={(val) => setNovaTurma({ ...novaTurma, periodo: val })}
                icon={Clock}
                options={[
                  { value: 'MANHA', label: 'Manhã (07:30 - 11:45)' },
                  { value: 'TARDE', label: 'Tarde (13:15 - 17:30)' },
                  { value: 'NOITE', label: 'Noite (18:45 - 22:45)' },
                  { value: 'INTEGRAL', label: 'Integral (Manhã e Tarde)' },
                ]}
              />
            </div>
          </div>

          <div>
            <Button
              type="submit"
              disabled={areas.length === 0}
              className="w-full bg-[#e30613] hover:bg-[#b7040f] text-white text-xs font-semibold h-10 shadow-2xs gap-1.5"
            >
              <Plus className="w-4 h-4" /> Adicionar Turma
            </Button>
          </div>
        </form>

        {/* Tabela de Turmas no Cenário Atual */}
        {turmasSimuladas.length > 0 && (
          <div className="mt-4 border border-gray-100 dark:border-neutral-800 rounded-xl overflow-hidden">
            <div className="p-3 bg-gray-50 dark:bg-neutral-800/60 font-bold text-xs text-gray-900 dark:text-neutral-100 flex items-center justify-between">
              <span>Turmas Integradas no Cenário ({turmasSimuladas.length})</span>
              <span className="text-[11px] text-gray-400 font-normal">
                Clique na lixeira para remover qualquer turma e recalcular
              </span>
            </div>

            <div className="divide-y divide-gray-100 dark:divide-neutral-800">
              {turmasSimuladas.map((t) => (
                <div
                  key={t.id}
                  className="p-3 text-xs flex items-center justify-between hover:bg-gray-50 dark:hover:bg-neutral-800/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-red-50 dark:bg-red-950/40 text-[#e30613]">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-gray-900 dark:text-neutral-100">{t.nome}</span>
                      <span className="block text-[11px] text-gray-500 dark:text-neutral-400">
                        {t.areaNome} • Turno {t.periodo} • {t.aulasSemanais}h semanais
                      </span>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveTurma(t.id)}
                    className="text-red-600 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-950/40 h-7 w-7 p-0"
                    title="Remover turma da simulação"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Painel de Diagnóstico Estratégico por Área Tecnológica */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 p-6 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-gray-900 dark:text-neutral-100 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-[#e30613]" /> Diagnóstico de Capacidade por Área Tecnológica
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {diagnosticoAreas.map((diag) => (
            <div
              key={diag.areaId}
              className={`p-5 rounded-xl border flex flex-col justify-between space-y-4 transition-all ${
                diag.status === 'DEFICIT'
                  ? 'bg-red-50/40 dark:bg-red-950/20 border-red-200 dark:border-red-900/40 shadow-xs'
                  : diag.status === 'ALERTA'
                  ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40 shadow-xs'
                  : 'bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-800'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-gray-900 dark:text-neutral-100 text-sm">
                    {diag.areaNome}
                  </h3>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      diag.status === 'DEFICIT'
                        ? 'bg-red-100 text-red-800 border-red-300 dark:bg-red-950 dark:text-red-300'
                        : diag.status === 'ALERTA'
                        ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}
                  >
                    {diag.status === 'DEFICIT' && 'Déficit de Horas'}
                    {diag.status === 'ALERTA' && 'Margem Estreita'}
                    {diag.status === 'AUTOSSUFICIENTE' && 'Autossuficiente'}
                  </span>
                </div>

                <div className="mt-3 pt-2 border-t border-gray-100 dark:border-neutral-800/80 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-400 text-[11px] block">Docentes Atuais</span>
                    <span className="font-bold text-gray-800 dark:text-neutral-200">
                      {diag.totalDocentesAtuais} professores
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-[11px] block">Saldo Livre Atual</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {diag.horasLivresAtuais}h disponíveis
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-[11px] block">Demanda Simulada</span>
                    <span className="font-bold text-gray-900 dark:text-neutral-100">
                      {diag.demandaHorasSimulada}h ({diag.turmasSimuladasQtd} turma(s))
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-[11px] block">Saldo Projetado</span>
                    <span className={`font-bold ${diag.saldoFinalHoras < 0 ? 'text-[#e30613]' : 'text-emerald-600'}`}>
                      {diag.saldoFinalHoras}h
                    </span>
                  </div>
                </div>
              </div>

              {/* Recomendação de Contratação */}
              <div className="p-3 rounded-lg bg-white/80 dark:bg-neutral-800/60 border border-gray-100 dark:border-neutral-700 text-[11px] text-gray-700 dark:text-neutral-300 space-y-1">
                <span className="font-bold block text-gray-900 dark:text-neutral-100">
                  Parecer Acadêmico:
                </span>
                <p>{diag.recomendacaoContratacao}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Painel de Recomendações Executivas de RH */}
      {metricas && (
        <div className="bg-gradient-to-r from-neutral-900 to-gray-800 text-white rounded-2xl p-6 shadow-md border border-neutral-700 space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-600/30 text-red-400 border border-red-500/40">
              <TrendingUp className="w-6 h-6 text-[#e30613]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Síntese Executiva de Contratação para a Direção
              </h2>
              <p className="text-xs text-neutral-300">
                Resumo consolidado para aprovação de editais de processo seletivo e contratação de docentes.
              </p>
            </div>
          </div>

          <div className="pt-2 text-xs space-y-1.5 text-neutral-200">
            {metricas.novosDocentesRecomendadosGeral === 0 ? (
              <p className="text-emerald-300 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                Excelente notícia: O cenário planejado de {metricas.totalTurmasSimuladas} nova(s) turma(s) pode ser 100% absorvido pelo quadro docente atual da unidade sem gerar horas extras ou sobrecarga.
              </p>
            ) : (
              <p className="text-amber-300 font-semibold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                Atenção da Gestão: Para viabilizar a oferta das {metricas.totalTurmasSimuladas} turmas planejadas, será necessário autorizar a contratação de aproximadamente {metricas.novosDocentesRecomendadosGeral} novo(s) docente(s) para cobrir o déficit de {metricas.deficitHorasGeral} horas semanais.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
