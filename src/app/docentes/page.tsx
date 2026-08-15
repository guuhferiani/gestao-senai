'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  Users, 
  Plus, 
  Search, 
  BookOpen, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Edit, 
  Trash2, 
  Filter, 
  Layers, 
  GraduationCap, 
  Sparkles, 
  Sun, 
  Sunset, 
  Moon, 
  Briefcase,
  LayoutGrid,
  List,
  Eye,
  AlertCircle,
  CalendarDays
} from 'lucide-react';
import { StatCard } from '@/components/dashboard/stat-card';
import { CustomSelect } from '@/components/ui/custom-select';
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

interface UC {
  id: string;
  nome: string;
  areaId: string;
  area?: { id: string; nome: string };
}

interface DocenteItem {
  id: string;
  usuarioId: string;
  cargaHorariaContratada: number;
  tipoContratacao: string;
  observacoes: string | null;
  dispManha: boolean;
  dispTarde: boolean;
  dispNoite: boolean;
  dispIntegral: boolean;
  dispHorarios?: string | null;
  createdAt: string;
  usuario: {
    id: string;
    nome: string;
    email: string;
    perfil: string;
    ativo: boolean;
  };
  areas: {
    area: {
      id: string;
      nome: string;
    };
  }[];
  competencias: {
    uc: {
      id: string;
      nome: string;
      areaId: string;
    };
  }[];
  atribuicoes?: any[];
}

export interface BlocoHorario {
  id: string;
  turno: 'MANHA' | 'TARDE' | 'NOITE';
  bloco: string;
  horario: string;
  duracao: string;
  intervaloApos?: string;
  destaque?: string;
}

export const BLOCOS_HORARIOS_SENAI: BlocoHorario[] = [
  // Manhã (07:30 às 11:45)
  { id: 'M1', turno: 'MANHA', bloco: '1ª Aula', horario: '07:30 – 08:15', duracao: '45 min' },
  { id: 'M2', turno: 'MANHA', bloco: '2ª Aula', horario: '08:15 – 09:00', duracao: '45 min' },
  { id: 'M3', turno: 'MANHA', bloco: '3ª Aula', horario: '09:00 – 09:45', duracao: '45 min', intervaloApos: '☕ Intervalo: 09:45 – 10:15 (30 min)' },
  { id: 'M4', turno: 'MANHA', bloco: '4ª Aula', horario: '10:15 – 11:00', duracao: '45 min' },
  { id: 'M5', turno: 'MANHA', bloco: '5ª Aula', horario: '11:00 – 11:45', duracao: '45 min' },

  // Tarde (13:15 às 17:30)
  { id: 'T1', turno: 'TARDE', bloco: '1ª Aula', horario: '13:15 – 14:00', duracao: '45 min' },
  { id: 'T2', turno: 'TARDE', bloco: '2ª Aula', horario: '14:00 – 14:45', duracao: '45 min' },
  { id: 'T3', turno: 'TARDE', bloco: '3ª Aula', horario: '14:45 – 15:30', duracao: '45 min', intervaloApos: '☕ Intervalo: 15:30 – 16:00 (30 min)' },
  { id: 'T4', turno: 'TARDE', bloco: '4ª Aula', horario: '16:00 – 16:45', duracao: '45 min' },
  { id: 'T5', turno: 'TARDE', bloco: '5ª Aula', horario: '16:45 – 17:30', duracao: '45 min' },

  // Noite (18:45 às 22:30 / ou até 21h30)
  { id: 'N1', turno: 'NOITE', bloco: '1ª Aula', horario: '18:45 – 19:30', duracao: '45 min' },
  { id: 'N2', turno: 'NOITE', bloco: '2ª Aula', horario: '19:30 – 20:15', duracao: '45 min' },
  { id: 'N3', turno: 'NOITE', bloco: '3ª Aula', horario: '20:15 – 21:00', duracao: '45 min', destaque: 'Saída 21h00', intervaloApos: '☕ Intervalo: 21:00 – 21:15 (15 min)' },
  { id: 'N4', turno: 'NOITE', bloco: '4ª Aula', horario: '21:15 – 22:00', duracao: '45 min', destaque: 'Até 21h30' },
  { id: 'N5', turno: 'NOITE', bloco: '5ª Aula', horario: '21:45 – 22:30', duracao: '45 min', destaque: 'Término 22h30' },
];

export const TODOS_BLOCOS_IDS = BLOCOS_HORARIOS_SENAI.map((b) => b.id);

export default function DocentesPage() {
  const [docentes, setDocentes] = useState<DocenteItem[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAreaFilter, setSelectedAreaFilter] = useState('ALL');
  const [selectedTurnoFilter, setSelectedTurnoFilter] = useState('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');

  // Modal Estado
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedDocente, setSelectedDocente] = useState<DocenteItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'info' | 'contrato' | 'competencias'>('info');

  // Form State
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    ativo: true,
    cargaHorariaContratada: 40,
    tipoContratacao: 'CLT 40h',
    observacoes: '',
    dispManha: true,
    dispTarde: true,
    dispNoite: false,
    dispIntegral: false,
    dispHorarios: ['M1', 'M2', 'M3', 'M4', 'M5', 'T1', 'T2', 'T3', 'T4', 'T5'] as string[],
    areasIds: [] as string[],
    competenciasIds: [] as string[],
  });

  // Carregar dados iniciais
  const fetchData = async () => {
    try {
      setLoading(true);
      const [docentesRes, areasRes] = await Promise.all([
        fetch('/api/docentes'),
        fetch('/api/areas'),
      ]);

      if (docentesRes.ok && areasRes.ok) {
        const docentesData = await docentesRes.json();
        const areasData = await areasRes.json();
        setDocentes(docentesData);
        setAreas(areasData);
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
    setSelectedDocente(null);
    setFormData({
      nome: '',
      email: '',
      senha: '',
      ativo: true,
      cargaHorariaContratada: 40,
      tipoContratacao: 'CLT 40h',
      observacoes: '',
      dispManha: true,
      dispTarde: true,
      dispNoite: false,
      dispIntegral: false,
      dispHorarios: ['M1', 'M2', 'M3', 'M4', 'M5', 'T1', 'T2', 'T3', 'T4', 'T5'],
      areasIds: areas.length > 0 ? [areas[0].id] : [],
      competenciasIds: [],
    });
    setActiveTab('info');
    setErrorMessage('');
    setIsModalOpen(true);
  };

  // Abrir Modal de Edição
  const handleOpenEdit = (docente: DocenteItem) => {
    setSelectedDocente(docente);

    let parsedHorarios: string[] = [];
    if (docente.dispHorarios) {
      try {
        parsedHorarios = JSON.parse(docente.dispHorarios);
      } catch (e) {
        console.error('Erro ao fazer parse de dispHorarios:', e);
      }
    }

    if (!parsedHorarios || parsedHorarios.length === 0) {
      if (docente.dispIntegral) {
        parsedHorarios = [...TODOS_BLOCOS_IDS];
      } else {
        if (docente.dispManha) parsedHorarios.push('M1', 'M2', 'M3', 'M4', 'M5');
        if (docente.dispTarde) parsedHorarios.push('T1', 'T2', 'T3', 'T4', 'T5');
        if (docente.dispNoite) parsedHorarios.push('N1', 'N2', 'N3', 'N4', 'N5');
      }
    }

    const hasManha = parsedHorarios.some((h) => h.startsWith('M'));
    const hasTarde = parsedHorarios.some((h) => h.startsWith('T'));
    const hasNoite = parsedHorarios.some((h) => h.startsWith('N'));

    setFormData({
      nome: docente.usuario.nome,
      email: docente.usuario.email,
      senha: '', // Opcional na edição
      ativo: docente.usuario.ativo,
      cargaHorariaContratada: docente.cargaHorariaContratada,
      tipoContratacao: docente.tipoContratacao,
      observacoes: docente.observacoes || '',
      dispManha: hasManha,
      dispTarde: hasTarde,
      dispNoite: hasNoite,
      dispIntegral: hasManha && hasTarde && hasNoite,
      dispHorarios: parsedHorarios,
      areasIds: docente.areas.map((a) => a.area.id),
      competenciasIds: docente.competencias.map((c) => c.uc.id),
    });
    setActiveTab('info');
    setErrorMessage('');
    setIsModalOpen(true);
  };

  // Abrir Modal de Detalhes
  const handleOpenDetails = (docente: DocenteItem) => {
    setSelectedDocente(docente);
    setIsDetailsModalOpen(true);
  };

  // Abrir Modal de Exclusão
  const handleOpenDelete = (docente: DocenteItem) => {
    setSelectedDocente(docente);
    setErrorMessage('');
    setIsDeleteModalOpen(true);
  };

  // Toggle de seleção de área no formulário
  const handleToggleArea = (areaId: string) => {
    setFormData((prev) => {
      const exists = prev.areasIds.includes(areaId);
      let newAreasIds: string[];
      let newCompetenciasIds = [...prev.competenciasIds];

      if (exists) {
        newAreasIds = prev.areasIds.filter((id) => id !== areaId);
        // Remover competências pertencentes a essa área
        const areaRemovida = areas.find((a) => a.id === areaId);
        if (areaRemovida?.unidadesCurriculares) {
          const ucsRemovidasIds = areaRemovida.unidadesCurriculares.map((u) => u.id);
          newCompetenciasIds = newCompetenciasIds.filter((id) => !ucsRemovidasIds.includes(id));
        }
      } else {
        newAreasIds = [...prev.areasIds, areaId];
      }

      return {
        ...prev,
        areasIds: newAreasIds,
        competenciasIds: newCompetenciasIds,
      };
    });
  };

  // Toggle de seleção de UC no formulário
  const handleToggleUC = (ucId: string) => {
    setFormData((prev) => {
      const exists = prev.competenciasIds.includes(ucId);
      return {
        ...prev,
        competenciasIds: exists
          ? prev.competenciasIds.filter((id) => id !== ucId)
          : [...prev.competenciasIds, ucId],
      };
    });
  };

  // Selecionar/deselecionar todas as UCs de uma Área
  const handleToggleAllUCsOfArea = (areaId: string) => {
    const area = areas.find((a) => a.id === areaId);
    if (!area?.unidadesCurriculares) return;

    const areaUcIds = area.unidadesCurriculares.map((u) => u.id);
    const allSelected = areaUcIds.every((id) => formData.competenciasIds.includes(id));

    setFormData((prev) => {
      let updated: string[];
      if (allSelected) {
        updated = prev.competenciasIds.filter((id) => !areaUcIds.includes(id));
      } else {
        const toAdd = areaUcIds.filter((id) => !prev.competenciasIds.includes(id));
        updated = [...prev.competenciasIds, ...toAdd];
      }
      return { ...prev, competenciasIds: updated };
    });
  };

  // Toggle de seleção de Bloco de Aula individual (45 min)
  const handleToggleBloco = (blocoId: string) => {
    setFormData((prev) => {
      const exists = prev.dispHorarios.includes(blocoId);
      const newHorarios = exists
        ? prev.dispHorarios.filter((id) => id !== blocoId)
        : [...prev.dispHorarios, blocoId];

      const hasManha = newHorarios.some((h) => h.startsWith('M'));
      const hasTarde = newHorarios.some((h) => h.startsWith('T'));
      const hasNoite = newHorarios.some((h) => h.startsWith('N'));
      const hasIntegral = hasManha && hasTarde && hasNoite;

      return {
        ...prev,
        dispHorarios: newHorarios,
        dispManha: hasManha,
        dispTarde: hasTarde,
        dispNoite: hasNoite,
        dispIntegral: hasIntegral,
      };
    });
  };

  // Toggle rápido de turno completo (Manhã, Tarde, Noite, Integral)
  const handleToggleTurnoCompleto = (turno: 'MANHA' | 'TARDE' | 'NOITE' | 'INTEGRAL') => {
    setFormData((prev) => {
      let newHorarios = [...prev.dispHorarios];
      const manhaIds = ['M1', 'M2', 'M3', 'M4', 'M5'];
      const tardeIds = ['T1', 'T2', 'T3', 'T4', 'T5'];
      const noiteIds = ['N1', 'N2', 'N3', 'N4', 'N5'];

      if (turno === 'MANHA') {
        const allSelected = manhaIds.every((id) => newHorarios.includes(id));
        if (allSelected) {
          newHorarios = newHorarios.filter((id) => !manhaIds.includes(id));
        } else {
          newHorarios = Array.from(new Set([...newHorarios, ...manhaIds]));
        }
      } else if (turno === 'TARDE') {
        const allSelected = tardeIds.every((id) => newHorarios.includes(id));
        if (allSelected) {
          newHorarios = newHorarios.filter((id) => !tardeIds.includes(id));
        } else {
          newHorarios = Array.from(new Set([...newHorarios, ...tardeIds]));
        }
      } else if (turno === 'NOITE') {
        const allSelected = noiteIds.every((id) => newHorarios.includes(id));
        if (allSelected) {
          newHorarios = newHorarios.filter((id) => !noiteIds.includes(id));
        } else {
          newHorarios = Array.from(new Set([...newHorarios, ...noiteIds]));
        }
      } else if (turno === 'INTEGRAL') {
        const allIds = [...manhaIds, ...tardeIds, ...noiteIds];
        const allSelected = allIds.every((id) => newHorarios.includes(id));
        if (allSelected) {
          newHorarios = [];
        } else {
          newHorarios = allIds;
        }
      }

      const hasManha = newHorarios.some((h) => h.startsWith('M'));
      const hasTarde = newHorarios.some((h) => h.startsWith('T'));
      const hasNoite = newHorarios.some((h) => h.startsWith('N'));
      const hasIntegral = hasManha && hasTarde && hasNoite;

      return {
        ...prev,
        dispHorarios: newHorarios,
        dispManha: hasManha,
        dispTarde: hasTarde,
        dispNoite: hasNoite,
        dispIntegral: hasIntegral,
      };
    });
  };

  // Submissão do Formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.nome.trim()) {
      setErrorMessage('O nome do docente é obrigatório.');
      setActiveTab('info');
      return;
    }

    if (!formData.email.trim()) {
      setErrorMessage('O e-mail é obrigatório.');
      setActiveTab('info');
      return;
    }

    if (formData.areasIds.length === 0) {
      setErrorMessage('Selecione pelo menos uma Área Tecnológica na aba Competências.');
      setActiveTab('competencias');
      return;
    }

    try {
      setIsSubmitting(true);
      const url = selectedDocente ? `/api/docentes/${selectedDocente.id}` : '/api/docentes';
      const method = selectedDocente ? 'PUT' : 'POST';

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
      setErrorMessage(error.message || 'Erro inesperado ao salvar docente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Exclusão do Docente
  const handleDelete = async () => {
    if (!selectedDocente) return;
    try {
      setIsSubmitting(true);
      setErrorMessage('');

      const res = await fetch(`/api/docentes/${selectedDocente.id}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Erro ao excluir docente.');
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

  // Filtragem dos Docentes
  const filteredDocentes = useMemo(() => {
    return docentes.filter((d) => {
      const matchSearch =
        searchTerm === '' ||
        d.usuario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.usuario.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.areas.some((a) => a.area.nome.toLowerCase().includes(searchTerm.toLowerCase())) ||
        d.competencias.some((c) => c.uc.nome.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchArea =
        selectedAreaFilter === 'ALL' || d.areas.some((a) => a.area.id === selectedAreaFilter);

      const matchStatus =
        selectedStatusFilter === 'ALL' ||
        (selectedStatusFilter === 'ATIVO' && d.usuario.ativo) ||
        (selectedStatusFilter === 'INATIVO' && !d.usuario.ativo);

      const matchTurno =
        selectedTurnoFilter === 'ALL' ||
        (selectedTurnoFilter === 'MANHA' && d.dispManha) ||
        (selectedTurnoFilter === 'TARDE' && d.dispTarde) ||
        (selectedTurnoFilter === 'NOITE' && d.dispNoite) ||
        (selectedTurnoFilter === 'INTEGRAL' && d.dispIntegral);

      return matchSearch && matchArea && matchStatus && matchTurno;
    });
  }, [docentes, searchTerm, selectedAreaFilter, selectedStatusFilter, selectedTurnoFilter]);

  // Estatísticas calculadas
  const totalDocentes = docentes.length;
  const totalAtivos = docentes.filter((d) => d.usuario.ativo).length;
  const cargaHorariaTotal = docentes.reduce((acc, curr) => acc + (curr.cargaHorariaContratada || 0), 0);
  const mediaCargaHoraria = totalDocentes > 0 ? Math.round(cargaHorariaTotal / totalDocentes) : 0;
  const totalCompetencias = docentes.reduce((acc, curr) => acc + (curr.competencias?.length || 0), 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Header Corporativo SENAI */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 dark:border-neutral-800 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-neutral-100">
              Corpo Docente & Competências
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-950/60 text-[#e30613]">
              Gestão Acadêmica
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-neutral-400 mt-1">
            Cadastro de professores, contratação, turnos de disponibilidade e mapeamento técnico de competências por UC.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Botão de Troca de Visualização */}
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

          <Button
            onClick={handleOpenCreate}
            className="bg-[#e30613] hover:bg-[#b7040f] text-white gap-2 font-semibold shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Novo Docente
          </Button>
        </div>
      </div>

      {/* KPI Cards de Estatísticas */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total de Docentes */}
        <div className="bg-white dark:bg-neutral-900 p-5 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider">
              Total de Professores
            </span>
            <div className="text-2xl font-bold text-gray-900 dark:text-neutral-100 mt-1">
              {totalDocentes}
            </div>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              {totalAtivos} ativos ({totalDocentes > 0 ? Math.round((totalAtivos / totalDocentes) * 100) : 0}%)
            </span>
          </div>
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 text-[#e30613]">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Carga Horária Total */}
        <div className="bg-white dark:bg-neutral-900 p-5 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider">
              Carga Horária Total
            </span>
            <div className="text-2xl font-bold text-gray-900 dark:text-neutral-100 mt-1">
              {cargaHorariaTotal}h <span className="text-xs font-normal text-gray-400">/sem</span>
            </div>
            <span className="text-[11px] text-gray-500 dark:text-neutral-400">
              Média de {mediaCargaHoraria}h por docente
            </span>
          </div>
          <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Competências Mapeadas */}
        <div className="bg-white dark:bg-neutral-900 p-5 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider">
              Competências Mapeadas
            </span>
            <div className="text-2xl font-bold text-gray-900 dark:text-neutral-100 mt-1">
              {totalCompetencias}
            </div>
            <span className="text-[11px] text-gray-500 dark:text-neutral-400">
              Vínculos Docente-UC ativos
            </span>
          </div>
          <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
            <GraduationCap className="w-6 h-6" />
          </div>
        </div>

        {/* Áreas Atendidas */}
        <div className="bg-white dark:bg-neutral-900 p-5 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider">
              Áreas Tecnológicas
            </span>
            <div className="text-2xl font-bold text-gray-900 dark:text-neutral-100 mt-1">
              {areas.length}
            </div>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              Segmentos cadastrados
            </span>
          </div>
          <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
            <Layers className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Barra de Busca e Filtros Dinâmicos */}
      <div className="bg-white dark:bg-neutral-900 p-4 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          
          {/* Busca textual */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-neutral-500 pointer-events-none" />
            <Input
              type="text"
              placeholder="Buscar por nome, e-mail ou UC..."
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

          {/* Filtro por Disponibilidade / Turno Dropdown */}
          <div className="w-full">
            <CustomSelect
              value={selectedTurnoFilter}
              onChange={setSelectedTurnoFilter}
              icon={Clock}
              options={[
                { value: 'ALL', label: 'Todos os Turnos' },
                { value: 'MANHA', label: 'Disponível Manhã' },
                { value: 'TARDE', label: 'Disponível Tarde' },
                { value: 'NOITE', label: 'Disponível Noite' },
                { value: 'INTEGRAL', label: 'Disponível Integral' },
              ]}
            />
          </div>

          {/* Filtro por Status Dropdown */}
          <div className="w-full">
            <CustomSelect
              value={selectedStatusFilter}
              onChange={setSelectedStatusFilter}
              icon={CheckCircle2}
              options={[
                { value: 'ALL', label: 'Todos os Status' },
                { value: 'ATIVO', label: 'Somente Ativos' },
                { value: 'INATIVO', label: 'Somente Inativos' },
              ]}
            />
          </div>

        </div>
      </div>

      {/* Conteúdo Principal: Tabela ou Cards */}
      {loading ? (
        <div className="bg-white dark:bg-neutral-900 rounded-xl p-12 text-center border border-gray-200 dark:border-neutral-800">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-red-600 border-t-transparent mb-3" />
          <p className="text-sm text-gray-500 dark:text-neutral-400 font-medium">Carregando corpo docente...</p>
        </div>
      ) : filteredDocentes.length === 0 ? (
        <div className="bg-white dark:bg-neutral-900 rounded-xl p-12 text-center border border-gray-200 dark:border-neutral-800 space-y-3">
          <Users className="w-12 h-12 mx-auto text-gray-300 dark:text-neutral-700" />
          <p className="text-base font-bold text-gray-800 dark:text-neutral-200">
            Nenhum docente encontrado
          </p>
          <p className="text-xs text-gray-500 dark:text-neutral-400 max-w-md mx-auto">
            {searchTerm || selectedAreaFilter !== 'ALL' || selectedTurnoFilter !== 'ALL' || selectedStatusFilter !== 'ALL'
              ? 'Tente ajustar os filtros ou o termo de busca para encontrar o professor desejado.'
              : 'Clique em "+ Novo Docente" para cadastrar o primeiro professor da unidade.'}
          </p>
          {docentes.length === 0 && (
            <Button
              onClick={handleOpenCreate}
              className="bg-[#e30613] hover:bg-[#b7040f] text-white text-xs font-semibold mt-2"
            >
              <Plus className="w-4 h-4 mr-1.5" /> Cadastrar Primeiro Docente
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
                  <th className="px-6 py-3.5">Docente</th>
                  <th className="px-6 py-3.5">Áreas de Atuação</th>
                  <th className="px-6 py-3.5">Competências (UCs)</th>
                  <th className="px-6 py-3.5">Disponibilidade</th>
                  <th className="px-6 py-3.5">Contratação</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-neutral-800 font-medium">
                {filteredDocentes.map((docente) => (
                  <tr
                    key={docente.id}
                    className="hover:bg-gray-50/80 dark:hover:bg-neutral-800/40 transition-colors"
                  >
                    {/* Nome e E-mail */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-red-100 dark:bg-red-950/60 text-[#e30613] font-bold flex items-center justify-center text-xs shrink-0">
                          {docente.usuario.nome.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 dark:text-neutral-100 text-sm">
                            {docente.usuario.nome}
                          </div>
                          <div className="text-gray-500 dark:text-neutral-400 text-xs">
                            {docente.usuario.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Áreas */}
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                        {docente.areas.map((a) => (
                          <span
                            key={a.area.id}
                            className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/40"
                          >
                            {a.area.nome}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Competências (UCs) */}
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap items-center gap-1 max-w-[240px]">
                        {docente.competencias.slice(0, 2).map((c) => (
                          <span
                            key={c.uc.id}
                            className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/40 truncate max-w-[120px]"
                            title={c.uc.nome}
                          >
                            {c.uc.nome}
                          </span>
                        ))}
                        {docente.competencias.length > 2 && (
                          <button
                            onClick={() => handleOpenDetails(docente)}
                            className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-300 hover:bg-gray-200"
                          >
                            +{docente.competencias.length - 2} UCs
                          </button>
                        )}
                        {docente.competencias.length === 0 && (
                          <span className="text-gray-400 text-xs italic">Nenhuma UC</span>
                        )}
                      </div>
                    </td>

                    {/* Disponibilidade */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <span
                          className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold ${
                            docente.dispManha
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 font-extrabold'
                              : 'bg-gray-100 text-gray-400 dark:bg-neutral-800'
                          }`}
                          title="Manhã"
                        >
                          M
                        </span>
                        <span
                          className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold ${
                            docente.dispTarde
                              ? 'bg-orange-100 text-orange-800 dark:bg-orange-950/50 dark:text-orange-300 font-extrabold'
                              : 'bg-gray-100 text-gray-400 dark:bg-neutral-800'
                          }`}
                          title="Tarde"
                        >
                          T
                        </span>
                        <span
                          className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold ${
                            docente.dispNoite
                              ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-300 font-extrabold'
                              : 'bg-gray-100 text-gray-400 dark:bg-neutral-800'
                          }`}
                          title="Noite"
                        >
                          N
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                            docente.dispIntegral
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                              : 'bg-gray-100 text-gray-400 dark:bg-neutral-800'
                          }`}
                          title="Integral"
                        >
                          INT
                        </span>
                      </div>
                    </td>

                    {/* Contratação e Carga Horária */}
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900 dark:text-neutral-100">
                        {docente.cargaHorariaContratada}h / semana
                      </div>
                      <div className="text-gray-500 dark:text-neutral-400 text-[11px]">
                        {docente.tipoContratacao}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      {docente.usuario.ativo ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Ativo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-400 border border-gray-200 dark:border-neutral-700">
                          <XCircle className="w-3.5 h-3.5" /> Inativo
                        </span>
                      )}
                    </td>

                    {/* Ações */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/docentes/${docente.id}/agenda`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#e30613] hover:text-[#b7040f] hover:bg-red-50 dark:hover:bg-red-950/40 rounded-md border border-red-200 dark:border-red-900/40 transition-colors"
                          title="Ver Agenda Mensal e Grade do Professor"
                        >
                          <CalendarDays className="w-3.5 h-3.5" /> Agenda
                        </Link>
                        <button
                          onClick={() => handleOpenDetails(docente)}
                          className="p-1.5 text-gray-500 hover:text-gray-900 dark:hover:text-neutral-100 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-md transition-colors"
                          title="Ver Detalhes"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(docente)}
                          className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-md transition-colors"
                          title="Editar Docente"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenDelete(docente)}
                          className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-md transition-colors"
                          title="Excluir Docente"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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
          {filteredDocentes.map((docente) => (
            <div
              key={docente.id}
              className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm p-5 flex flex-col justify-between hover:shadow-md transition-shadow relative"
            >
              <div>
                {/* Card Top */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-950/60 text-[#e30613] font-bold flex items-center justify-center text-sm shrink-0">
                      {docente.usuario.nome.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-neutral-100 text-sm">
                        {docente.usuario.nome}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-neutral-400">
                        {docente.usuario.email}
                      </p>
                    </div>
                  </div>

                  {docente.usuario.ativo ? (
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" title="Ativo" />
                  ) : (
                    <span className="w-2.5 h-2.5 rounded-full bg-gray-400 shrink-0" title="Inativo" />
                  )}
                </div>

                {/* Info Contrato */}
                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-neutral-800/80 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-400 text-[11px] block">Contratação</span>
                    <span className="font-semibold text-gray-800 dark:text-neutral-200">
                      {docente.tipoContratacao}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-[11px] block">Carga Horária</span>
                    <span className="font-semibold text-gray-800 dark:text-neutral-200">
                      {docente.cargaHorariaContratada}h / sem
                    </span>
                  </div>
                </div>

                {/* Áreas */}
                <div className="mt-3">
                  <span className="text-gray-400 text-[11px] block mb-1">Áreas de Atuação</span>
                  <div className="flex flex-wrap gap-1">
                    {docente.areas.map((a) => (
                      <span
                        key={a.area.id}
                        className="px-2 py-0.5 rounded text-[10px] font-medium bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/60"
                      >
                        {a.area.nome}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Competências */}
                <div className="mt-3">
                  <span className="text-gray-400 text-[11px] block mb-1">
                    Competências ({docente.competencias.length})
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {docente.competencias.slice(0, 3).map((c) => (
                      <span
                        key={c.uc.id}
                        className="px-2 py-0.5 rounded text-[10px] font-medium bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200/60 truncate max-w-[140px]"
                        title={c.uc.nome}
                      >
                        {c.uc.nome}
                      </span>
                    ))}
                    {docente.competencias.length > 3 && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-300">
                        +{docente.competencias.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                {/* Turnos */}
                <div className="mt-3 flex items-center gap-1.5">
                  <span className="text-gray-400 text-[11px] mr-1">Turnos:</span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      docente.dispManha ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-300'
                    }`}
                  >
                    M
                  </span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      docente.dispTarde ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-300'
                    }`}
                  >
                    T
                  </span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      docente.dispNoite ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-300'
                    }`}
                  >
                    N
                  </span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      docente.dispIntegral ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-300'
                    }`}
                  >
                    INT
                  </span>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="mt-5 pt-3 border-t border-gray-100 dark:border-neutral-800 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Link
                    href={`/docentes/${docente.id}/agenda`}
                    className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-[#e30613] hover:text-[#b7040f] hover:bg-red-50 dark:hover:bg-red-950/40 rounded-md border border-red-200 dark:border-red-900/40 transition-colors"
                  >
                    <CalendarDays className="w-3 h-3" /> Agenda
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenDetails(docente)}
                    className="text-xs h-7 gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" /> Detalhes
                  </Button>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenEdit(docente)}
                    className="text-blue-600 h-7 w-7 p-0"
                    title="Editar"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenDelete(docente)}
                    className="text-red-600 h-7 w-7 p-0"
                    title="Excluir"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL DE CADASTRO E EDIÇÃO DE DOCENTE COM ABAS AMPLO */}
      {/* ========================================================================= */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-3xl md:max-w-4xl lg:max-w-5xl w-[95vw] max-h-[92vh] overflow-y-auto p-6 md:p-8">
          <DialogHeader className="border-b border-gray-200 dark:border-neutral-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/50 text-[#e30613]">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-gray-900 dark:text-neutral-100">
                  {selectedDocente ? 'Editar Docente' : 'Cadastrar Novo Docente'}
                </DialogTitle>
                <DialogDescription className="text-xs text-gray-500 dark:text-neutral-400 mt-0.5">
                  Preencha os dados cadastrais, turnos de disponibilidade e associe as competências por Unidade Curricular.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Abas do Formulário em Grid Amplo */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 pb-3 border-b border-gray-200 dark:border-neutral-800 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('info')}
              className={`px-4 py-2.5 rounded-lg transition-all text-center flex items-center justify-center gap-2 border ${
                activeTab === 'info'
                  ? 'bg-red-50 dark:bg-red-950/60 text-[#e30613] font-bold border-red-300 dark:border-red-800 shadow-sm'
                  : 'bg-gray-50 dark:bg-neutral-800/60 text-gray-600 dark:text-neutral-400 border-gray-200 dark:border-neutral-700 hover:bg-gray-100'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-red-100 dark:bg-red-900 text-[#e30613] text-[11px] font-bold flex items-center justify-center">1</span>
              <span>Identificação & Acesso</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('contrato')}
              className={`px-4 py-2.5 rounded-lg transition-all text-center flex items-center justify-center gap-2 border ${
                activeTab === 'contrato'
                  ? 'bg-red-50 dark:bg-red-950/60 text-[#e30613] font-bold border-red-300 dark:border-red-800 shadow-sm'
                  : 'bg-gray-50 dark:bg-neutral-800/60 text-gray-600 dark:text-neutral-400 border-gray-200 dark:border-neutral-700 hover:bg-gray-100'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-red-100 dark:bg-red-900 text-[#e30613] text-[11px] font-bold flex items-center justify-center">2</span>
              <span>Contrato & Turnos</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('competencias')}
              className={`px-4 py-2.5 rounded-lg transition-all text-center flex items-center justify-center gap-2 border ${
                activeTab === 'competencias'
                  ? 'bg-red-50 dark:bg-red-950/60 text-[#e30613] font-bold border-red-300 dark:border-red-800 shadow-sm'
                  : 'bg-gray-50 dark:bg-neutral-800/60 text-gray-600 dark:text-neutral-400 border-gray-200 dark:border-neutral-700 hover:bg-gray-100'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-red-100 dark:bg-red-900 text-[#e30613] text-[11px] font-bold flex items-center justify-center">3</span>
              <span>Áreas & Competências (UCs)</span>
            </button>
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 pt-2">
            {/* ABA 1: Identificação & Acesso */}
            {activeTab === 'info' && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nome" className="text-xs font-semibold">
                      Nome Completo do Docente <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="nome"
                      placeholder="Ex: Prof. Carlos Eduardo da Silva"
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      required
                      className="mt-1.5 text-xs h-10"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-xs font-semibold">
                      E-mail Institucional <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="carlos.silva@sp.senai.br"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="mt-1.5 text-xs h-10"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                  <div>
                    <Label htmlFor="senha" className="text-xs font-semibold">
                      {selectedDocente ? 'Nova Senha de Acesso (Opcional)' : 'Senha Inicial de Acesso'}
                    </Label>
                    <Input
                      id="senha"
                      type="password"
                      placeholder={selectedDocente ? 'Deixe em branco para manter a senha atual' : 'Padrão: senai123'}
                      value={formData.senha}
                      onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                      className="mt-1.5 text-xs h-10"
                    />
                    <p className="text-[11px] text-gray-400 mt-1">
                      {selectedDocente
                        ? 'Preencha apenas se desejar redefinir o acesso do docente.'
                        : 'Caso não preenchido, a senha inicial padrão será "senai123".'}
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-neutral-800/50 p-4 rounded-xl border border-gray-200 dark:border-neutral-700 flex items-center justify-between">
                    <div>
                      <Label htmlFor="ativo" className="text-xs font-bold text-gray-900 dark:text-neutral-100 block cursor-pointer">
                        Status do Docente
                      </Label>
                      <p className="text-[11px] text-gray-500 dark:text-neutral-400">
                        {formData.ativo ? 'Docente ativo e apto para atribuição de turmas' : 'Docente inativo no sistema'}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        id="ativo"
                        checked={formData.ativo}
                        onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* ABA 2: Contrato & Turnos com Desmembramento de Blocos (Padrão SENAI) */}
            {activeTab === 'contrato' && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="tipoContratacao" className="text-xs font-semibold">
                      Tipo de Contratação
                    </Label>
                    <div className="mt-1.5">
                      <CustomSelect
                        value={formData.tipoContratacao}
                        onChange={(val) => setFormData({ ...formData, tipoContratacao: val })}
                        icon={Briefcase}
                        options={[
                          { value: 'CLT 40h', label: 'CLT 40h (Tempo Integral)' },
                          { value: 'CLT 20h', label: 'CLT 20h (Meio Período)' },
                          { value: 'Horista', label: 'Horista (Aulas Avulsas)' },
                          { value: 'Prestador PJ', label: 'Prestador de Serviços (PJ)' },
                        ]}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="cargaHoraria" className="text-xs font-semibold">
                      Carga Horária Semanal Contratada (Horas)
                    </Label>
                    <Input
                      id="cargaHoraria"
                      type="number"
                      min={1}
                      max={60}
                      value={formData.cargaHorariaContratada}
                      onChange={(e) =>
                        setFormData({ ...formData, cargaHorariaContratada: Number(e.target.value) })
                      }
                      required
                      className="mt-1.5 text-xs h-10"
                    />
                  </div>
                </div>

                {/* Seleção Rápida de Turnos */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-xs font-bold text-gray-900 dark:text-neutral-100 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#e30613]" />
                      Atalhos Rápidos de Turnos
                    </Label>
                    <span className="text-[11px] text-gray-500 dark:text-neutral-400">
                      Clique para marcar/desmarcar o período completo
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                    <button
                      type="button"
                      onClick={() => handleToggleTurnoCompleto('MANHA')}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all text-left cursor-pointer ${
                        formData.dispManha
                          ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 font-semibold ring-1 ring-amber-400/50'
                          : 'bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-800 text-gray-600 dark:text-neutral-400 hover:bg-gray-50'
                      }`}
                    >
                      <div>
                        <span className="block font-bold">Manhã</span>
                        <span className="text-[10px] opacity-75">07:30 às 11:45</span>
                      </div>
                      <span className={`w-2 h-2 rounded-full ${formData.dispManha ? 'bg-amber-500' : 'bg-gray-300 dark:bg-neutral-700'}`} />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleTurnoCompleto('TARDE')}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all text-left cursor-pointer ${
                        formData.dispTarde
                          ? 'bg-orange-50 dark:bg-orange-950/40 border-orange-300 dark:border-orange-800 text-orange-900 dark:text-orange-200 font-semibold ring-1 ring-orange-400/50'
                          : 'bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-800 text-gray-600 dark:text-neutral-400 hover:bg-gray-50'
                      }`}
                    >
                      <div>
                        <span className="block font-bold">Tarde</span>
                        <span className="text-[10px] opacity-75">13:15 às 17:30</span>
                      </div>
                      <span className={`w-2 h-2 rounded-full ${formData.dispTarde ? 'bg-orange-500' : 'bg-gray-300 dark:bg-neutral-700'}`} />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleTurnoCompleto('NOITE')}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all text-left cursor-pointer ${
                        formData.dispNoite
                          ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200 font-semibold ring-1 ring-indigo-400/50'
                          : 'bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-800 text-gray-600 dark:text-neutral-400 hover:bg-gray-50'
                      }`}
                    >
                      <div>
                        <span className="block font-bold">Noite</span>
                        <span className="text-[10px] opacity-75">18:45 às 22:30</span>
                      </div>
                      <span className={`w-2 h-2 rounded-full ${formData.dispNoite ? 'bg-indigo-500' : 'bg-gray-300 dark:bg-neutral-700'}`} />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleTurnoCompleto('INTEGRAL')}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all text-left cursor-pointer ${
                        formData.dispIntegral
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 font-semibold ring-1 ring-emerald-400/50'
                          : 'bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-800 text-gray-600 dark:text-neutral-400 hover:bg-gray-50'
                      }`}
                    >
                      <div>
                        <span className="block font-bold text-emerald-700 dark:text-emerald-300">Integral</span>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400">Todos os Turnos</span>
                      </div>
                      <span className={`w-2 h-2 rounded-full ${formData.dispIntegral ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-neutral-700'}`} />
                    </button>
                  </div>
                </div>

                {/* Grade Desmembrada por Blocos de Aula (45 min) */}
                <div className="bg-gray-50 dark:bg-neutral-800/40 p-4 rounded-2xl border border-gray-200 dark:border-neutral-800 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-gray-200 dark:border-neutral-700/80 pb-2.5">
                    <div>
                      <h4 className="text-xs font-bold text-gray-900 dark:text-neutral-100 flex items-center gap-1.5">
                        <CalendarDays className="w-4 h-4 text-[#e30613]" />
                        Desmembramento por Blocos de Aula (Padrão SENAI - 45 min)
                      </h4>
                      <p className="text-[11px] text-gray-500 dark:text-neutral-400">
                        Marque ou desmarque aulas individuais caso o docente não fique o período integral.
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-red-100 dark:bg-red-950/60 text-[#e30613]">
                        {formData.dispHorarios.length} de {TODOS_BLOCOS_IDS.length} aulas selecionadas
                      </span>
                    </div>
                  </div>

                  {/* 3 Colunas dos Turnos */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs pt-1">
                    
                    {/* COLUNA 1: MANHÃ */}
                    <div className="bg-white dark:bg-neutral-900 p-3.5 rounded-xl border border-gray-200 dark:border-neutral-800 space-y-2">
                      <div className="flex items-center justify-between border-b border-gray-100 dark:border-neutral-800 pb-2">
                        <span className="font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                          ☀️ Manhã (07:30 – 11:45)
                        </span>
                        <span className="text-[10px] font-semibold text-gray-400">5 Aulas</span>
                      </div>

                      <div className="space-y-1.5">
                        {BLOCOS_HORARIOS_SENAI.filter((b) => b.turno === 'MANHA').map((bloco) => {
                          const isChecked = formData.dispHorarios.includes(bloco.id);
                          return (
                            <div key={bloco.id} className="space-y-1">
                              <label className={`flex items-center justify-between p-2 rounded-lg border transition-all cursor-pointer ${
                                isChecked
                                  ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-200 font-semibold'
                                  : 'bg-white dark:bg-neutral-900 border-gray-100 dark:border-neutral-800 text-gray-600 dark:text-neutral-400 hover:bg-gray-50'
                              }`}>
                                <div className="flex items-center gap-2.5">
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => handleToggleBloco(bloco.id)}
                                    className="w-3.5 h-3.5 rounded text-[#e30613] focus:ring-[#e30613]"
                                  />
                                  <span className="font-bold text-[11px]">{bloco.bloco}</span>
                                </div>
                                <div className="text-right">
                                  <span className="text-[11px] text-gray-600 dark:text-neutral-300">{bloco.horario}</span>
                                </div>
                              </label>

                              {bloco.intervaloApos && (
                                <div className="py-1 px-2 text-[10px] font-medium text-amber-700 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-950/20 rounded border border-amber-100 dark:border-amber-900/30 text-center">
                                  {bloco.intervaloApos}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* COLUNA 2: TARDE */}
                    <div className="bg-white dark:bg-neutral-900 p-3.5 rounded-xl border border-gray-200 dark:border-neutral-800 space-y-2">
                      <div className="flex items-center justify-between border-b border-gray-100 dark:border-neutral-800 pb-2">
                        <span className="font-bold text-orange-900 dark:text-orange-300 flex items-center gap-1.5">
                          🌤️ Tarde (13:15 – 17:30)
                        </span>
                        <span className="text-[10px] font-semibold text-gray-400">5 Aulas</span>
                      </div>

                      <div className="space-y-1.5">
                        {BLOCOS_HORARIOS_SENAI.filter((b) => b.turno === 'TARDE').map((bloco) => {
                          const isChecked = formData.dispHorarios.includes(bloco.id);
                          return (
                            <div key={bloco.id} className="space-y-1">
                              <label className={`flex items-center justify-between p-2 rounded-lg border transition-all cursor-pointer ${
                                isChecked
                                  ? 'bg-orange-50/70 dark:bg-orange-950/30 border-orange-300 dark:border-orange-800 text-orange-950 dark:text-orange-200 font-semibold'
                                  : 'bg-white dark:bg-neutral-900 border-gray-100 dark:border-neutral-800 text-gray-600 dark:text-neutral-400 hover:bg-gray-50'
                              }`}>
                                <div className="flex items-center gap-2.5">
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => handleToggleBloco(bloco.id)}
                                    className="w-3.5 h-3.5 rounded text-[#e30613] focus:ring-[#e30613]"
                                  />
                                  <span className="font-bold text-[11px]">{bloco.bloco}</span>
                                </div>
                                <div className="text-right">
                                  <span className="text-[11px] text-gray-600 dark:text-neutral-300">{bloco.horario}</span>
                                </div>
                              </label>

                              {bloco.intervaloApos && (
                                <div className="py-1 px-2 text-[10px] font-medium text-orange-700 dark:text-orange-400 bg-orange-50/50 dark:bg-orange-950/20 rounded border border-orange-100 dark:border-orange-900/30 text-center">
                                  {bloco.intervaloApos}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* COLUNA 3: NOITE (com suporte até 21h30) */}
                    <div className="bg-white dark:bg-neutral-900 p-3.5 rounded-xl border border-gray-200 dark:border-neutral-800 space-y-2">
                      <div className="flex items-center justify-between border-b border-gray-100 dark:border-neutral-800 pb-2">
                        <span className="font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
                          🌙 Noite (18:45 – 22:30)
                        </span>
                        <span className="text-[10px] font-semibold text-gray-400">Flexível</span>
                      </div>

                      <div className="space-y-1.5">
                        {BLOCOS_HORARIOS_SENAI.filter((b) => b.turno === 'NOITE').map((bloco) => {
                          const isChecked = formData.dispHorarios.includes(bloco.id);
                          return (
                            <div key={bloco.id} className="space-y-1">
                              <label className={`flex items-center justify-between p-2 rounded-lg border transition-all cursor-pointer ${
                                isChecked
                                  ? 'bg-indigo-50/70 dark:bg-indigo-950/30 border-indigo-300 dark:border-indigo-800 text-indigo-950 dark:text-indigo-200 font-semibold'
                                  : 'bg-white dark:bg-neutral-900 border-gray-100 dark:border-neutral-800 text-gray-600 dark:text-neutral-400 hover:bg-gray-50'
                              }`}>
                                <div className="flex items-center gap-2.5">
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => handleToggleBloco(bloco.id)}
                                    className="w-3.5 h-3.5 rounded text-[#e30613] focus:ring-[#e30613]"
                                  />
                                  <div>
                                    <span className="font-bold text-[11px]">{bloco.bloco}</span>
                                    {bloco.destaque && (
                                      <span className="ml-1.5 text-[9px] px-1.5 py-0.2 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 font-bold">
                                        {bloco.destaque}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <span className="text-[11px] text-gray-600 dark:text-neutral-300">{bloco.horario}</span>
                                </div>
                              </label>

                              {bloco.intervaloApos && (
                                <div className="py-1 px-2 text-[10px] font-medium text-indigo-700 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20 rounded border border-indigo-100 dark:border-indigo-900/30 text-center">
                                  {bloco.intervaloApos}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      <div className="p-2 rounded bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 text-[10px] text-indigo-800 dark:text-indigo-300">
                        💡 <strong>Dica:</strong> Para professores com saída até <strong>21h30</strong>, marque da 1ª à 3ª aula (ou 4ª).
                      </div>
                    </div>

                  </div>
                </div>

                <div>
                  <Label htmlFor="observacoes" className="text-xs font-semibold">
                    Observações e Restrições de Agenda
                  </Label>
                  <textarea
                    id="observacoes"
                    rows={3}
                    placeholder="Ex: Disponibilidade noturna até 21h30; sábados letivos; especialização em CLP..."
                    value={formData.observacoes}
                    onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                    className="w-full mt-1.5 p-3 text-xs bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-md focus:outline-none focus:ring-2 focus:ring-[#e30613]"
                  />
                </div>
              </div>
            )}

            {/* ABA 3: Áreas & Competências (UCs) Ampla com Grid */}
            {activeTab === 'competencias' && (
              <div className="space-y-5">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <Label className="text-xs font-bold text-gray-900 dark:text-neutral-100">
                      1. Áreas Tecnológicas de Atuação <span className="text-red-500">*</span>
                    </Label>
                    <span className="text-[11px] text-gray-400">
                      {formData.areasIds.length} área(s) selecionada(s)
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 mb-3">
                    Selecione os segmentos nos quais o professor atua para desbloquear as disciplinas.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                    {areas.map((area) => {
                      const isSelected = formData.areasIds.includes(area.id);
                      return (
                        <button
                          key={area.id}
                          type="button"
                          onClick={() => handleToggleArea(area.id)}
                          className={`p-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-between border text-left ${
                            isSelected
                              ? 'bg-[#e30613] text-white border-[#e30613] shadow-md'
                              : 'bg-white dark:bg-neutral-800/70 text-gray-700 dark:text-neutral-300 border-gray-200 dark:border-neutral-700 hover:border-red-300'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <Layers className="w-4 h-4 shrink-0" />
                            <span className="truncate">{area.nome}</span>
                          </div>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                            isSelected ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-neutral-700 text-gray-600'
                          }`}>
                            {area.unidadesCurriculares?.length || 0} UCs
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-200 dark:border-neutral-800">
                  <div className="flex items-center justify-between mb-1.5">
                    <Label className="text-xs font-bold text-gray-900 dark:text-neutral-100">
                      2. Competências por Unidade Curricular (UCs)
                    </Label>
                    <span className="text-[11px] text-purple-700 dark:text-purple-300 font-semibold">
                      {formData.competenciasIds.length} competência(s) marcada(s)
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 mb-3">
                    Regra de Negócio: O docente só poderá ser escalado para ministrar UCs marcadas abaixo.
                  </p>

                  {formData.areasIds.length === 0 ? (
                    <div className="p-6 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-xs text-center border border-amber-200 dark:border-amber-900">
                      Selecione ao menos uma Área Tecnológica acima para carregar as disciplinas disponíveis.
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
                      {areas
                        .filter((a) => formData.areasIds.includes(a.id))
                        .map((area) => {
                          const areaUcs = area.unidadesCurriculares || [];
                          return (
                            <div
                              key={area.id}
                              className="bg-gray-50 dark:bg-neutral-800/40 p-4 rounded-xl border border-gray-200 dark:border-neutral-800 space-y-3"
                            >
                              <div className="flex items-center justify-between border-b border-gray-200 dark:border-neutral-700/60 pb-2">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-xs text-gray-900 dark:text-neutral-100">
                                    {area.nome}
                                  </span>
                                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300 font-bold">
                                    {areaUcs.length} UCs cadastradas
                                  </span>
                                </div>

                                {areaUcs.length > 0 && (
                                  <button
                                    type="button"
                                    onClick={() => handleToggleAllUCsOfArea(area.id)}
                                    className="text-xs text-[#e30613] hover:underline font-bold"
                                  >
                                    Alternar Todas da Área
                                  </button>
                                )}
                              </div>

                              {areaUcs.length === 0 ? (
                                <p className="text-xs text-gray-400 italic py-2">
                                  Nenhuma UC cadastrada nesta área ainda.
                                </p>
                              ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                  {areaUcs.map((uc) => {
                                    const isUcSelected = formData.competenciasIds.includes(uc.id);
                                    return (
                                      <label
                                        key={uc.id}
                                        className={`flex items-center gap-2.5 p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                                          isUcSelected
                                            ? 'bg-purple-50 dark:bg-purple-950/50 border-purple-300 dark:border-purple-800 text-purple-900 dark:text-purple-200 font-semibold shadow-xs'
                                            : 'bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-800 text-gray-700 dark:text-neutral-400 hover:bg-gray-100/70'
                                        }`}
                                      >
                                        <input
                                          type="checkbox"
                                          checked={isUcSelected}
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
                          );
                        })}
                    </div>
                  )}
                </div>
              </div>
            )}

            <DialogFooter className="pt-4 border-t border-gray-200 dark:border-neutral-800 flex items-center justify-between gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="text-xs"
              >
                Cancelar
              </Button>

              <div className="flex items-center gap-2">
                {activeTab !== 'competencias' ? (
                  <Button
                    type="button"
                    onClick={() =>
                      setActiveTab(activeTab === 'info' ? 'contrato' : 'competencias')
                    }
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
                      : selectedDocente
                      ? 'Salvar Alterações'
                      : 'Cadastrar Docente'}
                  </Button>
                )}
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL DE DETALHES COMPLETOS DO DOCENTE AMPLO */}
      {/* ========================================================================= */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="sm:max-w-2xl md:max-w-3xl lg:max-w-4xl w-[95vw] p-6 md:p-8">
          <DialogHeader className="border-b border-gray-200 dark:border-neutral-800 pb-3">
            <DialogTitle className="text-lg font-bold flex items-center gap-2 text-gray-900 dark:text-neutral-100">
              <GraduationCap className="w-5 h-5 text-[#e30613]" />
              Ficha do Docente: {selectedDocente?.usuario.nome}
            </DialogTitle>
          </DialogHeader>

          {selectedDocente && (
            <div className="space-y-5 text-xs pt-2">
              {/* Header com avatar e dados */}
              <div className="bg-gray-50 dark:bg-neutral-800/40 p-5 rounded-2xl border border-gray-200 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-red-100 dark:bg-red-950/60 text-[#e30613] font-extrabold flex items-center justify-center text-xl shadow-xs">
                    {selectedDocente.usuario.nome.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-gray-900 dark:text-neutral-100">
                      {selectedDocente.usuario.nome}
                    </h4>
                    <p className="text-gray-500 dark:text-neutral-400 text-xs">{selectedDocente.usuario.email}</p>
                    <span className="text-[11px] text-gray-400">
                      Cadastrado em {new Date(selectedDocente.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>

                <div>
                  {selectedDocente.usuario.ativo ? (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300/60">
                      ✓ Ativo na Unidade
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-200 text-gray-700">
                      Inativo
                    </span>
                  )}
                </div>
              </div>

              {/* Informações Contratuais em Grid Amplo */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
                <div>
                  <span className="text-gray-400 block text-[11px]">Tipo de Contratação:</span>
                  <span className="font-bold text-sm text-gray-900 dark:text-neutral-100">
                    {selectedDocente.tipoContratacao}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[11px]">Carga Horária:</span>
                  <span className="font-bold text-sm text-gray-900 dark:text-neutral-100">
                    {selectedDocente.cargaHorariaContratada}h semanais
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[11px]">Disponibilidade Semanal:</span>
                  <div className="flex gap-1.5 mt-1">
                    {selectedDocente.dispManha && (
                      <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">
                        Manhã
                      </span>
                    )}
                    {selectedDocente.dispTarde && (
                      <span className="px-2 py-0.5 rounded bg-orange-100 text-orange-800 text-[10px] font-bold">
                        Tarde
                      </span>
                    )}
                    {selectedDocente.dispNoite && (
                      <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 text-[10px] font-bold">
                        Noite
                      </span>
                    )}
                    {selectedDocente.dispIntegral && (
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        Integral
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Detalhamento dos Blocos de Aula Ativos (Padrão SENAI) */}
              <div className="p-4 rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-2">
                <span className="text-gray-900 dark:text-neutral-100 font-bold block text-xs flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#e30613]" />
                  Blocos de Horários Habilitados (45 min):
                </span>
                
                {(() => {
                  let horariosList: string[] = [];
                  if (selectedDocente.dispHorarios) {
                    try {
                      horariosList = JSON.parse(selectedDocente.dispHorarios);
                    } catch (e) {}
                  }
                  if (horariosList.length === 0) {
                    if (selectedDocente.dispManha) horariosList.push('M1', 'M2', 'M3', 'M4', 'M5');
                    if (selectedDocente.dispTarde) horariosList.push('T1', 'T2', 'T3', 'T4', 'T5');
                    if (selectedDocente.dispNoite) horariosList.push('N1', 'N2', 'N3', 'N4', 'N5');
                  }

                  const blocosAtivos = BLOCOS_HORARIOS_SENAI.filter((b) => horariosList.includes(b.id));

                  if (blocosAtivos.length === 0) {
                    return <span className="text-gray-400 italic text-[11px]">Nenhum bloco específico habilitado.</span>;
                  }

                  return (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {blocosAtivos.map((bloco) => {
                        const isManha = bloco.turno === 'MANHA';
                        const isTarde = bloco.turno === 'TARDE';
                        return (
                          <span
                            key={bloco.id}
                            className={`px-2.5 py-1 rounded-md text-[10px] font-semibold border ${
                              isManha
                                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800/60'
                                : isTarde
                                ? 'bg-orange-50 dark:bg-orange-950/40 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-800/60'
                                : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/60'
                            }`}
                          >
                            {bloco.turno.charAt(0) + bloco.turno.slice(1).toLowerCase()} • {bloco.bloco} ({bloco.horario})
                          </span>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>

              {/* Observações */}
              {selectedDocente.observacoes && (
                <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-neutral-800 text-gray-600 dark:text-neutral-300 border border-gray-200 dark:border-neutral-700">
                  <span className="font-bold block text-gray-800 dark:text-neutral-200 mb-0.5 text-xs">
                    Observações de Agenda:
                  </span>
                  {selectedDocente.observacoes}
                </div>
              )}

              {/* Lista Completa de Competências */}
              <div>
                <h5 className="font-bold text-xs text-gray-900 dark:text-neutral-100 mb-2">
                  Competências Habilitadas ({selectedDocente.competencias.length} UCs):
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-56 overflow-y-auto">
                  {selectedDocente.areas.map((a) => {
                    const ucsDaArea = selectedDocente.competencias.filter(
                      (c) => c.uc.areaId === a.area.id
                    );
                    return (
                      <div
                        key={a.area.id}
                        className="bg-gray-50 dark:bg-neutral-800/40 p-3 rounded-xl border border-gray-200 dark:border-neutral-800"
                      >
                        <span className="font-bold text-blue-700 dark:text-blue-300 block mb-2 text-xs">
                          {a.area.nome} ({ucsDaArea.length})
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {ucsDaArea.map((c) => (
                            <span
                              key={c.uc.id}
                              className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200/60"
                            >
                              {c.uc.nome}
                            </span>
                          ))}
                          {ucsDaArea.length === 0 && (
                            <span className="text-gray-400 text-[11px] italic">
                              Nenhuma competência nesta área.
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
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
              <Trash2 className="w-5 h-5" /> Excluir Docente
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              Tem certeza que deseja excluir o cadastro do professor{' '}
              <strong className="text-gray-900 dark:text-neutral-100">
                {selectedDocente?.usuario.nome}
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
            Esta ação removerá o usuário, seus vínculos de áreas e competências cadastradas. Caso o docente possua turmas atribuídas, a exclusão será bloqueada.
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
