'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  Calendar, 
  ShieldCheck, 
  UserCheck, 
  Layers, 
  BookOpen, 
  CalendarDays, 
  Download, 
  Printer, 
  RefreshCw, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  FileSpreadsheet,
  Users,
  Activity,
  ListFilter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CustomSelect } from '@/components/ui/custom-select';

interface LogItem {
  id: string;
  dataHora: string;
  usuario: string;
  perfil: string;
  modulo: 'TURMAS' | 'ATRIBUICOES' | 'DOCENTES' | 'AREAS' | 'SEGURANCA';
  acao: string;
  detalhes: string;
  tipo: 'CRIACAO' | 'EDICAO' | 'EXCLUSAO' | 'ATRIBUICAO' | 'SEGURANCA';
}

interface MetricasAuditoria {
  totalEventos: number;
  atribuicoesEventos: number;
  alteracoesGrade: number;
  acoesSeguranca: number;
}

export default function AuditoriaPage() {
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [metricas, setMetricas] = useState<MetricasAuditoria | null>(null);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModulo, setSelectedModulo] = useState('ALL');
  const [viewMode, setViewMode] = useState<'timeline' | 'table'>('timeline');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/auditoria');
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
        setMetricas(data.metricas || null);
      }
    } catch (error) {
      console.error('Erro ao carregar logs de auditoria:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Exportar Logs para Excel (.CSV formatado)
  const handleExportCSV = () => {
    if (logs.length === 0) return;

    const headers = [
      'Data e Hora',
      'Usuario / Operador',
      'Perfil RBAC',
      'Modulo do Sistema',
      'Acao Registrada',
      'Tipo de Operacao',
      'Detalhes Completos'
    ];

    const rows = logs.map((l) => [
      `"${new Date(l.dataHora).toLocaleString('pt-BR')}"`,
      `"${l.usuario}"`,
      `"${l.perfil}"`,
      `"${l.modulo}"`,
      `"${l.acao}"`,
      `"${l.tipo}"`,
      `"${l.detalhes}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `auditoria_gestao_senai_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  // Filtragem dos Logs
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesSearch =
        log.acao.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.detalhes.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.usuario.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesModulo = selectedModulo === 'ALL' || log.modulo === selectedModulo;

      return matchesSearch && matchesModulo;
    });
  }, [logs, searchTerm, selectedModulo]);

  return (
    <div className="space-y-6 pb-16">
      {/* Header Corporativo SENAI */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 dark:border-neutral-800 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-neutral-100">
              Painel de Auditoria & Histórico de Ações
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-950/60 text-[#e30613]">
              Rastreabilidade SENAI
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-neutral-400 mt-1">
            Registro cronológico e imutável de todas as atribuições de aulas, cadastros, alterações de grade e ações de segurança.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={fetchLogs}
            variant="outline"
            size="sm"
            className="border-gray-300 dark:border-neutral-700 text-gray-700 dark:text-neutral-300 gap-1.5 text-xs font-medium"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Atualizar
          </Button>

          <Button
            onClick={handleExportCSV}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold gap-1.5 shadow-sm"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" /> Exportar Logs (.CSV)
          </Button>

          <Button
            onClick={handlePrint}
            variant="outline"
            size="sm"
            className="border-gray-300 dark:border-neutral-700 text-gray-700 dark:text-neutral-300 gap-1.5 text-xs font-medium"
          >
            <Printer className="w-3.5 h-3.5 text-[#e30613]" /> Imprimir
          </Button>
        </div>
      </div>

      {/* 4 KPI Cards de Auditoria */}
      {metricas && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white dark:bg-neutral-900 p-5 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider">
                Total de Eventos
              </span>
              <div className="text-2xl font-extrabold text-gray-900 dark:text-neutral-100 mt-1">
                {metricas.totalEventos}
              </div>
              <span className="text-[11px] text-gray-400 font-medium">Ações rastreadas na unidade</span>
            </div>
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
              <Activity className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-900 p-5 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider">
                Atribuições de Aulas
              </span>
              <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                {metricas.atribuicoesEventos}
              </div>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                Vínculos docente x turma
              </span>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              <CalendarDays className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-900 p-5 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider">
                Turmas & Estrutura
              </span>
              <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">
                {metricas.alteracoesGrade}
              </div>
              <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                Turmas, áreas e disciplinas
              </span>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
              <Layers className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-900 p-5 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider">
                Segurança & Acessos
              </span>
              <div className="text-2xl font-extrabold text-[#e30613] mt-1">
                {metricas.acoesSeguranca}
              </div>
              <span className="text-[11px] text-[#e30613] font-medium">Contas e senhas auditadas</span>
            </div>
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 text-[#e30613]">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </div>
        </div>
      )}

      {/* Barra de Filtros & Alternador de Visualização */}
      <div className="bg-white dark:bg-neutral-900 p-4 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm space-y-3">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 items-center">
          {/* Busca Textual */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-neutral-500 pointer-events-none" />
            <Input
              type="text"
              placeholder="Buscar por ação, operador, professor ou turma..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 text-xs h-10 rounded-xl"
            />
          </div>

          {/* Filtro por Módulo */}
          <div>
            <CustomSelect
              value={selectedModulo}
              onChange={setSelectedModulo}
              icon={ListFilter}
              options={[
                { value: 'ALL', label: 'Todos os Módulos' },
                { value: 'ATRIBUICOES', label: 'Atribuições & Grade' },
                { value: 'TURMAS', label: 'Cadastro de Turmas' },
                { value: 'DOCENTES', label: 'Corpo Docente' },
                { value: 'AREAS', label: 'Áreas Tecnológicas & UCs' },
                { value: 'SEGURANCA', label: 'Segurança & Usuários' },
              ]}
            />
          </div>

          {/* Alternador Timeline vs Tabela */}
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-neutral-800 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('timeline')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                viewMode === 'timeline'
                  ? 'bg-white dark:bg-neutral-900 text-gray-900 dark:text-neutral-100 shadow-xs'
                  : 'text-gray-500 hover:text-gray-800 dark:hover:text-neutral-200'
              }`}
            >
              Linha do Tempo
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-neutral-900 text-gray-900 dark:text-neutral-100 shadow-xs'
                  : 'text-gray-500 hover:text-gray-800 dark:hover:text-neutral-200'
              }`}
            >
              Tabela de Logs
            </button>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      {loading ? (
        <div className="bg-white dark:bg-neutral-900 rounded-xl p-16 text-center border border-gray-200 dark:border-neutral-800">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-red-600 border-t-transparent mb-3" />
          <p className="text-sm font-medium text-gray-500 dark:text-neutral-400">
            Consultando registros de auditoria...
          </p>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="bg-white dark:bg-neutral-900 rounded-xl p-16 text-center border border-gray-200 dark:border-neutral-800 space-y-2">
          <History className="w-10 h-10 text-gray-300 dark:text-neutral-600 mx-auto" />
          <h3 className="font-bold text-gray-800 dark:text-neutral-200 text-sm">Nenhum registro encontrado</h3>
          <p className="text-xs text-gray-500 dark:text-neutral-400">Tente ajustar seus termos de busca ou filtro de módulo.</p>
        </div>
      ) : viewMode === 'timeline' ? (
        /* ========================================================================= */
        /* MODO 1: LINHA DO TEMPO CRONOLÓGICA (TIMELINE) */
        /* ========================================================================= */
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 p-6 shadow-sm">
          <div className="relative pl-6 sm:pl-8 border-l-2 border-red-200 dark:border-neutral-800 space-y-6">
            {filteredLogs.map((log) => (
              <div key={log.id} className="relative group">
                {/* Marcador na linha do tempo */}
                <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-4 h-4 rounded-full bg-white dark:bg-neutral-900 border-4 border-[#e30613] group-hover:scale-125 transition-transform" />

                <div className="p-4 rounded-xl border border-gray-100 dark:border-neutral-800 bg-gray-50/50 dark:bg-neutral-800/40 hover:bg-white dark:hover:bg-neutral-800/80 transition-all space-y-2 shadow-2xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                          log.modulo === 'ATRIBUICOES'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300'
                            : log.modulo === 'SEGURANCA'
                            ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300'
                            : log.modulo === 'TURMAS'
                            ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300'
                            : 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300'
                        }`}
                      >
                        {log.modulo}
                      </span>
                      <h3 className="font-bold text-gray-900 dark:text-neutral-100 text-xs sm:text-sm">
                        {log.acao}
                      </h3>
                    </div>

                    <span className="text-[11px] font-semibold text-gray-400">
                      {new Date(log.dataHora).toLocaleString('pt-BR')}
                    </span>
                  </div>

                  <p className="text-xs text-gray-600 dark:text-neutral-300 leading-relaxed">
                    {log.detalhes}
                  </p>

                  <div className="pt-2 border-t border-gray-100 dark:border-neutral-800/80 flex items-center justify-between text-[11px] text-gray-400">
                    <span>Responsável: <strong className="text-gray-700 dark:text-neutral-300">{log.usuario}</strong> ({log.perfil})</span>
                    <span className="font-mono text-[10px] text-gray-400">ID: {log.id}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* MODO 2: TABELA DE AUDITORIA CORPORATIVA */
        /* ========================================================================= */
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600 dark:text-neutral-400">
              <thead className="bg-gray-50 dark:bg-neutral-800/60 text-gray-900 dark:text-neutral-100 font-semibold border-b border-gray-200 dark:border-neutral-800">
                <tr>
                  <th className="py-3.5 px-6">Data e Hora</th>
                  <th className="py-3.5 px-6">Operador / Perfil</th>
                  <th className="py-3.5 px-6">Módulo</th>
                  <th className="py-3.5 px-6">Ação Realizada</th>
                  <th className="py-3.5 px-6">Detalhes do Evento</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-neutral-800">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-colors">
                    <td className="py-4 px-6 font-mono text-[11px] text-gray-900 dark:text-neutral-100 whitespace-nowrap">
                      {new Date(log.dataHora).toLocaleString('pt-BR')}
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-bold text-gray-900 dark:text-neutral-100 block">{log.usuario}</span>
                      <span className="text-[10px] text-gray-400 uppercase font-semibold">{log.perfil}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-neutral-300">
                        {log.modulo}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-semibold text-gray-900 dark:text-neutral-100">
                      {log.acao}
                    </td>
                    <td className="py-4 px-6 text-[11px] text-gray-500 dark:text-neutral-400 max-w-md">
                      {log.detalhes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
