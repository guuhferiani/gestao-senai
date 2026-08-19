'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { 
  Calendar, 
  Plus, 
  Search, 
  BookOpen, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Edit, 
  Trash2, 
  Layers, 
  GraduationCap, 
  Briefcase,
  LayoutGrid,
  List,
  Eye,
  AlertCircle,
  Sparkles,
  UserCheck,
  CalendarDays,
  Percent,
  CheckSquare,
  Square
} from 'lucide-react';
import { StatCard } from '@/components/dashboard/stat-card';
import { CustomSelect } from '@/components/ui/custom-select';
import { CustomDatePicker } from '@/components/ui/custom-date-picker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';

interface Area {
  id: string;
  nome: string;
  unidadesCurriculares?: { id: string; nome: string }[];
}

interface UsuarioOPP {
  id: string;
  nome: string;
  email: string;
}

interface TurmaItem {
  id: string;
  nome: string;
  areaId: string;
  oppResponsavelId: string | null;
  tipoCurso: string;
  dataInicio: string;
  dataTermino: string;
  aulasSemanais: number;
  totalAulas: number;
  diasSemana: string;
  periodo: string;
  createdAt: string;
  area: {
    id: string;
    nome: string;
  };
  oppResponsavel?: {
    id: string;
    nome: string;
    email: string;
  } | null;
  totalUcs: number;
  ucsAtribuidas: number;
  percentualConclusao: number;
  atribuicoes: {
    id: string;
    ucId: string;
    docenteId: string | null;
    diaSemana: number;
    horario: string;
    uc: {
      id: string;
      nome: string;
    };
    docente?: {
      usuario?: {
        nome: string;
      };
    };
  }[];
}

const DIAS_SEMANA_OPCOES = [
  { id: 'Seg', label: 'Segunda' },
  { id: 'Ter', label: 'Terça' },
  { id: 'Qua', label: 'Quarta' },
  { id: 'Qui', label: 'Quinta' },
  { id: 'Sex', label: 'Sexta' },
  { id: 'Sab', label: 'Sábado' },
];

export default function TurmasPage() {
  const { data: session } = useSession();
  const userPerfil = (session?.user as any)?.perfil || 'DOCENTE';
  const canManageTurmas = userPerfil === 'COORDENADOR' || userPerfil === 'SECRETARIA' || userPerfil === 'OPP';

  const [turmas, setTurmas] = useState<TurmaItem[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [opps, setOpps] = useState<UsuarioOPP[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAreaFilter, setSelectedAreaFilter] = useState('ALL');
  const [selectedTipoCursoFilter, setSelectedTipoCursoFilter] = useState('ALL');
  const [selectedPeriodoFilter, setSelectedPeriodoFilter] = useState('ALL');

  // Modais
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedTurma, setSelectedTurma] = useState<TurmaItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'identificacao' | 'calendario' | 'plano'>('identificacao');

  // Form State
  const [formData, setFormData] = useState({
    nome: '',
    areaId: '',
    oppResponsavelId: '',
    tipoCurso: 'TECNICO',
    dataInicio: '',
    dataTermino: '',
    aulasSemanais: 20,
    totalAulas: 400,
    diasSemana: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'],
    periodo: 'MANHA',
    ucsIds: [] as string[],
  });

  // Carregar dados
  const fetchData = async () => {
    try {
      setLoading(true);
      const [turmasRes, areasRes, cadastroRes] = await Promise.all([
        fetch('/api/turmas'),
        fetch('/api/areas'),
        fetch('/api/cadastro'), // para listar usuários OPPs
      ]);

      if (turmasRes.ok && areasRes.ok) {
        const turmasData = await turmasRes.json();
        const areasData = await areasRes.json();
        setTurmas(turmasData);
        setAreas(areasData);

        if (cadastroRes.ok) {
          const cadastroData = await cadastroRes.json();
          if (Array.isArray(cadastroData)) {
            setOpps(cadastroData.filter((u: any) => u.perfil === 'OPP'));
          }
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Abrir Modal de Criação
  const handleOpenCreate = () => {
    setSelectedTurma(null);
    const defaultAreaId = areas.length > 0 ? areas[0].id : '';
    const defaultArea = areas.find((a) => a.id === defaultAreaId);
    const defaultUcs = defaultArea?.unidadesCurriculares?.map((u) => u.id) || [];

    const hoje = new Date();
    const seisMeses = new Date();
    seisMeses.setMonth(hoje.getMonth() + 6);

    setFormData({
      nome: '',
      areaId: defaultAreaId,
      oppResponsavelId: opps.length > 0 ? opps[0].id : '',
      tipoCurso: 'TECNICO',
      dataInicio: hoje.toISOString().split('T')[0],
      dataTermino: seisMeses.toISOString().split('T')[0],
      aulasSemanais: 20,
      totalAulas: 1200, // Carga horária padrão para curso Técnico no SENAI (1200 horas)
      diasSemana: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'],
      periodo: 'MANHA',
      ucsIds: defaultUcs,
    });
    setActiveTab('identificacao');
    setErrorMessage('');
    setIsModalOpen(true);
  };

  // Abrir Modal de Edição
  const handleOpenEdit = (turma: TurmaItem) => {
    setSelectedTurma(turma);
    const diasArray = turma.diasSemana ? turma.diasSemana.split(',') : ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'];
    const ucsExistentesIds = Array.from(new Set(turma.atribuicoes.map((a) => a.ucId)));

    setFormData({
      nome: turma.nome,
      areaId: turma.areaId,
      oppResponsavelId: turma.oppResponsavelId || '',
      tipoCurso: turma.tipoCurso,
      dataInicio: new Date(turma.dataInicio).toISOString().split('T')[0],
      dataTermino: new Date(turma.dataTermino).toISOString().split('T')[0],
      aulasSemanais: turma.aulasSemanais,
      totalAulas: turma.totalAulas,
      diasSemana: diasArray,
      periodo: turma.periodo,
      ucsIds: ucsExistentesIds,
    });
    setActiveTab('identificacao');
    setErrorMessage('');
    setIsModalOpen(true);
  };

  // Abrir Modal de Detalhes
  const handleOpenDetails = (turma: TurmaItem) => {
    setSelectedTurma(turma);
    setIsDetailsModalOpen(true);
  };

  // Abrir Modal de Exclusão
  const handleOpenDelete = (turma: TurmaItem) => {
    setSelectedTurma(turma);
    setErrorMessage('');
    setIsDeleteModalOpen(true);
  };

  // Troca de Tipo de Curso com sugestão automática de carga horária oficial SENAI
  const handleTipoCursoChange = (novoTipo: string) => {
    let defaultHoras = 1200; // Técnico regular (1200h)
    if (novoTipo === 'CAI') defaultHoras = 800; // Aprendizagem Industrial (800h a 1600h)
    if (novoTipo === 'FIC') defaultHoras = 160; // Formação Inicial & Continuada (160h)

    setFormData((prev) => ({
      ...prev,
      tipoCurso: novoTipo,
      totalAulas: defaultHoras,
    }));
  };

  // Troca de Área Tecnológica no formulário
  const handleAreaChange = (newAreaId: string) => {
    const novaArea = areas.find((a) => a.id === newAreaId);
    const ucsDaArea = novaArea?.unidadesCurriculares?.map((u) => u.id) || [];
    setFormData((prev) => ({
      ...prev,
      areaId: newAreaId,
      ucsIds: ucsDaArea, // Pré-seleciona as UCs da nova área
    }));
  };

  // Toggle de dias da semana com cálculo automático de horas semanais (4h por dia)
  const handleToggleDiaSemana = (diaId: string) => {
    setFormData((prev) => {
      const exists = prev.diasSemana.includes(diaId);
      const updated = exists
        ? prev.diasSemana.filter((d) => d !== diaId)
        : [...prev.diasSemana, diaId];
      
      const horasSemanaisCalculadas = updated.length * 4;
      return { 
        ...prev, 
        diasSemana: updated,
        aulasSemanais: horasSemanaisCalculadas > 0 ? horasSemanaisCalculadas : prev.aulasSemanais,
      };
    });
  };

  // Toggle de UC individual no plano de curso
  const handleToggleUC = (ucId: string) => {
    setFormData((prev) => {
      const exists = prev.ucsIds.includes(ucId);
      const updated = exists
        ? prev.ucsIds.filter((id) => id !== ucId)
        : [...prev.ucsIds, ucId];
      return { ...prev, ucsIds: updated };
    });
  };

  // Toggle de todas as UCs da área
  const handleToggleAllUCs = () => {
    const currentArea = areas.find((a) => a.id === formData.areaId);
    if (!currentArea?.unidadesCurriculares) return;

    const allAreaUcIds = currentArea.unidadesCurriculares.map((u) => u.id);
    const allSelected = allAreaUcIds.every((id) => formData.ucsIds.includes(id));

    setFormData((prev) => ({
      ...prev,
      ucsIds: allSelected ? [] : allAreaUcIds,
    }));
  };

  // Submissão do Formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.nome.trim()) {
      setErrorMessage('O nome da turma é obrigatório.');
      setActiveTab('identificacao');
      return;
    }

    if (!formData.areaId) {
      setErrorMessage('Selecione uma Área Tecnológica.');
      setActiveTab('identificacao');
      return;
    }

    if (!formData.dataInicio || !formData.dataTermino) {
      setErrorMessage('As datas de início e término são obrigatórias.');
      setActiveTab('calendario');
      return;
    }

    if (new Date(formData.dataInicio) >= new Date(formData.dataTermino)) {
      setErrorMessage('A data de término deve ser posterior à data de início.');
      setActiveTab('calendario');
      return;
    }

    if (formData.diasSemana.length === 0) {
      setErrorMessage('Selecione pelo menos um dia letivo na semana.');
      setActiveTab('calendario');
      return;
    }

    try {
      setIsSubmitting(true);
      const url = selectedTurma ? `/api/turmas/${selectedTurma.id}` : '/api/turmas';
      const method = selectedTurma ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Erro ao processar requisição.');
        return;
      }

      setIsModalOpen(false);
      await fetchData();
    } catch (error: any) {
      setErrorMessage(error.message || 'Erro inesperado ao salvar turma.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Exclusão da Turma
  const handleDelete = async () => {
    if (!selectedTurma) return;
    try {
      setIsSubmitting(true);
      setErrorMessage('');

      const res = await fetch(`/api/turmas/${selectedTurma.id}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Erro ao excluir turma.');
        return;
      }

      setIsDeleteModalOpen(false);
      await fetchData();
    } catch (error: any) {
      setErrorMessage(error.message || 'Erro inesperado.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtragem das Turmas
  const filteredTurmas = useMemo(() => {
    return turmas.filter((t) => {
      const matchSearch =
        searchTerm === '' ||
        t.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.area.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.oppResponsavel && t.oppResponsavel.nome.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchArea =
        selectedAreaFilter === 'ALL' || t.areaId === selectedAreaFilter;

      const matchTipoCurso =
        selectedTipoCursoFilter === 'ALL' || t.tipoCurso === selectedTipoCursoFilter;

      const matchPeriodo =
        selectedPeriodoFilter === 'ALL' || t.periodo === selectedPeriodoFilter;

      return matchSearch && matchArea && matchTipoCurso && matchPeriodo;
    });
  }, [turmas, searchTerm, selectedAreaFilter, selectedTipoCursoFilter, selectedPeriodoFilter]);

  // Métricas
  const totalTurmas = turmas.length;
  const totalTecnicos = turmas.filter((t) => t.tipoCurso === 'TECNICO').length;
  const totalCaiFic = turmas.filter((t) => t.tipoCurso === 'CAI' || t.tipoCurso === 'FIC').length;
  const mediaPreenchimento = totalTurmas > 0
    ? Math.round(turmas.reduce((acc, curr) => acc + curr.percentualConclusao, 0) / totalTurmas)
    : 0;

  // Obter UCs da área atualmente selecionada no formulário
  const currentAreaForModal = areas.find((a) => a.id === formData.areaId);
  const ucsDisponiveisNoModal = currentAreaForModal?.unidadesCurriculares || [];

  return (
    <div className="space-y-6 pb-12">
      {/* Header Corporativo SENAI */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 dark:border-neutral-800 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-neutral-100">
              Turmas & Ocupação
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-950/60 text-[#e30613]">
              Programação Acadêmica
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-neutral-400 mt-1">
            Gestão de turmas (Técnico, CAI, FIC), planos de unidades curriculares e acompanhamento da grade semanal.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Alternância de Visualização */}
          <div className="flex items-center bg-gray-100 dark:bg-neutral-800 p-1 rounded-lg border border-gray-200 dark:border-neutral-700">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md transition-all ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-neutral-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-neutral-400 hover:text-gray-900'
              }`}
              title="Visualização em Tabela"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-all ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-neutral-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-neutral-400 hover:text-gray-900'
              }`}
              title="Visualização em Grade/Cards"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          {canManageTurmas && (
            <Button
              onClick={handleOpenCreate}
              className="bg-[#e30613] hover:bg-[#b7040f] text-white gap-2 font-semibold shadow-sm text-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Nova Turma
            </Button>
          )}
        </div>
      </div>

      {/* KPI Cards de Estatísticas */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total de Turmas */}
        <div className="bg-white dark:bg-neutral-900 p-5 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider">
              Total de Turmas
            </span>
            <div className="text-2xl font-extrabold text-gray-900 dark:text-neutral-100 mt-1">
              {totalTurmas}
            </div>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              Programadas na unidade
            </span>
          </div>
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 text-[#e30613]">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        {/* Cursos Técnicos */}
        <div className="bg-white dark:bg-neutral-900 p-5 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider">
              Cursos Técnicos
            </span>
            <div className="text-2xl font-extrabold text-gray-900 dark:text-neutral-100 mt-1">
              {totalTecnicos}
            </div>
            <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">
              Formação Técnica Regular
            </span>
          </div>
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
            <GraduationCap className="w-6 h-6" />
          </div>
        </div>

        {/* Aprendizagem CAI & FIC */}
        <div className="bg-white dark:bg-neutral-900 p-5 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider">
              CAI & Qualificação (FIC)
            </span>
            <div className="text-2xl font-extrabold text-gray-900 dark:text-neutral-100 mt-1">
              {totalCaiFic}
            </div>
            <span className="text-[11px] text-purple-600 dark:text-purple-400 font-medium">
              Aprendizagem e Curta Duração
            </span>
          </div>
          <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
            <Briefcase className="w-6 h-6" />
          </div>
        </div>

        {/* Preenchimento Médio da Grade */}
        <div className="bg-white dark:bg-neutral-900 p-5 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider">
              Preenchimento da Grade
            </span>
            <div className="text-2xl font-extrabold text-gray-900 dark:text-neutral-100 mt-1">
              {mediaPreenchimento}%
            </div>
            <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
              Aulas com docentes alocados
            </span>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
            <Percent className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* BARRA DE BUSCA E FILTROS DINÂMICOS COM DROPDOWNS CUSTOMIZADOS E ELEGANTES */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-neutral-900 p-4 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          
          {/* Busca textual */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-neutral-500 pointer-events-none" />
            <Input
              type="text"
              placeholder="Buscar por turma, área ou OPP..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 text-xs h-10 rounded-xl bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-800 focus-visible:ring-2 focus-visible:ring-red-500/20 focus-visible:border-[#e30613]"
            />
          </div>

          {/* Filtro por Área Tecnológica Dropdown */}
          <div className="w-full">
            <CustomSelect
              value={selectedAreaFilter}
              onChange={setSelectedAreaFilter}
              icon={Layers}
              options={[
                { value: 'ALL', label: 'Todas as Áreas Tecnológicas' },
                ...areas.map((area) => ({ value: area.id, label: area.nome })),
              ]}
            />
          </div>

          {/* Filtro por Tipo de Curso Dropdown */}
          <div className="w-full">
            <CustomSelect
              value={selectedTipoCursoFilter}
              onChange={setSelectedTipoCursoFilter}
              icon={GraduationCap}
              options={[
                { value: 'ALL', label: 'Todos os Tipos de Curso' },
                { value: 'TECNICO', label: 'Cursos Técnicos' },
                { value: 'CAI', label: 'Aprendizagem Industrial (CAI)' },
                { value: 'FIC', label: 'Formação Inicial & Continuada (FIC)' },
              ]}
            />
          </div>

          {/* Filtro por Período Dropdown */}
          <div className="w-full">
            <CustomSelect
              value={selectedPeriodoFilter}
              onChange={setSelectedPeriodoFilter}
              icon={Clock}
              options={[
                { value: 'ALL', label: 'Todos os Períodos' },
                { value: 'MANHA', label: 'Manhã' },
                { value: 'TARDE', label: 'Tarde' },
                { value: 'NOITE', label: 'Noite' },
                { value: 'INTEGRAL', label: 'Integral' },
              ]}
            />
          </div>

        </div>
      </div>

      {/* Conteúdo Principal: Tabela ou Cards */}
      {loading ? (
        <div className="bg-white dark:bg-neutral-900 rounded-xl p-12 text-center border border-gray-200 dark:border-neutral-800">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-red-600 border-t-transparent mb-3" />
          <p className="text-sm text-gray-500 dark:text-neutral-400 font-medium">Carregando turmas cadastradas...</p>
        </div>
      ) : filteredTurmas.length === 0 ? (
        <div className="bg-white dark:bg-neutral-900 rounded-xl p-12 text-center border border-gray-200 dark:border-neutral-800 space-y-3">
          <Calendar className="w-12 h-12 mx-auto text-gray-300 dark:text-neutral-700" />
          <p className="text-base font-bold text-gray-800 dark:text-neutral-200">
            Nenhuma turma encontrada
          </p>
          <p className="text-xs text-gray-500 dark:text-neutral-400 max-w-md mx-auto">
            {searchTerm || selectedAreaFilter !== 'ALL' || selectedTipoCursoFilter !== 'ALL' || selectedPeriodoFilter !== 'ALL'
              ? 'Tente ajustar os filtros ou a busca para localizar a turma desejada.'
              : 'Clique em "+ Nova Turma" para cadastrar a primeira turma da unidade.'}
          </p>
          {turmas.length === 0 && (
            <Button
              onClick={handleOpenCreate}
              className="bg-[#e30613] hover:bg-[#b7040f] text-white text-xs font-semibold mt-2"
            >
              <Plus className="w-4 h-4 mr-1.5" /> Criar Primeira Turma
            </Button>
          )}
        </div>
      ) : viewMode === 'table' ? (
        /* VISÃO EM TABELA CORPORATIVA */
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-gray-50 dark:bg-neutral-800/60 text-gray-500 dark:text-neutral-400 font-semibold border-b border-gray-200 dark:border-neutral-800 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-6 py-3.5">Nome da Turma</th>
                  <th className="px-6 py-3.5">Área Tecnológica</th>
                  <th className="px-6 py-3.5">Tipo & Período</th>
                  <th className="px-6 py-3.5">OPP Responsável</th>
                  <th className="px-6 py-3.5">Vigência (Datas)</th>
                  <th className="px-6 py-3.5">Grade (UCs)</th>
                  <th className="px-6 py-3.5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-neutral-800 font-medium">
                {filteredTurmas.map((turma) => (
                  <tr
                    key={turma.id}
                    className="hover:bg-gray-50/80 dark:hover:bg-neutral-800/40 transition-colors"
                  >
                    {/* Nome da Turma */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-red-100 dark:bg-red-950/60 text-[#e30613] font-bold flex items-center justify-center text-xs shrink-0">
                          <CalendarDays className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 dark:text-neutral-100 text-sm">
                            {turma.nome}
                          </div>
                          <div className="text-gray-500 dark:text-neutral-400 text-xs">
                            {turma.diasSemana} • {turma.aulasSemanais}h/sem
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Área Tecnológica */}
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/40">
                        {turma.area.nome}
                      </span>
                    </td>

                    {/* Tipo e Período */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-neutral-300">
                          {turma.tipoCurso}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          turma.periodo === 'MANHA'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300'
                            : turma.periodo === 'TARDE'
                            ? 'bg-orange-100 text-orange-800 dark:bg-orange-950/50 dark:text-orange-300'
                            : turma.periodo === 'NOITE'
                            ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-300'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                        }`}>
                          {turma.periodo}
                        </span>
                      </div>
                    </td>

                    {/* OPP Responsável */}
                    <td className="px-6 py-4">
                      {turma.oppResponsavel ? (
                        <div className="flex items-center gap-1.5 text-gray-800 dark:text-neutral-200">
                          <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-xs font-medium">{turma.oppResponsavel.nome}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400 dark:text-neutral-500 italic text-[11px]">
                          Não designado
                        </span>
                      )}
                    </td>

                    {/* Datas Início e Término */}
                    <td className="px-6 py-4">
                      <div className="text-gray-800 dark:text-neutral-200 text-xs">
                        {new Date(turma.dataInicio).toLocaleDateString('pt-BR')} a{' '}
                        {new Date(turma.dataTermino).toLocaleDateString('pt-BR')}
                      </div>
                      <div className="text-gray-400 text-[10px]">
                        Carga total: {turma.totalAulas} horas
                      </div>
                    </td>

                    {/* Grade e UCs */}
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-gray-700 dark:text-neutral-300">
                            {turma.totalUcs} UCs vinculadas
                          </span>
                          <span className="text-gray-500 dark:text-neutral-400">
                            {turma.percentualConclusao}%
                          </span>
                        </div>
                        <div className="w-24 bg-gray-200 dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-[#e30613] h-full transition-all"
                            style={{ width: `${turma.percentualConclusao}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Ações */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenDetails(turma)}
                          className="p-1.5 text-gray-500 hover:text-gray-900 dark:hover:text-neutral-100 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-md transition-colors"
                          title="Ver Grade Completa"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {canManageTurmas && (
                          <>
                            <button
                              onClick={() => handleOpenEdit(turma)}
                              className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-md transition-colors cursor-pointer"
                              title="Editar Turma"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleOpenDelete(turma)}
                              className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-md transition-colors cursor-pointer"
                              title="Excluir Turma"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* VISÃO EM CARDS / GRADE */
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTurmas.map((turma) => (
            <div
              key={turma.id}
              className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm p-5 flex flex-col justify-between hover:shadow-md transition-shadow relative"
            >
              <div>
                {/* Header Card */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950/60 text-[#e30613] font-bold flex items-center justify-center shrink-0">
                      <CalendarDays className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-neutral-100 text-sm">
                        {turma.nome}
                      </h3>
                      <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                        {turma.area.nome}
                      </span>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    turma.periodo === 'MANHA'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300'
                      : turma.periodo === 'TARDE'
                      ? 'bg-orange-100 text-orange-800 dark:bg-orange-950/50 dark:text-orange-300'
                      : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-300'
                  }`}>
                    {turma.periodo}
                  </span>
                </div>

                {/* Info Grid */}
                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-neutral-800/80 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-400 text-[11px] block">Tipo de Curso</span>
                    <span className="font-semibold text-gray-800 dark:text-neutral-200">
                      {turma.tipoCurso}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-[11px] block">Carga Horária</span>
                    <span className="font-semibold text-gray-800 dark:text-neutral-200">
                      {turma.aulasSemanais}h/sem • {turma.totalAulas}h
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-400 text-[11px] block">Vigência</span>
                    <span className="font-medium text-gray-700 dark:text-neutral-300">
                      {new Date(turma.dataInicio).toLocaleDateString('pt-BR')} a{' '}
                      {new Date(turma.dataTermino).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>

                {/* Barra de Progresso de Atribuições */}
                <div className="mt-3.5 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-gray-500 dark:text-neutral-400">
                      Progresso da Grade ({turma.totalUcs} UCs)
                    </span>
                    <span className="font-bold text-[#e30613]">
                      {turma.percentualConclusao}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#e30613] h-full transition-all duration-300"
                      style={{ width: `${turma.percentualConclusao}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Rodapé do Card */}
              <div className="mt-5 pt-3 border-t border-gray-100 dark:border-neutral-800 flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenDetails(turma)}
                  className="text-xs h-7 gap-1"
                >
                  <Eye className="w-3.5 h-3.5" /> Grade & UCs
                </Button>
                {canManageTurmas && (
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenEdit(turma)}
                      className="text-blue-600 h-7 w-7 p-0 cursor-pointer"
                      title="Editar"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenDelete(turma)}
                      className="text-red-600 h-7 w-7 p-0 cursor-pointer"
                      title="Excluir"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL DE CADASTRO E EDIÇÃO DE TURMA AMPLO (max-w-5xl) */}
      {/* ========================================================================= */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-3xl md:max-w-4xl lg:max-w-5xl w-[95vw] min-h-[640px] md:min-h-[720px] max-h-[96vh] overflow-y-auto p-6 md:p-8 flex flex-col justify-between">
          <DialogHeader className="border-b border-gray-200 dark:border-neutral-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/50 text-[#e30613]">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-gray-900 dark:text-neutral-100">
                  {selectedTurma ? 'Editar Turma' : 'Cadastrar Nova Turma'}
                </DialogTitle>
                <DialogDescription className="text-xs text-gray-500 dark:text-neutral-400 mt-0.5">
                  Configure os dados da turma, calendário letivo e selecione o plano de Unidades Curriculares (UCs).
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Abas do Formulário */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 pb-3 border-b border-gray-200 dark:border-neutral-800 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('identificacao')}
              className={`px-4 py-2.5 rounded-lg transition-all text-center flex items-center justify-center gap-2 border ${
                activeTab === 'identificacao'
                  ? 'bg-red-50 dark:bg-red-950/60 text-[#e30613] font-bold border-red-300 dark:border-red-800 shadow-sm'
                  : 'bg-gray-50 dark:bg-neutral-800/60 text-gray-600 dark:text-neutral-400 border-gray-200 dark:border-neutral-700 hover:bg-gray-100'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-red-100 dark:bg-red-900 text-[#e30613] text-[11px] font-bold flex items-center justify-center">1</span>
              <span>Identificação & Segmento</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('calendario')}
              className={`px-4 py-2.5 rounded-lg transition-all text-center flex items-center justify-center gap-2 border ${
                activeTab === 'calendario'
                  ? 'bg-red-50 dark:bg-red-950/60 text-[#e30613] font-bold border-red-300 dark:border-red-800 shadow-sm'
                  : 'bg-gray-50 dark:bg-neutral-800/60 text-gray-600 dark:text-neutral-400 border-gray-200 dark:border-neutral-700 hover:bg-gray-100'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-red-100 dark:bg-red-900 text-[#e30613] text-[11px] font-bold flex items-center justify-center">2</span>
              <span>Calendário & Horários</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('plano')}
              className={`px-4 py-2.5 rounded-lg transition-all text-center flex items-center justify-center gap-2 border ${
                activeTab === 'plano'
                  ? 'bg-red-50 dark:bg-red-950/60 text-[#e30613] font-bold border-red-300 dark:border-red-800 shadow-sm'
                  : 'bg-gray-50 dark:bg-neutral-800/60 text-gray-600 dark:text-neutral-400 border-gray-200 dark:border-neutral-700 hover:bg-gray-100'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-red-100 dark:bg-red-900 text-[#e30613] text-[11px] font-bold flex items-center justify-center">3</span>
              <span>Plano Curricular (UCs)</span>
            </button>
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col justify-between flex-1 min-h-[480px] space-y-6 pt-2">
            {/* ABA 1: Identificação & Segmento */}
            {activeTab === 'identificacao' && (
              <div className="space-y-5">
                <div>
                  <Label htmlFor="nomeTurma" className="text-xs font-semibold">
                    Nome / Identificador da Turma <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="nomeTurma"
                    placeholder="Ex: Técnico em Desenvolvimento de Sistemas - 2026/1"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    required
                    className="mt-1.5 text-xs h-10 rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Área Tecnológica */}
                  <div>
                    <Label htmlFor="areaId" className="text-xs font-semibold">
                      Área Tecnológica <span className="text-red-500">*</span>
                    </Label>
                    <div className="mt-1.5">
                    <CustomSelect
                        value={formData.areaId}
                        onChange={handleAreaChange}
                        icon={Layers}
                        placeholder="Selecione uma área..."
                        options={areas.map((a) => ({ value: a.id, label: a.nome }))}
                      />
                    </div>
                  </div>

                  {/* Tipo de Curso */}
                  <div>
                    <Label htmlFor="tipoCurso" className="text-xs font-semibold">
                      Tipo do Curso <span className="text-red-500">*</span>
                    </Label>
                    <div className="mt-1.5">
                      <CustomSelect
                        value={formData.tipoCurso}
                        onChange={handleTipoCursoChange}
                        icon={GraduationCap}
                        options={[
                          { value: 'TECNICO', label: 'Habilitação Técnica (1200h padrão)' },
                          { value: 'CAI', label: 'Aprendizagem Industrial - CAI (800h padrão)' },
                          { value: 'FIC', label: 'Formação Inicial & Continuada - FIC (160h padrão)' },
                        ]}
                      />
                    </div>
                  </div>

                  {/* OPP Responsável */}
                  <div>
                    <Label htmlFor="oppResponsavel" className="text-xs font-semibold">
                      Orientador (OPP) Responsável
                    </Label>
                    <div className="mt-1.5">
                      <CustomSelect
                        value={formData.oppResponsavelId}
                        onChange={(val) => setFormData({ ...formData, oppResponsavelId: val })}
                        icon={UserCheck}
                        placeholder="Nenhum / A definir"
                        options={[
                          { value: '', label: 'Nenhum / A definir' },
                          ...opps.map((opp) => ({
                            value: opp.id,
                            label: `${opp.nome} (${opp.email})`,
                          })),
                        ]}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ABA 2: Calendário & Horários */}
            {activeTab === 'calendario' && (
              <div className="space-y-6 pb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="dataInicio" className="text-xs font-semibold">
                      Data de Início <span className="text-red-500">*</span>
                    </Label>
                    <div className="mt-1.5">
                      <CustomDatePicker
                        value={formData.dataInicio}
                        onChange={(val) => setFormData({ ...formData, dataInicio: val })}
                        placeholder="Selecione início..."
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="dataTermino" className="text-xs font-semibold">
                      Data de Término <span className="text-red-500">*</span>
                    </Label>
                    <div className="mt-1.5">
                      <CustomDatePicker
                        value={formData.dataTermino}
                        onChange={(val) => setFormData({ ...formData, dataTermino: val })}
                        placeholder="Selecione término..."
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="aulasSemanais" className="text-xs font-semibold">
                      Carga Horária Semanal (Horas)
                    </Label>
                    <Input
                      id="aulasSemanais"
                      type="number"
                      min={1}
                      max={60}
                      value={formData.aulasSemanais}
                      onChange={(e) => setFormData({ ...formData, aulasSemanais: Number(e.target.value) })}
                      required
                      className="mt-1.5 text-xs h-10 rounded-xl"
                    />
                    <span className="text-[10px] text-gray-400 mt-1 block">
                      Calculado pelos dias (ex: 5 dias = 20h)
                    </span>
                  </div>

                  <div>
                    <Label htmlFor="totalAulas" className="text-xs font-semibold">
                      Carga Horária Total do Curso (Horas)
                    </Label>
                    <Input
                      id="totalAulas"
                      type="number"
                      min={10}
                      max={4000}
                      value={formData.totalAulas}
                      onChange={(e) => setFormData({ ...formData, totalAulas: Number(e.target.value) })}
                      required
                      className="mt-1.5 text-xs h-10 rounded-xl"
                    />
                    <span className="text-[10px] text-gray-400 mt-1 block">
                      Total de horas da matriz do curso
                    </span>
                  </div>

                  {/* Banner Explicativo de Carga Horária SENAI */}
                  <div className="sm:col-span-2 md:col-span-4 p-3 bg-red-50/60 dark:bg-red-950/30 border border-red-200/80 dark:border-red-900/40 rounded-xl flex items-center justify-between text-xs text-[#e30613] dark:text-red-300">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 shrink-0" />
                      <span>
                        <strong>Carga Programada:</strong> ~{formData.aulasSemanais}h semanais ({formData.diasSemana.length} dias letivos × 4h/dia) • Total do curso: <strong>{formData.totalAulas} horas</strong>
                      </span>
                    </div>
                    <span className="text-[11px] font-semibold text-gray-500 dark:text-neutral-400">
                      Padrão Oficial SENAI
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Período / Turno */}
                  <div>
                    <Label className="text-xs font-semibold block mb-2">
                      Período de Realização das Aulas <span className="text-red-500">*</span>
                    </Label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      {['MANHA', 'TARDE', 'NOITE', 'INTEGRAL'].map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setFormData({ ...formData, periodo: p })}
                          className={`p-3 rounded-xl border text-center font-bold transition-all ${
                            formData.periodo === p
                              ? 'bg-[#e30613] text-white border-[#e30613] shadow-sm'
                              : 'bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-800 text-gray-700 dark:text-neutral-300 hover:bg-gray-50'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Dias da semana letivos */}
                  <div>
                    <Label className="text-xs font-semibold block mb-2">
                      Dias Letivos da Semana <span className="text-red-500">*</span>
                    </Label>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 text-xs">
                      {DIAS_SEMANA_OPCOES.map((d) => {
                        const isSelected = formData.diasSemana.includes(d.id);
                        return (
                          <button
                            key={d.id}
                            type="button"
                            onClick={() => handleToggleDiaSemana(d.id)}
                            className={`p-2.5 rounded-xl border text-center font-bold transition-all ${
                              isSelected
                                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                                : 'bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-800 text-gray-700 dark:text-neutral-300 hover:bg-gray-50'
                            }`}
                          >
                            {d.id}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ABA 3: Plano Curricular (UCs) */}
            {activeTab === 'plano' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-gray-200 dark:border-neutral-800 pb-2.5">
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 dark:text-neutral-100">
                      Unidades Curriculares do Plano de Curso
                    </h4>
                    <p className="text-[11px] text-gray-500 dark:text-neutral-400">
                      Selecione as UCs da Área Tecnológica que farão parte da grade desta turma.
                    </p>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleToggleAllUCs}
                    className="text-xs h-8 border-gray-200 dark:border-neutral-700"
                  >
                    Alternar Todas
                  </Button>
                </div>

                {ucsDisponiveisNoModal.length === 0 ? (
                  <div className="p-8 text-center bg-gray-50 dark:bg-neutral-800/40 rounded-xl border border-dashed border-gray-200 dark:border-neutral-800">
                    <p className="text-xs text-gray-500">
                      Nenhuma Unidade Curricular cadastrada para esta Área Tecnológica.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto pr-1">
                    {ucsDisponiveisNoModal.map((uc) => {
                      const isSelected = formData.ucsIds.includes(uc.id);
                      return (
                        <label
                          key={uc.id}
                          className={`flex items-center gap-2.5 p-3 rounded-xl border transition-all text-xs font-medium cursor-pointer ${
                            isSelected
                              ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-300 dark:border-purple-800 text-purple-900 dark:text-purple-200 font-semibold'
                              : 'bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-800 text-gray-700 dark:text-neutral-300 hover:bg-gray-50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleUC(uc.id)}
                            className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 shrink-0"
                          />
                          <span className="truncate" title={uc.nome}>{uc.nome}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            <DialogFooter className="pt-4 border-t border-gray-200 dark:border-neutral-800 flex items-center justify-between gap-3">
              <div>
                {activeTab === 'identificacao' ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsModalOpen(false)}
                    className="text-xs"
                  >
                    Cancelar
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setActiveTab(activeTab === 'plano' ? 'calendario' : 'identificacao');
                    }}
                    className="text-xs flex items-center gap-1.5"
                  >
                    &larr; Voltar
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-2">
                {activeTab !== 'plano' ? (
                  <Button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (activeTab === 'identificacao') {
                        if (!formData.nome.trim()) {
                          setErrorMessage('O nome da turma é obrigatório.');
                          return;
                        }
                        if (!formData.areaId) {
                          setErrorMessage('Selecione uma Área Tecnológica.');
                          return;
                        }
                        setErrorMessage('');
                        setActiveTab('calendario');
                      } else if (activeTab === 'calendario') {
                        if (!formData.dataInicio || !formData.dataTermino) {
                          setErrorMessage('As datas de início e término são obrigatórias.');
                          return;
                        }
                        if (new Date(formData.dataInicio) >= new Date(formData.dataTermino)) {
                          setErrorMessage('A data de término deve ser posterior à data de início.');
                          return;
                        }
                        if (formData.diasSemana.length === 0) {
                          setErrorMessage('Selecione pelo menos um dia letivo.');
                          return;
                        }
                        setErrorMessage('');
                        setActiveTab('plano');
                      }
                    }}
                    className="bg-gray-800 hover:bg-gray-900 text-white text-xs font-semibold gap-1.5"
                  >
                    Próximo Passo &rarr;
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-[#e30613] hover:bg-[#b7040f] text-white text-xs font-semibold px-6 shadow-sm"
                  >
                    {isSubmitting
                      ? 'Salvando...'
                      : selectedTurma
                      ? 'Salvar Alterações'
                      : 'Cadastrar Turma'}
                  </Button>
                )}
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL DE DETALHES COMPLETOS DA TURMA E GRADE DE UCS */}
      {/* ========================================================================= */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="sm:max-w-2xl md:max-w-3xl lg:max-w-4xl w-[95vw] p-6 md:p-8">
          <DialogHeader className="border-b border-gray-200 dark:border-neutral-800 pb-3">
            <DialogTitle className="text-lg font-bold flex items-center gap-2 text-gray-900 dark:text-neutral-100">
              <CalendarDays className="w-5 h-5 text-[#e30613]" />
              Grade Curricular: {selectedTurma?.nome}
            </DialogTitle>
          </DialogHeader>

          {selectedTurma && (
            <div className="space-y-5 text-xs pt-2">
              {/* Header Card */}
              <div className="bg-gray-50 dark:bg-neutral-800/40 p-5 rounded-2xl border border-gray-200 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
                    {selectedTurma.area.nome} • {selectedTurma.tipoCurso}
                  </span>
                  <h4 className="text-base font-bold text-gray-900 dark:text-neutral-100 mt-1">
                    {selectedTurma.nome}
                  </h4>
                  <p className="text-gray-500 dark:text-neutral-400 mt-0.5">
                    {selectedTurma.diasSemana} • Turno {selectedTurma.periodo} • {selectedTurma.aulasSemanais}h semanais
                  </p>
                </div>

                <div className="text-right sm:border-l sm:border-gray-200 sm:dark:border-neutral-700 sm:pl-4">
                  <span className="text-gray-400 block text-[11px]">Vigência</span>
                  <span className="font-bold text-gray-900 dark:text-neutral-100">
                    {new Date(selectedTurma.dataInicio).toLocaleDateString('pt-BR')} a{' '}
                    {new Date(selectedTurma.dataTermino).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>

              {/* Lista de UCs do Curso e Status de Atribuição */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-bold text-xs text-gray-900 dark:text-neutral-100">
                    Unidades Curriculares do Curso ({selectedTurma.atribuicoes.length} slots)
                  </h5>
                  <span className="text-[11px] font-semibold text-[#e30613]">
                    {selectedTurma.percentualConclusao}% Concluído
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-64 overflow-y-auto pr-1">
                  {selectedTurma.atribuicoes.map((atrib, idx) => (
                    <div
                      key={atrib.id || idx}
                      className="bg-white dark:bg-neutral-900 p-3 rounded-xl border border-gray-200 dark:border-neutral-800 flex items-center justify-between gap-3 shadow-2xs"
                    >
                      <div className="truncate">
                        <div className="font-bold text-gray-900 dark:text-neutral-100 truncate text-xs">
                          {atrib.uc.nome}
                        </div>
                        <div className="text-[11px] text-gray-500 dark:text-neutral-400">
                          Horário: {atrib.horario}
                        </div>
                      </div>

                      <div>
                        {atrib.docente ? (
                          <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300/60 dark:bg-emerald-950/40 dark:text-emerald-300">
                            ✓ {atrib.docente.usuario?.nome || 'Docente Atribuído'}
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-300/60 dark:bg-amber-950/40 dark:text-amber-300">
                            ⏳ Pendente
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="pt-3 border-t border-gray-200 dark:border-neutral-800">
            <Button
              variant="outline"
              onClick={() => setIsDetailsModalOpen(false)}
              className="text-xs"
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO */}
      {/* ========================================================================= */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-red-600 flex items-center gap-2">
              <Trash2 className="w-5 h-5" /> Excluir Turma
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              Tem certeza que deseja excluir a turma{' '}
              <strong className="text-gray-900 dark:text-neutral-100">
                {selectedTurma?.nome}
              </strong>
              ?
            </DialogDescription>
          </DialogHeader>

          {errorMessage && (
            <div className="p-3 rounded-lg bg-red-50 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <p className="text-xs text-gray-500">
            Esta ação removerá a turma e todos os slots de atribuições associados a ela no banco de dados.
          </p>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
              className="text-xs"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleDelete}
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold"
            >
              {isSubmitting ? 'Excluindo...' : 'Confirmar Exclusão'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
