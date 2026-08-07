'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  BarChart3, 
  Download, 
  Printer, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Users, 
  GraduationCap, 
  CalendarDays, 
  Layers, 
  BookOpen, 
  Percent, 
  Clock, 
  Briefcase, 
  Sparkles, 
  Search,
  Filter,
  FileSpreadsheet,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CustomSelect } from '@/components/ui/custom-select';

interface MetricasGlobais {
  totalDocentes: number;
  totalTurmas: number;
  totalCargaContratada: number;
  totalHorasAlocadas: number;
  eficienciaGeral: number;
  docentesOciosos: number;
  docentesLotados: number;
  ucsCriticas: number;
}

interface RelatorioDocente {
  id: string;
  nome: string;
  email: string;
  tipoContratacao: string;
  cargaContratada: number;
  horasAlocadas: number;
  horasLivres: number;
  taxaOcupacao: number;
  totalAulas: number;
  statusCarga: 'OCIOSO' | 'EQUILIBRADO' | 'LOTADO';
  areas: string[];
  totalCompetencias: number;
}

interface GargaloUC {
  id: string;
  nome: string;
  area: string;
  totalDocentesAptos: number;
  docentesNomes: string[];
  nivelRisco: 'CRITICO' | 'ALERTA' | 'NORMAL';
  motivoRisco: string;
}

interface RelatorioTurma {
  id: string;
  nome: string;
  area: string;
  tipoCurso: string;
  periodo: string;
  dataInicio: string;
  dataTermino: string;
  aulasSemanais: number;
  totalSlots: number;
  slotsPreenchidos: number;
  slotsPendentes: number;
  taxaPreenchimento: number;
  atribuicoes: {
    id: string;
    diaSemana: number;
    horario: string;
    local: string;
    ucNome: string;
    docenteNome: string;
  }[];
}

export default function RelatoriosPage() {
  const [activeTab, setActiveTab] = useState<'ocupacao' | 'gargalos' | 'turmas'>('ocupacao');
  const [loading, setLoading] = useState(true);

  // Estados de dados
  const [metricas, setMetricas] = useState<MetricasGlobais | null>(null);
  const [docentes, setDocentes] = useState<RelatorioDocente[]>([]);
  const [gargalos, setGargalos] = useState<GargaloUC[]>([]);
  const [turmas, setTurmas] = useState<RelatorioTurma[]>([]);
  const [areas, setAreas] = useState<{ id: string; nome: string }[]>([]);

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAreaFilter, setSelectedAreaFilter] = useState('ALL');
  const [selectedStatusCargaFilter, setSelectedStatusCargaFilter] = useState('ALL');
  const [selectedRiscoFilter, setSelectedRiscoFilter] = useState('ALL');

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/relatorios');
      if (res.ok) {
        const data = await res.json();
        setMetricas(data.metricasGlobais);
        setDocentes(data.relatorioDocentes || []);
        setGargalos(data.gargalos || []);
        setTurmas(data.relatorioTurmas || []);
        setAreas(data.areas || []);
      }
    } catch (error) {
      console.error('Erro ao carregar relatórios:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Exportar dados dos Docentes para Excel (CSV formatado com UTF-8 BOM)
  const handleExportDocentesCSV = () => {
    if (docentes.length === 0) return;

    const headers = [
      'Nome do Docente',
      'E-mail Institucional',
      'Tipo de Contrato',
      'Carga Contratada (Horas)',
      'Horas Alocadas',
      'Saldo Livre (Horas)',
      'Taxa de Ocupacao (%)',
      'Slots de Aula',
      'Status da Carga',
      'Areas de Atuacao',
      'Qtd Competencias'
    ];

    const rows = docentes.map((d) => [
      `"${d.nome}"`,
      `"${d.email}"`,
      `"${d.tipoContratacao}"`,
      d.cargaContratada,
      d.horasAlocadas,
      d.horasLivres,
      `${d.taxaOcupacao}%`,
      d.totalAulas,
      `"${d.statusCarga}"`,
      `"${d.areas.join(', ')}"`,
      d.totalCompetencias
    ]);

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio_ocupacao_docente_senai_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Exportar Relatório de Gargalos para Excel (CSV)
  const handleExportGargalosCSV = () => {
    if (gargalos.length === 0) return;

    const headers = [
      'Unidade Curricular (UC)',
      'Area Tecnologica',
      'Nivel de Risco',
      'Docentes Aptos Cadastrados',
      'Professores Habilitados',
      'Diagnostico / Motivo'
    ];

    const rows = gargalos.map((g) => [
      `"${g.nome}"`,
      `"${g.area}"`,
      `"${g.nivelRisco}"`,
      g.totalDocentesAptos,
      `"${g.docentesNomes.join(', ') || 'Nenhum'}"`,
      `"${g.motivoRisco}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio_gargalos_academicos_senai_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  // Filtros aplicados em Docentes
  const filteredDocentes = useMemo(() => {
    return docentes.filter((d) => {
      const matchesSearch =
        d.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesArea =
        selectedAreaFilter === 'ALL' || d.areas.includes(selectedAreaFilter);

      const matchesStatus =
        selectedStatusCargaFilter === 'ALL' || d.statusCarga === selectedStatusCargaFilter;

      return matchesSearch && matchesArea && matchesStatus;
    });
  }, [docentes, searchTerm, selectedAreaFilter, selectedStatusCargaFilter]);

  // Filtros aplicados em Gargalos
  const filteredGargalos = useMemo(() => {
    return gargalos.filter((g) => {
      const matchesSearch =
        g.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.area.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRisco =
        selectedRiscoFilter === 'ALL' || g.nivelRisco === selectedRiscoFilter;

      return matchesSearch && matchesRisco;
    });
  }, [gargalos, searchTerm, selectedRiscoFilter]);

  return (
    <div className="space-y-6 pb-16">
      {/* Header Corporativo SENAI */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 dark:border-neutral-800 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-neutral-100">
              Central de Relatórios & Métricas
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-950/60 text-[#e30613]">
              Painel Executivo SENAI
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-neutral-400 mt-1">
            Auditoria de ocupação docente, diagnóstico de gargalos acadêmicos e exportação de grades para tomada de decisão.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={fetchData}
            variant="outline"
            size="sm"
            className="border-gray-300 dark:border-neutral-700 text-gray-700 dark:text-neutral-300 gap-1.5 text-xs font-medium"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Atualizar Dados
          </Button>

          {activeTab === 'ocupacao' && (
            <Button
              onClick={handleExportDocentesCSV}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold gap-1.5 shadow-sm"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" /> Exportar para Excel (.CSV)
            </Button>
          )}

          {activeTab === 'gargalos' && (
            <Button
              onClick={handleExportGargalosCSV}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold gap-1.5 shadow-sm"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" /> Exportar Gargalos (.CSV)
            </Button>
          )}

          <Button
            onClick={handlePrint}
            variant="outline"
            size="sm"
            className="border-gray-300 dark:border-neutral-700 text-gray-700 dark:text-neutral-300 gap-1.5 text-xs font-medium"
          >
            <Printer className="w-3.5 h-3.5 text-[#e30613]" /> Imprimir / PDF
          </Button>
        </div>
      </div>

      {/* 4 KPI Cards Executivos */}
      {metricas && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Eficiência Geral */}
          <div className="bg-white dark:bg-neutral-900 p-5 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider">
                  Eficiência da Unidade
                </span>
                <div className="text-2xl font-extrabold text-gray-900 dark:text-neutral-100 mt-1">
                  {metricas.eficienciaGeral}%
                </div>
              </div>
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
                <Percent className="w-6 h-6" />
              </div>
            </div>
            <div className="w-full bg-gray-100 dark:bg-neutral-800 h-2.5 rounded-full overflow-hidden mt-3">
              <div
                className="bg-[#e30613] h-full transition-all duration-500"
                style={{ width: `${metricas.eficienciaGeral}%` }}
              />
            </div>
            <span className="text-[11px] text-gray-400 mt-1">
              {metricas.totalHorasAlocadas}h de {metricas.totalCargaContratada}h contratadas
            </span>
          </div>

          {/* Docentes Ociosos */}
          <div className="bg-white dark:bg-neutral-900 p-5 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider">
                Docentes com Saldo Livre
              </span>
              <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                {metricas.docentesOciosos}
              </div>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                Carga horária disponível para novas turmas
              </span>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              <Users className="w-6 h-6" />
            </div>
          </div>

          {/* Docentes no Limite */}
          <div className="bg-white dark:bg-neutral-900 p-5 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider">
                Docentes no Limite (100%)
              </span>
              <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">
                {metricas.docentesLotados}
              </div>
              <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                Carga horária totalmente preenchida
              </span>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          {/* Gargalos Críticos */}
          <div className="bg-white dark:bg-neutral-900 p-5 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider">
                Gargalos Críticos de UCs
              </span>
              <div className="text-2xl font-extrabold text-[#e30613] mt-1">
                {metricas.ucsCriticas}
              </div>
              <span className="text-[11px] text-[#e30613] font-medium">
                UCs sem nenhum professor habilitado
              </span>
            </div>
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 text-[#e30613]">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
        </div>
      )}

      {/* Abas Principais de Relatórios */}
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 dark:border-neutral-800 pb-3">
        <Button
          variant={activeTab === 'ocupacao' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveTab('ocupacao')}
          className={`text-xs font-semibold gap-1.5 ${
            activeTab === 'ocupacao' ? 'bg-[#e30613] hover:bg-[#b7040f] text-white' : ''
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" /> 1. Ocupação & Capacidade Docente
        </Button>
        <Button
          variant={activeTab === 'gargalos' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveTab('gargalos')}
          className={`text-xs font-semibold gap-1.5 ${
            activeTab === 'gargalos' ? 'bg-[#e30613] hover:bg-[#b7040f] text-white' : ''
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" /> 2. Diagnóstico de Gargalos Acadêmicos
        </Button>
        <Button
          variant={activeTab === 'turmas' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveTab('turmas')}
          className={`text-xs font-semibold gap-1.5 ${
            activeTab === 'turmas' ? 'bg-[#e30613] hover:bg-[#b7040f] text-white' : ''
          }`}
        >
          <CalendarDays className="w-3.5 h-3.5" /> 3. Grades Consolidadas de Turmas
        </Button>
      </div>

      {/* Barra de Filtros */}
      <div className="bg-white dark:bg-neutral-900 p-4 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm space-y-3">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 items-center">
          {/* Busca Textual */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-neutral-500 pointer-events-none" />
            <Input
              type="text"
              placeholder="Buscar por professor, disciplina ou área..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 text-xs h-10 rounded-xl"
            />
          </div>

          {activeTab === 'ocupacao' && (
            <>
              {/* Filtro por Área Tecnológica */}
              <div>
                <CustomSelect
                  value={selectedAreaFilter}
                  onChange={setSelectedAreaFilter}
                  icon={Layers}
                  options={[
                    { value: 'ALL', label: 'Todas as Áreas Tecnológicas' },
                    ...areas.map((a) => ({ value: a.nome, label: a.nome })),
                  ]}
                />
              </div>

              {/* Filtro por Status da Carga */}
              <div>
                <CustomSelect
                  value={selectedStatusCargaFilter}
                  onChange={setSelectedStatusCargaFilter}
                  icon={Clock}
                  options={[
                    { value: 'ALL', label: 'Todos os Níveis de Carga' },
                    { value: 'OCIOSO', label: 'Com Saldo Livre (< 60%)' },
                    { value: 'EQUILIBRADO', label: 'Equilibrado (60% - 99%)' },
                    { value: 'LOTADO', label: 'No Limite (100%)' },
                  ]}
                />
              </div>
            </>
          )}

          {activeTab === 'gargalos' && (
            <div>
              <CustomSelect
                value={selectedRiscoFilter}
                onChange={setSelectedRiscoFilter}
                icon={AlertCircle}
                options={[
                  { value: 'ALL', label: 'Todos os Níveis de Risco' },
                  { value: 'CRITICO', label: 'Risco Crítico (0 Docentes)' },
                  { value: 'ALERTA', label: 'Alerta (Apenas 1 Docente)' },
                  { value: 'NORMAL', label: 'Quadro Normal (2+ Docentes)' },
                ]}
              />
            </div>
          )}
        </div>
      </div>

      {/* Conteúdo das Abas */}
      {loading ? (
        <div className="bg-white dark:bg-neutral-900 rounded-xl p-16 text-center border border-gray-200 dark:border-neutral-800">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-red-600 border-t-transparent mb-3" />
          <p className="text-sm font-medium text-gray-500 dark:text-neutral-400">
            Gerando relatórios consolidados...
          </p>
        </div>
      ) : activeTab === 'ocupacao' ? (
        /* ========================================================================= */
        /* ABA 1: OCUPAÇÃO & CAPACIDADE DOCENTE */
        /* ========================================================================= */
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-gray-100 dark:border-neutral-800 flex items-center justify-between text-xs">
            <span className="font-bold text-gray-900 dark:text-neutral-100">
              Relatório de Ocupação Docente ({filteredDocentes.length} professores listados)
            </span>
            <span className="text-gray-400">
              Cada slot de aula na grade = ~4h semanais
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600 dark:text-neutral-400">
              <thead className="bg-gray-50 dark:bg-neutral-800/60 text-gray-900 dark:text-neutral-100 font-semibold border-b border-gray-200 dark:border-neutral-800">
                <tr>
                  <th className="py-3.5 px-6">Docente</th>
                  <th className="py-3.5 px-6">Regime de Contrato</th>
                  <th className="py-3.5 px-6">Carga Contratada</th>
                  <th className="py-3.5 px-6">Horas Alocadas</th>
                  <th className="py-3.5 px-6">Saldo Livre</th>
                  <th className="py-3.5 px-6">Capacidade / Ocupação</th>
                  <th className="py-3.5 px-6 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-neutral-800">
                {filteredDocentes.map((d) => (
                  <tr key={d.id} className="hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-colors">
                    <td className="py-4 px-6 font-bold text-gray-900 dark:text-neutral-100">
                      <div>
                        <span>{d.nome}</span>
                        <span className="block text-[11px] text-gray-400 font-normal font-mono">
                          {d.email}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-semibold text-gray-700 dark:text-neutral-300">
                      {d.tipoContratacao}
                    </td>
                    <td className="py-4 px-6 font-bold text-gray-900 dark:text-neutral-100">
                      {d.cargaContratada}h / sem
                    </td>
                    <td className="py-4 px-6 font-extrabold text-[#e30613]">
                      {d.horasAlocadas}h ({d.totalAulas} aulas)
                    </td>
                    <td className="py-4 px-6 font-bold text-emerald-600 dark:text-emerald-400">
                      {d.horasLivres}h livres
                    </td>
                    <td className="py-4 px-6 min-w-[180px]">
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="font-bold">{d.taxaOcupacao}%</span>
                        <span className="text-gray-400">{d.horasAlocadas}h / {d.cargaContratada}h</span>
                      </div>
                      <div className="w-full bg-gray-100 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            d.taxaOcupacao >= 100
                              ? 'bg-red-600'
                              : d.taxaOcupacao >= 60
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${d.taxaOcupacao}%` }}
                        />
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          d.statusCarga === 'LOTADO'
                            ? 'bg-red-50 text-red-700 border-red-200/60 dark:bg-red-950/40 dark:text-red-300'
                            : d.statusCarga === 'OCIOSO'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-300'
                            : 'bg-blue-50 text-blue-700 border-blue-200/60 dark:bg-blue-950/40 dark:text-blue-300'
                        }`}
                      >
                        {d.statusCarga === 'LOTADO' && 'Lotado (100%)'}
                        {d.statusCarga === 'OCIOSO' && 'Saldo Disponível'}
                        {d.statusCarga === 'EQUILIBRADO' && 'Equilibrado'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === 'gargalos' ? (
        /* ========================================================================= */
        /* ABA 2: DIAGNÓSTICO DE GARGALOS ACADÊMICOS */
        /* ========================================================================= */
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-gray-100 dark:border-neutral-800 flex items-center justify-between text-xs">
            <span className="font-bold text-gray-900 dark:text-neutral-100">
              Diagnóstico de Unidades Curriculares e Docentes Habilitados ({filteredGargalos.length} UCs)
            </span>
            <span className="text-gray-400">
              Alerta de risco acadêmico e necessidade de contratação
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600 dark:text-neutral-400">
              <thead className="bg-gray-50 dark:bg-neutral-800/60 text-gray-900 dark:text-neutral-100 font-semibold border-b border-gray-200 dark:border-neutral-800">
                <tr>
                  <th className="py-3.5 px-6">Unidade Curricular (UC)</th>
                  <th className="py-3.5 px-6">Área Tecnológica</th>
                  <th className="py-3.5 px-6 text-center">Nível de Risco</th>
                  <th className="py-3.5 px-6">Professores Habilitados</th>
                  <th className="py-3.5 px-6">Diagnóstico / Ação Recomendada</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-neutral-800">
                {filteredGargalos.map((g) => (
                  <tr key={g.id} className="hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-colors">
                    <td className="py-4 px-6 font-bold text-gray-900 dark:text-neutral-100">
                      {g.nome}
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/60">
                        {g.area}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          g.nivelRisco === 'CRITICO'
                            ? 'bg-red-100 text-red-800 border-red-300 dark:bg-red-950 dark:text-red-300'
                            : g.nivelRisco === 'ALERTA'
                            ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300'
                        }`}
                      >
                        {g.nivelRisco === 'CRITICO' && <XCircle className="w-3 h-3 text-red-600" />}
                        {g.nivelRisco === 'ALERTA' && <AlertTriangle className="w-3 h-3 text-amber-600" />}
                        {g.nivelRisco === 'NORMAL' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                        {g.nivelRisco}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-semibold text-gray-800 dark:text-neutral-200">
                        {g.totalDocentesAptos === 0 ? (
                          <span className="text-red-600 font-bold">0 professores</span>
                        ) : (
                          <span>{g.docentesNomes.join(', ')}</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-[11px] text-gray-500 dark:text-neutral-400">
                      {g.motivoRisco}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* ABA 3: GRADES CONSOLIDADAS DE TURMAS */
        /* ========================================================================= */
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {turmas.map((t) => (
              <div
                key={t.id}
                className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 p-5 shadow-sm space-y-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-neutral-100 text-sm">
                        {t.nome}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-neutral-400">
                        {t.area} • Turno {t.periodo}
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-50 text-[#e30613] border border-red-200/60">
                      {t.tipoCurso}
                    </span>
                  </div>

                  {/* Barra de Progresso da Turma */}
                  <div className="mt-4 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500 text-[11px]">Atribuição da Grade:</span>
                      <span className="font-extrabold text-gray-900 dark:text-neutral-100">
                        {t.taxaPreenchimento}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-neutral-800 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-[#e30613] h-full rounded-full transition-all"
                        style={{ width: `${t.taxaPreenchimento}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-gray-400">
                      <span>{t.slotsPreenchidos} atribuídas</span>
                      <span>{t.slotsPendentes} pendentes</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 dark:border-neutral-800 text-[11px] text-gray-500 flex items-center justify-between">
                  <span>Vigência: {new Date(t.dataInicio).toLocaleDateString('pt-BR')} a {new Date(t.dataTermino).toLocaleDateString('pt-BR')}</span>
                  <span className="font-bold text-gray-800 dark:text-neutral-200">{t.totalSlots} aulas</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
