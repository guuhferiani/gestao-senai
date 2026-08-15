'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  BookOpen, 
  Layers, 
  Plus, 
  Search, 
  Pencil, 
  Trash2, 
  AlertTriangle,
  AlertCircle,
  BarChart2,
  Filter,
  Loader2,
  FolderPlus,
  FilePlus,
  CheckCircle2,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatCard } from '@/components/dashboard/stat-card';
import { CustomSelect } from '@/components/ui/custom-select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';

interface UnidadeCurricular {
  id: string;
  nome: string;
  areaId: string;
  area?: {
    id: string;
    nome: string;
  };
}

interface AreaTecnologica {
  id: string;
  nome: string;
  unidadesCurriculares: UnidadeCurricular[];
  _count?: {
    unidadesCurriculares: number;
    docentes: number;
  };
}

export default function AreasPage() {
  const [areas, setAreas] = useState<AreaTecnologica[]>([]);
  const [ucs, setUcs] = useState<UnidadeCurricular[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAreaFilter, setSelectedAreaFilter] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState<'areas' | 'ucs'>('areas');

  // Modais State
  const [isAreaModalOpen, setIsAreaModalOpen] = useState(false);
  const [editingArea, setEditingArea] = useState<AreaTecnologica | null>(null);
  const [areaNome, setAreaNome] = useState('');

  const [isUcModalOpen, setIsUcModalOpen] = useState(false);
  const [editingUc, setEditingUc] = useState<UnidadeCurricular | null>(null);
  const [ucNome, setUcNome] = useState('');
  const [ucAreaId, setUcAreaId] = useState('');

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'area' | 'uc'; item: AreaTecnologica | UnidadeCurricular } | null>(null);
  const [deleteError, setDeleteError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Carregar dados
  const fetchData = async () => {
    try {
      setLoading(true);
      const [resAreas, resUcs] = await Promise.all([
        fetch('/api/areas'),
        fetch('/api/ucs')
      ]);

      if (resAreas.ok) {
        const dataAreas = await resAreas.json();
        setAreas(dataAreas);
      }
      if (resUcs.ok) {
        const dataUcs = await resUcs.json();
        setUcs(dataUcs);
      }
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showFeedback = (type: 'success' | 'error', text: string) => {
    setFeedbackMessage({ type, text });
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  // Handler Área
  const handleOpenAreaModal = (area?: AreaTecnologica) => {
    if (area) {
      setEditingArea(area);
      setAreaNome(area.nome);
    } else {
      setEditingArea(null);
      setAreaNome('');
    }
    setIsAreaModalOpen(true);
  };

  const handleSaveArea = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!areaNome.trim()) return;

    setIsSubmitting(true);
    try {
      const url = editingArea ? `/api/areas/${editingArea.id}` : '/api/areas';
      const method = editingArea ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: areaNome })
      });

      const data = await res.json();

      if (!res.ok) {
        showFeedback('error', data.error || 'Erro ao salvar Área Tecnológica.');
        return;
      }

      showFeedback('success', editingArea ? 'Área Tecnológica atualizada com sucesso!' : 'Área Tecnológica criada com sucesso!');
      setIsAreaModalOpen(false);
      fetchData();
    } catch (err) {
      showFeedback('error', 'Erro interno ao salvar.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler UC
  const handleOpenUcModal = (uc?: UnidadeCurricular, defaultAreaId?: string) => {
    if (uc) {
      setEditingUc(uc);
      setUcNome(uc.nome);
      setUcAreaId(uc.areaId);
    } else {
      setEditingUc(null);
      setUcNome('');
      setUcAreaId(defaultAreaId || '');
    }
    setIsUcModalOpen(true);
  };

  const handleSaveUc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ucNome.trim() || !ucAreaId) return;

    setIsSubmitting(true);
    try {
      const url = editingUc ? `/api/ucs/${editingUc.id}` : '/api/ucs';
      const method = editingUc ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: ucNome, areaId: ucAreaId })
      });

      const data = await res.json();

      if (!res.ok) {
        showFeedback('error', data.error || 'Erro ao salvar Unidade Curricular.');
        return;
      }

      showFeedback('success', editingUc ? 'Unidade Curricular atualizada!' : 'Unidade Curricular cadastrada!');
      setIsUcModalOpen(false);
      fetchData();
    } catch (err) {
      showFeedback('error', 'Erro interno ao salvar.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler Delete
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    setIsSubmitting(true);
    setDeleteError('');

    try {
      const endpoint = deleteTarget.type === 'area' ? `/api/areas/${deleteTarget.item.id}` : `/api/ucs/${deleteTarget.item.id}`;
      const res = await fetch(endpoint, { method: 'DELETE' });
      const data = await res.json();

      if (!res.ok) {
        setDeleteError(data.error || 'Erro ao excluir.');
        return;
      }

      showFeedback('success', deleteTarget.type === 'area' ? 'Área excluída com sucesso!' : 'Unidade Curricular excluída!');
      setDeleteTarget(null);
      fetchData();
    } catch (err) {
      setDeleteError('Erro de conexão ao excluir.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtros de busca
  const filteredAreas = useMemo(() => {
    if (!searchTerm.trim()) return areas;
    const term = searchTerm.toLowerCase();
    return areas.filter(a => 
      a.nome.toLowerCase().includes(term) ||
      a.unidadesCurriculares.some(uc => uc.nome.toLowerCase().includes(term))
    );
  }, [areas, searchTerm]);

  const filteredUcs = useMemo(() => {
    return ucs.filter(uc => {
      const matchesArea = selectedAreaFilter === 'ALL' || uc.areaId === selectedAreaFilter;
      const matchesSearch = !searchTerm.trim() || 
        uc.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        uc.area?.nome.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesArea && matchesSearch;
    });
  }, [ucs, searchTerm, selectedAreaFilter]);

  const areasSemUcsCount = useMemo(() => {
    return areas.filter(a => !a.unidadesCurriculares || a.unidadesCurriculares.length === 0).length;
  }, [areas]);

  const mediaUcsPorArea = useMemo(() => {
    if (areas.length === 0) return '0';
    return (ucs.length / areas.length).toFixed(1);
  }, [areas, ucs]);

  return (
    <div className="space-y-6">
      
      {/* Toast Notification */}
      {feedbackMessage && (
        <div className={`fixed top-20 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border text-sm font-medium transition-all animate-in fade-in slide-in-from-top-4 ${
          feedbackMessage.type === 'success' 
            ? 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200' 
            : 'bg-red-50 dark:bg-red-950/80 border-red-300 dark:border-red-800 text-red-800 dark:text-red-200'
        }`}>
          {feedbackMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> : <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />}
          <span>{feedbackMessage.text}</span>
          <button onClick={() => setFeedbackMessage(null)} className="ml-2 hover:opacity-70">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-neutral-100">
            Gestão de Áreas & UCs
          </h1>
          <p className="text-sm text-gray-500 dark:text-neutral-400">
            Estrutura acadêmica de Áreas Tecnológicas e Unidades Curriculares da unidade SENAI.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            onClick={() => handleOpenAreaModal()} 
            className="bg-gray-800 hover:bg-gray-900 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-white gap-2 font-medium"
          >
            <FolderPlus className="w-4 h-4" />
            Nova Área
          </Button>

          <Button 
            onClick={() => handleOpenUcModal()} 
            className="bg-[#e30613] hover:bg-[#b7040f] text-white gap-2 font-semibold shadow-sm"
          >
            <FilePlus className="w-4 h-4" />
            Nova UC
          </Button>
        </div>
      </div>

      {/* Metric Cards (4 Grid) */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Áreas Tecnológicas"
          value={areas.length}
          icon={Layers}
          description="Segmentos técnicos cadastrados"
        />
        <StatCard
          title="Unidades Curriculares"
          value={ucs.length}
          icon={BookOpen}
          description="Disciplinas ativas no sistema"
        />
        <StatCard
          title="Média UCs / Área"
          value={mediaUcsPorArea}
          icon={BarChart2}
          description="Média de disciplinas por segmento"
        />
        <StatCard
          title="Áreas sem UCs"
          value={areasSemUcsCount}
          icon={AlertCircle}
          description="Necessitam cadastro de UCs"
        />
      </div>

      {/* Search and Tabs */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-gray-200 dark:border-neutral-800 pb-4">
        <div className="flex items-center gap-2 bg-gray-100 dark:bg-neutral-900 p-1 rounded-lg w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('areas')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
              activeTab === 'areas'
                ? 'bg-white dark:bg-neutral-800 text-gray-900 dark:text-neutral-100 shadow-sm'
                : 'text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-neutral-200'
            }`}
          >
            Visão por Áreas ({filteredAreas.length})
          </button>
          <button
            onClick={() => setActiveTab('ucs')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
              activeTab === 'ucs'
                ? 'bg-white dark:bg-neutral-800 text-gray-900 dark:text-neutral-100 shadow-sm'
                : 'text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-neutral-200'
            }`}
          >
            Lista de UCs ({filteredUcs.length})
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
          {activeTab === 'ucs' && (
            <div className="w-full sm:w-60">
              <CustomSelect
                value={selectedAreaFilter}
                onChange={setSelectedAreaFilter}
                icon={Layers}
                options={[
                  { value: 'ALL', label: 'Todas as Áreas Tecnológicas' },
                  ...areas.map((a) => ({ value: a.id, label: a.nome })),
                ]}
              />
            </div>
          )}

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-neutral-500" />
            <Input
              type="text"
              placeholder="Buscar Área ou UC..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-800 h-10 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-500 dark:text-neutral-400">
          <Loader2 className="w-8 h-8 animate-spin text-[#D31900]" />
          <span className="text-sm">Carregando estrutura acadêmica...</span>
        </div>
      ) : activeTab === 'areas' ? (
        /* ÁREAS VIEW */
        filteredAreas.length === 0 ? (
          <div className="bg-white dark:bg-neutral-900 rounded-xl p-12 text-center border border-gray-200 dark:border-neutral-800 text-gray-500 dark:text-neutral-400 space-y-3">
            <Layers className="w-12 h-12 mx-auto text-gray-400 dark:text-neutral-600" />
            <p className="font-medium text-base text-gray-700 dark:text-neutral-300">Nenhuma Área Tecnológica encontrada</p>
            <p className="text-xs">Cadastre a primeira Área Tecnológica para começar a estruturar os cursos.</p>
            <Button onClick={() => handleOpenAreaModal()} className="bg-[#D31900] hover:bg-[#B71500] text-white text-xs mt-2">
              + Criar Área Tecnológica
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {filteredAreas.map((area) => (
              <div 
                key={area.id}
                className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
              >
                <div>
                  {/* Card Header */}
                  <div className="p-5 border-b border-gray-100 dark:border-neutral-800/60 flex items-center justify-between bg-gray-50/50 dark:bg-neutral-900/50">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-lg bg-red-50 dark:bg-red-950/40 text-[#D31900]">
                        <Layers className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-neutral-100 text-base">{area.nome}</h3>
                        <span className="text-xs text-gray-500 dark:text-neutral-400">
                          {area.unidadesCurriculares?.length || 0} Unidade(s) Curricular(es)
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenAreaModal(area)}
                        className="p-2 text-gray-500 hover:text-gray-800 dark:text-neutral-400 dark:hover:text-neutral-200 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-md transition-colors"
                        title="Editar Área"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget({ type: 'area', item: area })}
                        className="p-2 text-gray-400 hover:text-red-600 dark:text-neutral-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md transition-colors"
                        title="Excluir Área"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* List of UCs in Area */}
                  <div className="p-5 space-y-2">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-neutral-500">UCs Vinculadas</span>
                      <button
                        onClick={() => handleOpenUcModal(undefined, area.id)}
                        className="text-xs font-medium text-[#D31900] hover:underline flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> Add UC
                      </button>
                    </div>

                    {area.unidadesCurriculares && area.unidadesCurriculares.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {area.unidadesCurriculares.map((uc) => (
                          <div 
                            key={uc.id} 
                            className="group/uc flex items-center gap-2 px-3 py-1.5 rounded-md bg-gray-100 dark:bg-neutral-800 text-gray-800 dark:text-neutral-200 text-xs font-medium border border-gray-200/60 dark:border-neutral-700/60"
                          >
                            <span>{uc.nome}</span>
                            <button
                              onClick={() => handleOpenUcModal(uc)}
                              className="text-gray-400 hover:text-gray-700 dark:hover:text-neutral-100"
                              title="Editar UC"
                            >
                              <Pencil className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => setDeleteTarget({ type: 'uc', item: uc })}
                              className="text-gray-400 hover:text-red-500"
                              title="Excluir UC"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 dark:text-neutral-500 italic py-2">Nenhuma UC vinculada a esta área.</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* UCS TABLE VIEW */
        filteredUcs.length === 0 ? (
          <div className="bg-white dark:bg-neutral-900 rounded-xl p-12 text-center border border-gray-200 dark:border-neutral-800 text-gray-500 dark:text-neutral-400 space-y-3">
            <BookOpen className="w-12 h-12 mx-auto text-gray-400 dark:text-neutral-600" />
            <p className="font-medium text-base text-gray-700 dark:text-neutral-300">Nenhuma Unidade Curricular encontrada</p>
            <p className="text-xs">Cadastre a primeira UC vinculada a uma Área Tecnológica.</p>
            <Button onClick={() => handleOpenUcModal()} className="bg-[#D31900] hover:bg-[#B71500] text-white text-xs mt-2">
              + Criar Unidade Curricular
            </Button>
          </div>
        ) : (
          <div className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 dark:bg-neutral-800/60 border-b border-gray-200 dark:border-neutral-800 text-gray-500 dark:text-neutral-400 uppercase text-[11px] font-semibold tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Nome da UC</th>
                    <th className="px-6 py-4">Área Tecnológica</th>
                    <th className="px-6 py-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-neutral-800">
                  {filteredUcs.map((uc) => (
                    <tr key={uc.id} className="hover:bg-gray-50/60 dark:hover:bg-neutral-800/40 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-neutral-100">
                        {uc.nome}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-red-50 dark:bg-red-950/40 text-[#D31900]">
                          {uc.area?.nome || 'Não informada'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenUcModal(uc)}
                            className="p-1.5 text-gray-500 hover:text-gray-800 dark:text-neutral-400 dark:hover:text-neutral-200 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-md transition-colors"
                            title="Editar"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget({ type: 'uc', item: uc })}
                            className="p-1.5 text-gray-400 hover:text-red-600 dark:text-neutral-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md transition-colors"
                            title="Excluir"
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
        )
      )}

      {/* MODAL ÁREA (Criar / Editar) */}
      <Dialog open={isAreaModalOpen} onOpenChange={setIsAreaModalOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-800">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-neutral-100 font-bold text-lg flex items-center gap-2">
              <FolderPlus className="w-5 h-5 text-[#D31900]" />
              {editingArea ? 'Editar Área Tecnológica' : 'Nova Área Tecnológica'}
            </DialogTitle>
            <DialogDescription className="text-gray-500 dark:text-neutral-400 text-xs">
              Cadastre as Áreas que agrupam as Unidades Curriculares da unidade.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveArea} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 dark:text-neutral-300">
                Nome da Área Tecnológica
              </label>
              <Input
                type="text"
                placeholder="Ex: Tecnologia da Informação, Metalmecânica..."
                value={areaNome}
                onChange={(e) => setAreaNome(e.target.value)}
                required
                className="bg-gray-50 dark:bg-neutral-800 border-gray-200 dark:border-neutral-700"
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <DialogClose render={<Button type="button" variant="outline" className="border-gray-300 dark:border-neutral-700 text-gray-700 dark:text-neutral-300">Cancelar</Button>} />
              <Button type="submit" disabled={isSubmitting || !areaNome.trim()} className="bg-[#D31900] hover:bg-[#B71500] text-white font-semibold">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : editingArea ? 'Salvar Alterações' : 'Criar Área'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL UC (Criar / Editar) */}
      <Dialog open={isUcModalOpen} onOpenChange={setIsUcModalOpen}>
        <DialogContent className="sm:max-w-[450px] bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-800">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-neutral-100 font-bold text-lg flex items-center gap-2">
              <FilePlus className="w-5 h-5 text-[#D31900]" />
              {editingUc ? 'Editar Unidade Curricular' : 'Nova Unidade Curricular'}
            </DialogTitle>
            <DialogDescription className="text-gray-500 dark:text-neutral-400 text-xs">
              Toda UC deve obrigatoriamente estar associada a uma Área Tecnológica.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveUc} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 dark:text-neutral-300">
                Nome da Unidade Curricular
              </label>
              <Input
                type="text"
                placeholder="Ex: Lógica de Programação, Metrologia..."
                value={ucNome}
                onChange={(e) => setUcNome(e.target.value)}
                required
                className="bg-gray-50 dark:bg-neutral-800 border-gray-200 dark:border-neutral-700"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 dark:text-neutral-300">
                Área Tecnológica <span className="text-red-500">*</span>
              </label>
              <CustomSelect
                value={ucAreaId}
                onChange={setUcAreaId}
                icon={Layers}
                placeholder="Selecione uma Área Tecnológica..."
                options={areas.map((a) => ({ value: a.id, label: a.nome }))}
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <DialogClose render={<Button type="button" variant="outline" className="border-gray-300 dark:border-neutral-700 text-gray-700 dark:text-neutral-300">Cancelar</Button>} />
              <Button type="submit" disabled={isSubmitting || !ucNome.trim() || !ucAreaId} className="bg-[#D31900] hover:bg-[#B71500] text-[#FFFFFF] font-semibold">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : editingUc ? 'Salvar Alterações' : 'Criar UC'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL CONFIRMAÇÃO DE EXCLUSÃO */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-[425px] bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-800">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-neutral-100 font-bold text-lg flex items-center gap-2 text-red-600 dark:text-red-500">
              <AlertTriangle className="w-5 h-5" />
              Confirmar Exclusão
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-neutral-300 text-sm pt-2">
              Tem certeza que deseja excluir {deleteTarget?.type === 'area' ? 'a Área Tecnológica' : 'a Unidade Curricular'}{' '}
              <strong className="text-gray-900 dark:text-neutral-100">"{deleteTarget?.item.nome}"</strong>?
            </DialogDescription>
          </DialogHeader>

          {deleteError && (
            <div className="p-3 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 rounded-md text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
              <span>{deleteError}</span>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => { setDeleteTarget(null); setDeleteError(''); }}
              className="border-gray-300 dark:border-neutral-700 text-gray-700 dark:text-neutral-300"
            >
              Cancelar
            </Button>
            <Button 
              type="button" 
              onClick={handleDeleteConfirm}
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirmar Exclusão'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
