'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { 
  Users, 
  ShieldCheck, 
  ShieldAlert,
  Plus, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Edit, 
  Trash2, 
  KeyRound, 
  UserCog, 
  Lock, 
  Mail, 
  Sparkles, 
  AlertCircle, 
  RefreshCw,
  LayoutGrid,
  List,
  Eye,
  GraduationCap,
  Briefcase,
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

interface UsuarioItem {
  id: string;
  nome: string;
  email: string;
  nif?: string | null;
  perfil: 'COORDENADOR' | 'SECRETARIA' | 'OPP' | 'DOCENTE';
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
  docente?: {
    id: string;
    tipoContratacao: string;
    cargaHorariaContratada: number;
    areas: { area: { id: string; nome: string } }[];
  } | null;
}

export default function UsuariosPage() {
  const { data: session, status } = useSession();
  const userPerfil = (session?.user as any)?.perfil;

  const [usuarios, setUsuarios] = useState<UsuarioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPerfilFilter, setSelectedPerfilFilter] = useState('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Métricas
  const [metricas, setMetricas] = useState({
    total: 0,
    coordenadores: 0,
    secretaria: 0,
    opps: 0,
    docentes: 0,
  });

  // Modais
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState<UsuarioItem | null>(null);

  // Form de Cadastro / Edição
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    nif: '',
    senha: '',
    perfil: 'DOCENTE' as 'COORDENADOR' | 'SECRETARIA' | 'OPP' | 'DOCENTE',
    ativo: true,
  });

  // Form de Redefinição de Senha
  const [novaSenha, setNovaSenha] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const isAuthorized = userPerfil === 'COORDENADOR' || userPerfil === 'SECRETARIA';

  const fetchUsuarios = async () => {
    if (!isAuthorized && status !== 'loading') return;
    try {
      setLoading(true);
      const res = await fetch('/api/usuarios');
      if (res.ok) {
        const data = await res.json();
        setUsuarios(data.usuarios || []);
        setMetricas(data.metricas || {
          total: 0,
          coordenadores: 0,
          secretaria: 0,
          opps: 0,
          docentes: 0,
        });
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated' && isAuthorized) {
      fetchUsuarios();
    }
  }, [status, userPerfil, isAuthorized]);

  const showFeedback = (type: 'success' | 'error', text: string) => {
    setFeedbackMessage({ type, text });
    setTimeout(() => setFeedbackMessage(null), 5000);
  };

  // Abrir Modal de Novo Usuário
  const handleOpenNew = () => {
    setSelectedUsuario(null);
    setFormData({
      nome: '',
      email: '',
      nif: '',
      senha: '',
      perfil: 'DOCENTE',
      ativo: true,
    });
    setIsModalOpen(true);
  };

  // Abrir Modal de Edição
  const handleOpenEdit = (usuario: UsuarioItem) => {
    setSelectedUsuario(usuario);
    setFormData({
      nome: usuario.nome,
      email: usuario.email,
      nif: usuario.nif || '',
      senha: '',
      perfil: usuario.perfil,
      ativo: usuario.ativo,
    });
    setIsModalOpen(true);
  };

  // Abrir Modal de Redefinição de Senha
  const handleOpenPasswordReset = (usuario: UsuarioItem) => {
    setSelectedUsuario(usuario);
    setNovaSenha('');
    setIsPasswordModalOpen(true);
  };

  // Submeter Cadastro / Edição
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const url = selectedUsuario ? `/api/usuarios/${selectedUsuario.id}` : '/api/usuarios';
      const method = selectedUsuario ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        showFeedback('error', data.error || 'Erro ao salvar usuário.');
        return;
      }

      showFeedback('success', selectedUsuario ? 'Usuário atualizado com sucesso!' : 'Novo usuário cadastrado com sucesso!');
      setIsModalOpen(false);
      await fetchUsuarios();
    } catch (error: any) {
      showFeedback('error', error.message || 'Erro inesperado.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submeter Redefinição de Senha
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUsuario) return;
    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/usuarios/${selectedUsuario.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ novaSenha }),
      });

      const data = await res.json();

      if (!res.ok) {
        showFeedback('error', data.error || 'Erro ao redefinir senha.');
        return;
      }

      showFeedback('success', `Senha do usuário "${selectedUsuario.nome}" redefinida com sucesso!`);
      setIsPasswordModalOpen(false);
    } catch (error: any) {
      showFeedback('error', error.message || 'Erro inesperado.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Alternar Status Ativo / Inativo
  const handleToggleStatus = async (usuario: UsuarioItem) => {
    try {
      const res = await fetch(`/api/usuarios/${usuario.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ativo: !usuario.ativo }),
      });

      if (res.ok) {
        showFeedback('success', `Status de "${usuario.nome}" alterado para ${!usuario.ativo ? 'Ativo' : 'Inativo'}.`);
        await fetchUsuarios();
      }
    } catch (error: any) {
      showFeedback('error', error.message || 'Erro ao alterar status.');
    }
  };

  // Excluir Usuário
  const handleDeleteSubmit = async () => {
    if (!selectedUsuario) return;
    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/usuarios/${selectedUsuario.id}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (!res.ok) {
        showFeedback('error', data.error || 'Erro ao excluir usuário.');
        return;
      }

      showFeedback('success', data.message || 'Usuário excluído com sucesso.');
      setIsDeleteModalOpen(false);
      await fetchUsuarios();
    } catch (error: any) {
      showFeedback('error', error.message || 'Erro inesperado.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtragem
  const filteredUsuarios = useMemo(() => {
    return usuarios.filter((u) => {
      const matchesSearch =
        u.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.nif && u.nif.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesPerfil = selectedPerfilFilter === 'ALL' || u.perfil === selectedPerfilFilter;

      const matchesStatus =
        selectedStatusFilter === 'ALL' ||
        (selectedStatusFilter === 'ATIVO' && u.ativo) ||
        (selectedStatusFilter === 'INATIVO' && !u.ativo);

      return matchesSearch && matchesPerfil && matchesStatus;
    });
  }, [usuarios, searchTerm, selectedPerfilFilter, selectedStatusFilter]);

  // Se estiver carregando sessão
  if (status === 'loading') {
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
          A área de <strong>Gestão de Usuários & Acessos</strong> é restrita exclusivamente à <strong>Coordenação</strong> e <strong>Secretaria Administrativa</strong>. Seu perfil atual é <span className="font-bold text-gray-800 dark:text-neutral-200">{userPerfil || 'DOCENTE'}</span>.
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
              Gestão de Usuários & Acessos
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-950/60 text-[#e30613]">
              Controle RBAC SENAI
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-neutral-400 mt-1">
            Administração de contas, perfis de Coordenador, Orientador (OPP) e Docentes com redefinição de senhas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleOpenNew}
            className="bg-[#e30613] hover:bg-[#b7040f] text-white text-xs font-semibold gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" /> Novo Usuário
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

      {/* 5 KPI Cards de Usuários */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {/* Total de Usuários */}
        <div className="bg-white dark:bg-neutral-900 p-4 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider">
              Total de Contas
            </span>
            <div className="text-xl font-extrabold text-gray-900 dark:text-neutral-100 mt-0.5">
              {metricas.total}
            </div>
            <span className="text-[10px] text-gray-500 dark:text-neutral-400 font-medium">
              Contas cadastradas
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/50 text-[#e30613]">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Coordenadores (Admin) */}
        <div className="bg-white dark:bg-neutral-900 p-4 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider">
              Coordenadores
            </span>
            <div className="text-xl font-extrabold text-[#e30613] mt-0.5">
              {metricas.coordenadores}
            </div>
            <span className="text-[10px] text-[#e30613] font-medium">
              Gestão Geral (Admin)
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/50 text-[#e30613]">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        {/* Administrativo (Secretaria) */}
        <div className="bg-white dark:bg-neutral-900 p-4 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider">
              Administrativo
            </span>
            <div className="text-xl font-extrabold text-amber-600 dark:text-amber-400 mt-0.5">
              {metricas.secretaria || 0}
            </div>
            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
              Secretaria & Apoio
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
            <Briefcase className="w-5 h-5" />
          </div>
        </div>

        {/* Orientadores OPP */}
        <div className="bg-white dark:bg-neutral-900 p-4 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider">
              Orientadores (OPP)
            </span>
            <div className="text-xl font-extrabold text-blue-600 dark:text-blue-400 mt-0.5">
              {metricas.opps}
            </div>
            <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">
              Gestão de turmas
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
            <UserCog className="w-5 h-5" />
          </div>
        </div>

        {/* Docentes */}
        <div className="bg-white dark:bg-neutral-900 p-4 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider">
              Docentes
            </span>
            <div className="text-xl font-extrabold text-purple-600 dark:text-purple-400 mt-0.5">
              {metricas.docentes}
            </div>
            <span className="text-[10px] text-purple-600 dark:text-purple-400 font-medium">
              Acesso à agenda
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
            <GraduationCap className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="bg-white dark:bg-neutral-900 p-4 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm space-y-3">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 items-center">
          {/* Busca Textual */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-neutral-500 pointer-events-none" />
            <Input
              type="text"
              placeholder="Buscar por nome ou e-mail..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 text-xs h-10 rounded-xl"
            />
          </div>

          {/* Filtro por Perfil */}
          <div>
            <CustomSelect
              value={selectedPerfilFilter}
              onChange={setSelectedPerfilFilter}
              icon={ShieldCheck}
              options={[
                { value: 'ALL', label: 'Todos os Perfis de Acesso' },
                { value: 'COORDENADOR', label: 'Coordenador' },
                { value: 'SECRETARIA', label: 'Administrativo' },
                { value: 'OPP', label: 'Orientador (OPP)' },
                { value: 'DOCENTE', label: 'Docente' },
              ]}
            />
          </div>

          {/* Filtro por Status */}
          <div>
            <CustomSelect
              value={selectedStatusFilter}
              onChange={setSelectedStatusFilter}
              icon={CheckCircle2}
              options={[
                { value: 'ALL', label: 'Todos os Status' },
                { value: 'ATIVO', label: 'Apenas Ativos' },
                { value: 'INATIVO', label: 'Apenas Inativos' },
              ]}
            />
          </div>

          {/* Alternador de Visualização Tabela / Grade */}
          <div className="flex items-center justify-end gap-1.5">
            <Button
              variant={viewMode === 'table' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('table')}
              className={`h-10 text-xs font-semibold gap-1.5 ${
                viewMode === 'table' ? 'bg-[#e30613] hover:bg-[#b7040f] text-white' : ''
              }`}
            >
              <List className="w-3.5 h-3.5" /> Tabela
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className={`h-10 text-xs font-semibold gap-1.5 ${
                viewMode === 'grid' ? 'bg-[#e30613] hover:bg-[#b7040f] text-white' : ''
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> Cards
            </Button>
          </div>
        </div>
      </div>

      {/* Visualização dos Usuários */}
      {loading ? (
        <div className="bg-white dark:bg-neutral-900 rounded-xl p-16 text-center border border-gray-200 dark:border-neutral-800">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-red-600 border-t-transparent mb-3" />
          <p className="text-sm font-medium text-gray-500 dark:text-neutral-400">
            Carregando usuários e permissões de acesso...
          </p>
        </div>
      ) : filteredUsuarios.length === 0 ? (
        <div className="bg-white dark:bg-neutral-900 rounded-xl p-12 text-center border border-gray-200 dark:border-neutral-800 space-y-3">
          <Users className="w-12 h-12 mx-auto text-gray-300 dark:text-neutral-700" />
          <p className="text-base font-bold text-gray-800 dark:text-neutral-200">
            Nenhum usuário encontrado
          </p>
          <p className="text-xs text-gray-500 dark:text-neutral-400">
            Tente alterar os filtros ou cadastre um novo usuário clicando no botão acima.
          </p>
        </div>
      ) : viewMode === 'table' ? (
        /* VISÃO EM TABELA */
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600 dark:text-neutral-400">
              <thead className="bg-gray-50 dark:bg-neutral-800/60 text-gray-900 dark:text-neutral-100 font-semibold border-b border-gray-200 dark:border-neutral-800">
                <tr>
                  <th className="py-3.5 px-6">Usuário</th>
                  <th className="py-3.5 px-6">E-mail Institucional</th>
                  <th className="py-3.5 px-6">Perfil de Acesso</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-neutral-800">
                {filteredUsuarios.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-colors">
                    {/* Nome + Avatar */}
                    <td className="py-4 px-6 font-bold text-gray-900 dark:text-neutral-100">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-full font-bold flex items-center justify-center text-xs shrink-0 ${
                            u.perfil === 'COORDENADOR'
                              ? 'bg-red-100 dark:bg-red-950/60 text-[#e30613]'
                              : u.perfil === 'SECRETARIA'
                              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                              : u.perfil === 'OPP'
                              ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                              : 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300'
                          }`}
                        >
                          {u.nome.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span>{u.nome}</span>
                          {u.docente && (
                            <span className="block text-[11px] text-gray-400 font-normal">
                              Docente ({u.docente.tipoContratacao})
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* E-mail & NIF */}
                    <td className="py-4 px-6">
                      <div className="font-mono text-xs text-gray-900 dark:text-neutral-100">{u.email}</div>
                      {u.nif && (
                        <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                          NIF: <span className="font-semibold text-gray-600 dark:text-neutral-400">{u.nif}</span>
                        </div>
                      )}
                    </td>

                    {/* Perfil */}
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                          u.perfil === 'COORDENADOR'
                            ? 'bg-red-50 text-[#e30613] border-red-200/60 dark:bg-red-950/40 dark:border-red-800/40'
                            : u.perfil === 'SECRETARIA'
                            ? 'bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/40'
                            : u.perfil === 'OPP'
                            ? 'bg-blue-50 text-blue-700 border-blue-200/60 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/40'
                            : 'bg-purple-50 text-purple-700 border-purple-200/60 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/40'
                        }`}
                      >
                        {u.perfil === 'COORDENADOR' && <ShieldCheck className="w-3 h-3" />}
                        {u.perfil === 'SECRETARIA' && <Briefcase className="w-3 h-3" />}
                        {u.perfil === 'OPP' && <UserCog className="w-3 h-3" />}
                        {u.perfil === 'DOCENTE' && <GraduationCap className="w-3 h-3" />}
                        {u.perfil === 'SECRETARIA' ? 'ADMINISTRATIVO' : u.perfil}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-6">
                      <button
                        onClick={() => handleToggleStatus(u)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                          u.ativo
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 hover:bg-emerald-100'
                            : 'bg-gray-100 dark:bg-neutral-800 text-gray-500 border border-gray-200 dark:border-neutral-700 hover:bg-gray-200'
                        }`}
                        title="Clique para alternar status"
                      >
                        {u.ativo ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <XCircle className="w-3 h-3" />}
                        {u.ativo ? 'Ativo' : 'Inativo'}
                      </button>
                    </td>

                    {/* Ações */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenPasswordReset(u)}
                          className="p-1.5 text-amber-600 hover:text-amber-800 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-md transition-colors"
                          title="Redefinir Senha de Acesso"
                        >
                          <KeyRound className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(u)}
                          className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-md transition-colors"
                          title="Editar Usuário"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedUsuario(u);
                            setIsDeleteModalOpen(true);
                          }}
                          className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-md transition-colors"
                          title="Excluir Usuário"
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
          {filteredUsuarios.map((u) => (
            <div
              key={u.id}
              className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm p-5 flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full font-bold flex items-center justify-center text-sm shrink-0 ${
                        u.perfil === 'COORDENADOR'
                          ? 'bg-red-100 dark:bg-red-950/60 text-[#e30613]'
                          : u.perfil === 'SECRETARIA'
                          ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                          : u.perfil === 'OPP'
                          ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                          : 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300'
                      }`}
                    >
                      {u.nome.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-neutral-100 text-sm">
                        {u.nome}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-neutral-400 font-mono">
                        {u.email}
                      </p>
                      {u.nif && (
                        <p className="text-[10px] text-gray-400 font-mono">
                          NIF: {u.nif}
                        </p>
                      )}
                    </div>
                  </div>

                  <span
                    className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                      u.ativo ? 'bg-emerald-500' : 'bg-gray-400'
                    }`}
                    title={u.ativo ? 'Ativo' : 'Inativo'}
                  />
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-neutral-800/80 flex items-center justify-between text-xs">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      u.perfil === 'COORDENADOR'
                        ? 'bg-red-50 text-[#e30613] border-red-200/60 dark:bg-red-950/40 dark:border-red-800/40'
                        : u.perfil === 'SECRETARIA'
                        ? 'bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-950/40 dark:text-amber-300'
                        : u.perfil === 'OPP'
                        ? 'bg-blue-50 text-blue-700 border-blue-200/60 dark:bg-blue-950/40 dark:text-blue-300'
                        : 'bg-purple-50 text-purple-700 border-purple-200/60 dark:bg-purple-950/40 dark:text-purple-300'
                    }`}
                  >
                    {u.perfil === 'SECRETARIA' ? 'SECRETARIA' : u.perfil}
                  </span>

                  <span className="text-[11px] text-gray-400">
                    Desde: {new Date(u.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 dark:border-neutral-800 flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenPasswordReset(u)}
                  className="text-[11px] h-7 gap-1"
                >
                  <KeyRound className="w-3 h-3 text-amber-600" /> Senha
                </Button>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenEdit(u)}
                    className="text-blue-600 h-7 w-7 p-0"
                    title="Editar"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedUsuario(u);
                      setIsDeleteModalOpen(true);
                    }}
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
      {/* MODAL DE CADASTRO E EDIÇÃO DE USUÁRIO AMPLO (max-w-2xl) */}
      {/* ========================================================================= */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-xl w-[95vw] p-6">
          <DialogHeader className="border-b border-gray-200 dark:border-neutral-800 pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/50 text-[#e30613]">
                <UserCog className="w-6 h-6" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-gray-900 dark:text-neutral-100">
                  {selectedUsuario ? 'Editar Usuário' : 'Cadastrar Novo Usuário'}
                </DialogTitle>
                <DialogDescription className="text-xs text-gray-500 dark:text-neutral-400 mt-0.5">
                  Configure os dados cadastrais, perfil de acesso e credenciais do usuário.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-3">
            <div>
              <Label htmlFor="nome" className="text-xs font-semibold">
                Nome Completo <span className="text-red-500">*</span>
              </Label>
              <Input
                id="nome"
                placeholder="Ex: Carlos Eduardo da Silva"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                required
                className="mt-1.5 text-xs h-10 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                  className="mt-1.5 text-xs h-10 rounded-xl"
                />
              </div>

              <div>
                <Label htmlFor="nif" className="text-xs font-semibold">
                  NIF / Matrícula SENAI
                </Label>
                <Input
                  id="nif"
                  placeholder="Ex: 1087407"
                  value={formData.nif}
                  onChange={(e) => setFormData({ ...formData, nif: e.target.value })}
                  className="mt-1.5 text-xs h-10 rounded-xl font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="perfil" className="text-xs font-semibold">
                  Perfil de Acesso (Papel) <span className="text-red-500">*</span>
                </Label>
                <div className="mt-1.5">
                  <CustomSelect
                    value={formData.perfil}
                    onChange={(val) => setFormData({ ...formData, perfil: val as any })}
                    icon={ShieldCheck}
                    options={[
                      { value: 'COORDENADOR', label: 'Coordenador' },
                      { value: 'SECRETARIA', label: 'Administrativo' },
                      { value: 'OPP', label: 'Orientador (OPP)' },
                      { value: 'DOCENTE', label: 'Docente' },
                    ]}
                  />
                </div>
              </div>

              {!selectedUsuario && (
                <div>
                  <Label htmlFor="senha" className="text-xs font-semibold">
                    Senha Inicial de Acesso
                  </Label>
                  <Input
                    id="senha"
                    name="senha"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Padrão: senai123"
                    value={formData.senha}
                    onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                    className="mt-1.5 text-xs h-10 rounded-xl font-mono"
                  />
                </div>
              )}
            </div>

            {/* Switch de Ativo / Inativo */}
            <div className="bg-gray-50 dark:bg-neutral-800/40 p-4 rounded-xl border border-gray-200 dark:border-neutral-700 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-gray-900 dark:text-neutral-100 block">
                  Status da Conta
                </span>
                <span className="text-[11px] text-gray-500 dark:text-neutral-400">
                  {formData.ativo ? 'Conta ativa e liberada para login' : 'Conta inativada (acesso bloqueado)'}
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.ativo}
                  onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            <DialogFooter className="pt-3 border-t border-gray-100 dark:border-neutral-800">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="text-xs"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#e30613] hover:bg-[#b7040f] text-white text-xs font-semibold"
              >
                {selectedUsuario ? 'Salvar Alterações' : 'Criar Usuário'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL DE REDEFINIÇÃO DE SENHA */}
      {/* ========================================================================= */}
      <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
        <DialogContent className="sm:max-w-md w-[95vw] p-6">
          <DialogHeader className="border-b border-gray-200 dark:border-neutral-800 pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600">
                <KeyRound className="w-6 h-6" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-gray-900 dark:text-neutral-100">
                  Redefinir Senha
                </DialogTitle>
                <DialogDescription className="text-xs text-gray-500 dark:text-neutral-400 mt-0.5">
                  Usuário: <span className="font-bold text-gray-800 dark:text-neutral-200">{selectedUsuario?.nome}</span>
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handlePasswordSubmit} className="space-y-4 pt-3">
            <div>
              <Label htmlFor="novaSenha" className="text-xs font-semibold">
                Nova Senha de Acesso <span className="text-red-500">*</span>
              </Label>
              <Input
                id="novaSenha"
                name="novaSenha"
                type="password"
                autoComplete="new-password"
                placeholder="Insira a nova senha (mínimo 6 caracteres)"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                required
                className="mt-1.5 text-xs h-10 rounded-xl font-mono"
              />
            </div>

            <DialogFooter className="pt-3 border-t border-gray-100 dark:border-neutral-800">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsPasswordModalOpen(false)}
                className="text-xs"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !novaSenha.trim()}
                className="bg-[#e30613] hover:bg-[#b7040f] text-white text-xs font-semibold"
              >
                Confirmar Nova Senha
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO */}
      {/* ========================================================================= */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-lg md:max-w-xl w-[95vw] p-7 rounded-2xl">
          <DialogHeader className="border-b border-gray-200 dark:border-neutral-800 pb-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-950/60 text-[#e30613] border border-red-100 dark:border-red-900/40">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-gray-900 dark:text-neutral-100">
                  Confirmar Exclusão de Usuário
                </DialogTitle>
                <DialogDescription className="text-xs text-gray-500 dark:text-neutral-400 mt-1">
                  Esta ação é irreversível e removerá as credenciais e acessos do usuário.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="py-4 space-y-3">
            <p className="text-sm text-gray-700 dark:text-neutral-300">
              Tem certeza de que deseja excluir permanentemente o cadastro do colaborador abaixo?
            </p>

            {selectedUsuario && (
              <div className="p-4 rounded-xl border border-gray-200 dark:border-neutral-800 bg-gray-50/70 dark:bg-neutral-800/40 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-gray-900 dark:text-neutral-100">
                    {selectedUsuario.nome}
                  </span>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-red-100 dark:bg-red-950/60 text-[#e30613]">
                    {selectedUsuario.perfil === 'SECRETARIA' ? 'ADMINISTRATIVO' : selectedUsuario.perfil}
                  </span>
                </div>
                <div className="text-xs font-mono text-gray-600 dark:text-neutral-400">
                  {selectedUsuario.email}
                </div>
                {selectedUsuario.nif && (
                  <div className="text-xs text-gray-500 dark:text-neutral-400 font-mono">
                    NIF / Matrícula: <strong className="text-gray-800 dark:text-neutral-200">{selectedUsuario.nif}</strong>
                  </div>
                )}
              </div>
            )}

            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Atenção:</strong> Se o usuário possuir aulas ou turmas atribuídas ativas, será necessário desvinculá-las antes de prosseguir com a exclusão.
              </span>
            </div>
          </div>

          <DialogFooter className="pt-4 border-t border-gray-100 dark:border-neutral-800 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
              className="text-xs h-10 px-5 rounded-xl cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              disabled={isSubmitting}
              onClick={handleDeleteSubmit}
              className="bg-[#e30613] hover:bg-[#b7040f] text-white text-xs font-bold h-10 px-5 rounded-xl cursor-pointer gap-1.5 shadow-sm"
            >
              <Trash2 className="w-4 h-4" />
              {isSubmitting ? 'Excluindo...' : 'Excluir Usuário'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
