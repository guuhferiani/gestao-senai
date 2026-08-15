'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  GraduationCap,
  Users,
  Layers,
  Calendar,
  Clock,
  Printer,
  Search,
  CheckCircle2,
  AlertTriangle,
  FileText,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  CalendarDays,
  Sparkles,
  Info,
  ChevronDown,
  Check,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface FAQItem {
  pergunta: string;
  resposta: string;
  categoria: 'gestor' | 'docente' | 'geral';
}

const FAQS: FAQItem[] = [
  {
    pergunta: 'Como funciona a validação de disponibilidade para docentes que saem às 21h30 no período noturno?',
    resposta: 'No cadastro/edição do Docente (Aba 2 - Contrato & Turnos), você pode marcar apenas os primeiros blocos de 45 min da noite (ex: 18h45 às 21h30 - 1ª à 3ª aula). Na Matriz de Atribuição, o sistema valida automaticamente o horário da turma: se a turma tiver aula após as 21h30, o docente será listado como Indisponível/Ocupado para evitar choques de agenda.',
    categoria: 'gestor',
  },
  {
    pergunta: 'Por que uma Unidade Curricular (UC) não aparece para eu atribuir a um professor?',
    resposta: 'O sistema aplica a regra de elegibilidade técnica do SENAI: um docente só pode ministrar UCs que estejam cadastradas como competências em seu perfil. Para liberar a UC para o docente, acesse "Corpo Docente", clique em "Editar" (✏️) no docente desejado, vá na Aba 3 (Áreas & Competências) e marque a UC correspondente.',
    categoria: 'gestor',
  },
  {
    pergunta: 'Como o sistema calcula as horas semanais e o total de horas das turmas?',
    resposta: 'O sistema utiliza o Padrão Oficial SENAI em Horas: ao marcar os dias letivos (ex: Segunda a Sexta = 5 dias), o sistema calcula automaticamente 20 horas semanais (5 dias × 4h/dia). Ao selecionar o Tipo de Curso, sugere a carga padrão (Técnico = 1.200h, CAI = 800h, FIC = 160h), podendo ser ajustada livremente pelo gestor.',
    categoria: 'gestor',
  },
  {
    pergunta: 'O que os docentes conseguem visualizar no sistema?',
    resposta: 'Docentes possuem acesso exclusivo à sua "Agenda Individual" e à página "Minha Agenda". Eles podem visualizar suas turmas, horários de aula, salas/ambientes pedagógicos e o saldo de horas contratadas vs programadas, sem permissão para alterar turmas ou dados de outros professores.',
    categoria: 'docente',
  },
  {
    pergunta: 'Como evitar conflito de horário ao alocar professores?',
    resposta: 'A "Matriz de Atribuição & Grade" faz a verificação em tempo real: se um professor já estiver alocado em outra turma naquele mesmo dia e horário, ele é bloqueado e sinalizado em Vermelho com o nome da turma concorrente.',
    categoria: 'geral',
  },
];

export default function AjudaPage() {
  const [activeTab, setActiveTab] = useState<'gestor' | 'docente' | 'faq' | 'regras'>('gestor');
  const [searchTerm, setSearchTerm] = useState('');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const handlePrint = () => {
    window.print();
  };

  const filteredFaqs = useMemo(() => {
    if (!searchTerm.trim()) return FAQS;
    const term = searchTerm.toLowerCase();
    return FAQS.filter(
      (f) =>
        f.pergunta.toLowerCase().includes(term) ||
        f.resposta.toLowerCase().includes(term)
    );
  }, [searchTerm]);

  return (
    <div className="space-y-8 pb-16 max-w-6xl mx-auto">
      {/* ========================================================================= */}
      {/* HEADER DA CENTRAL DE AJUDA */}
      {/* ========================================================================= */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-200 dark:border-neutral-800 pb-6 print:border-none print:pb-2">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-100 dark:bg-red-950/60 text-[#e30613]">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-neutral-100">
                Central de Ajuda & Guia do Usuário
              </h1>
              <p className="text-xs text-gray-500 dark:text-neutral-400 mt-0.5">
                Manuais operacionais, passo a passo de fluxos e orientações oficiais do Padrão SENAI.
              </p>
            </div>
          </div>
        </div>

        {/* Botão de Impressão / PDF */}
        <div className="flex items-center gap-2.5 print:hidden">
          <Button
            onClick={handlePrint}
            variant="outline"
            className="text-xs font-semibold gap-2 border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 hover:bg-gray-50 text-gray-700 dark:text-neutral-200"
          >
            <Printer className="w-4 h-4 text-gray-500" />
            Imprimir / Salvar em PDF
          </Button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* BARRA DE PESQUISA RÁPIDA */}
      {/* ========================================================================= */}
      <div className="relative max-w-2xl print:hidden">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Pesquisar por assunto (ex: cadastrar docente, matriz de atribuição, saída 21h30, carga horária)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 h-11 text-xs rounded-xl bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-800 shadow-xs"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600"
          >
            Limpar
          </button>
        )}
      </div>

      {/* ========================================================================= */}
      {/* ABAS DE NAVEGAÇÃO DA AJUDA */}
      {/* ========================================================================= */}
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 dark:border-neutral-800 pb-3 print:hidden">
        <button
          onClick={() => setActiveTab('gestor')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'gestor'
              ? 'bg-[#e30613] text-white shadow-sm'
              : 'bg-gray-100 dark:bg-neutral-900 text-gray-600 dark:text-neutral-400 hover:bg-gray-200'
          }`}
        >
          <Users className="w-4 h-4" />
          Trilha do Gestor (Coordenador & OPP)
        </button>

        <button
          onClick={() => setActiveTab('docente')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'docente'
              ? 'bg-[#e30613] text-white shadow-sm'
              : 'bg-gray-100 dark:bg-neutral-900 text-gray-600 dark:text-neutral-400 hover:bg-gray-200'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          Trilha do Docente
        </button>

        <button
          onClick={() => setActiveTab('regras')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'regras'
              ? 'bg-[#e30613] text-white shadow-sm'
              : 'bg-gray-100 dark:bg-neutral-900 text-gray-600 dark:text-neutral-400 hover:bg-gray-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Regras de Negócio & Padrão SENAI
        </button>

        <button
          onClick={() => setActiveTab('faq')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'faq'
              ? 'bg-[#e30613] text-white shadow-sm'
              : 'bg-gray-100 dark:bg-neutral-900 text-gray-600 dark:text-neutral-400 hover:bg-gray-200'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          Perguntas Frequentes (FAQ)
        </button>
      </div>

      {/* ========================================================================= */}
      {/* CONTEÚDO: 1. TRILHA DO GESTOR (COORDENADOR E OPP) */}
      {/* ========================================================================= */}
      {(activeTab === 'gestor' || searchTerm) && (
        <div className="space-y-6">
          <div className="bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-2xl p-5">
            <h2 className="text-base font-bold text-gray-900 dark:text-neutral-100 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#e30613] text-white text-xs font-bold flex items-center justify-center">
                ★
              </span>
              Guia Completo do Gestor: Fluxo de Planejamento Acadêmico
            </h2>
            <p className="text-xs text-gray-600 dark:text-neutral-300 mt-1">
              Siga os 5 passos sequenciais abaixo para estruturar cursos, cadastrar docentes, programar turmas e realizar atribuições inteligentes sem conflitos.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5">
            {/* PASSO 1: ÁREAS E UCS */}
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-200 dark:border-neutral-800 p-6 shadow-xs space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-700 font-bold flex items-center justify-center text-sm">
                    1
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-neutral-100 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-blue-600" />
                      Estruturar Áreas Tecnológicas & Unidades Curriculares (UCs)
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-neutral-400 mt-0.5">
                      Base acadêmica para cursos e competências da unidade.
                    </p>
                  </div>
                </div>
                <Link
                  href="/areas"
                  className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1 print:hidden"
                >
                  Acessar Módulo &rarr;
                </Link>
              </div>

              <div className="text-xs text-gray-600 dark:text-neutral-300 space-y-2 leading-relaxed bg-gray-50 dark:bg-neutral-800/40 p-4 rounded-xl">
                <p><strong>Como executar:</strong></p>
                <ol className="list-decimal list-inside space-y-1.5 pl-1">
                  <li>Acesse o menu <strong>Áreas & UCs</strong> na barra lateral.</li>
                  <li>Clique em <strong>+ Nova Área</strong> para registrar os segmentos (ex: <em>Tecnologia da Informação</em>, <em>Mecânica Automotiva</em>, <em>Metalmecânica</em>).</li>
                  <li>Clique em <strong>+ Nova UC</strong> para cadastrar as disciplinas (ex: <em>Lógica de Programação</em>, <em>Metrologia</em>), selecionando a Área Tecnológica correspondente.</li>
                </ol>
                <div className="p-2 rounded bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/30 text-[11px] text-blue-800 dark:text-blue-300 flex items-center gap-1.5 mt-2">
                  <Info className="w-3.5 h-3.5 shrink-0" />
                  <span><strong>Importante:</strong> Não é permitido excluir uma Área que possua UCs vinculadas.</span>
                </div>
              </div>
            </div>

            {/* PASSO 2: CORPO DOCENTE */}
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-200 dark:border-neutral-800 p-6 shadow-xs space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 font-bold flex items-center justify-center text-sm">
                    2
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-neutral-100 flex items-center gap-2">
                      <Users className="w-4 h-4 text-purple-600" />
                      Cadastrar Docente, Competências & Horários de 45m
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-neutral-400 mt-0.5">
                      Definição de contrato, disciplinas habilitadas e disponibilidade semanal detalhada.
                    </p>
                  </div>
                </div>
                <Link
                  href="/docentes"
                  className="text-xs font-semibold text-purple-600 hover:underline flex items-center gap-1 print:hidden"
                >
                  Acessar Módulo &rarr;
                </Link>
              </div>

              <div className="text-xs text-gray-600 dark:text-neutral-300 space-y-2 leading-relaxed bg-gray-50 dark:bg-neutral-800/40 p-4 rounded-xl">
                <p><strong>Configuração em 3 Etapas:</strong></p>
                <ul className="list-disc list-inside space-y-1.5 pl-1">
                  <li><strong>Aba 1 (Dados Básicos):</strong> Nome completo, e-mail institucional e senha de acesso.</li>
                  <li><strong>Aba 2 (Contrato & Horários Granulares):</strong>
                    <ul className="list-circle list-inside pl-4 mt-1 space-y-1 text-gray-500 dark:text-neutral-400">
                      <li>Carga horária contratada (ex: 40h) e tipo de contratação (CLT ou Horista).</li>
                      <li><strong>Grade Semanal de 45 min:</strong> Marque os blocos exatos em que o docente pode lecionar (Manhã: 07:30–11:45 | Tarde: 13:15–17:30 | Noite: 18:45–22:30).</li>
                      <li><em>Docentes com saída até 21h30:</em> Marque apenas da 1ª à 3ª aula noturna. O sistema não o alocará em turmas que se estendem até 22h30.</li>
                    </ul>
                  </li>
                  <li><strong>Aba 3 (Áreas & Competências - UCs):</strong> Selecione a Área Tecnológica e marque as UCs que o docente tem habilitação técnica para lecionar.</li>
                </ul>
              </div>
            </div>

            {/* PASSO 3: TURMAS */}
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-200 dark:border-neutral-800 p-6 shadow-xs space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 font-bold flex items-center justify-center text-sm">
                    3
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-neutral-100 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-amber-600" />
                      Cadastrar Turmas & Matriz Curricular em Horas
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-neutral-400 mt-0.5">
                      Configuração de vigência, carga horária no padrão SENAI e seleção de UCs.
                    </p>
                  </div>
                </div>
                <Link
                  href="/turmas"
                  className="text-xs font-semibold text-amber-600 hover:underline flex items-center gap-1 print:hidden"
                >
                  Acessar Módulo &rarr;
                </Link>
              </div>

              <div className="text-xs text-gray-600 dark:text-neutral-300 space-y-2 leading-relaxed bg-gray-50 dark:bg-neutral-800/40 p-4 rounded-xl">
                <p><strong>Configuração da Turma:</strong></p>
                <ol className="list-decimal list-inside space-y-1.5 pl-1">
                  <li><strong>Aba 1 (Identificação):</strong> Nome da turma, Área Tecnológica, Orientador (OPP) responsável e <strong>Tipo de Curso</strong> (Técnico: 1200h | CAI: 800h | FIC: 160h).</li>
                  <li><strong>Aba 2 (Calendário & Horários):</strong> Datas de início e término, período (Manhã, Tarde ou Noite) e dias letivos da semana (ex: Seg a Sex calcula automaticamente 20h semanais).</li>
                  <li><strong>Aba 3 (Plano Curricular):</strong> Marque todas as UCs que farão parte da grade desta turma. O sistema criará os slots necessários para atribuição.</li>
                </ol>
              </div>
            </div>

            {/* PASSO 4: MATRIZ DE ATRIBUIÇÃO */}
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-200 dark:border-neutral-800 p-6 shadow-xs space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 font-bold flex items-center justify-center text-sm">
                    4
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-neutral-100 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      Atribuição Inteligente de UCs & Prevenção de Conflitos
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-neutral-400 mt-0.5">
                      Alocação de professores com base em competência, disponibilidade e carga livre.
                    </p>
                  </div>
                </div>
                <Link
                  href="/atribuicoes"
                  className="text-xs font-semibold text-emerald-600 hover:underline flex items-center gap-1 print:hidden"
                >
                  Acessar Módulo &rarr;
                </Link>
              </div>

              <div className="text-xs text-gray-600 dark:text-neutral-300 space-y-2 leading-relaxed bg-gray-50 dark:bg-neutral-800/40 p-4 rounded-xl">
                <p><strong>Como o Painel Inteligente opera:</strong></p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 my-2">
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                    <span className="font-bold text-emerald-800 dark:text-emerald-300 block mb-1">
                      🟢 Docentes Disponíveis (Verde)
                    </span>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                      Possui competência técnica na UC + Horário livre no turno + Sem choque de agenda com outras turmas. Botão <strong>"Designar"</strong> liberado.
                    </p>
                  </div>

                  <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl">
                    <span className="font-bold text-red-800 dark:text-red-300 block mb-1">
                      🔴 Docentes Ocupados / Indisponíveis (Vermelho)
                    </span>
                    <p className="text-[11px] text-red-700 dark:text-red-400">
                      Indica exatamente o motivo do bloqueio (ex: <em>"Já alocado na Turma X no mesmo horário"</em> ou <em>"Horário restrito até 21h30"</em>).
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* PASSO 5: OCUPAÇÃO E RELATÓRIOS */}
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-200 dark:border-neutral-800 p-6 shadow-xs space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-neutral-800 text-gray-800 dark:text-neutral-200 font-bold flex items-center justify-center text-sm">
                    5
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-neutral-100 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-600" />
                      Acompanhamento de Ocupação & Relatórios Gerenciais
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-neutral-400 mt-0.5">
                      Monitoramento da taxa de ocupação docente e saldo de horas em tempo real.
                    </p>
                  </div>
                </div>
                <Link
                  href="/relatorios"
                  className="text-xs font-semibold text-gray-700 dark:text-neutral-300 hover:underline flex items-center gap-1 print:hidden"
                >
                  Acessar Módulo &rarr;
                </Link>
              </div>

              <div className="text-xs text-gray-600 dark:text-neutral-300 space-y-2 leading-relaxed bg-gray-50 dark:bg-neutral-800/40 p-4 rounded-xl">
                <p>
                  Acesse <strong>Relatórios</strong> para visualizar:
                </p>
                <ul className="list-disc list-inside space-y-1 pl-1">
                  <li><strong>Taxa de Ocupação (%):</strong> Comparativo entre horas contratadas e horas programadas em sala.</li>
                  <li><strong>Docentes Subutilizados vs Sobrecarregados:</strong> Identifique professores com horas livres para novas turmas.</li>
                  <li><strong>Exportação em CSV/PDF:</strong> Gere relatórios executivos para reuniões de planejamento pedagógico.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CONTEÚDO: 2. TRILHA DO DOCENTE */}
      {/* ========================================================================= */}
      {(activeTab === 'docente' || (searchTerm && activeTab !== 'gestor')) && (
        <div className="space-y-6">
          <div className="bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 rounded-2xl p-5">
            <h2 className="text-base font-bold text-gray-900 dark:text-neutral-100 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-blue-600" />
              Guia Prático para o Corpo Docente
            </h2>
            <p className="text-xs text-gray-600 dark:text-neutral-300 mt-1">
              Como o professor visualiza sua agenda, turmas atribuídas e horários de aula na unidade SENAI.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-200 dark:border-neutral-800 p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-blue-600 font-bold text-xs">
                <CalendarDays className="w-4 h-4" />
                <span>1. Como acessar sua Agenda Individual</span>
              </div>
              <p className="text-xs text-gray-600 dark:text-neutral-300 leading-relaxed">
                Ao fazer login com seu e-mail e senha institucional, acesse <strong>Minha Agenda</strong> no menu lateral ou clique no seu nome no Corpo Docente.
              </p>
              <ul className="text-xs text-gray-500 dark:text-neutral-400 space-y-1 list-disc list-inside pl-1">
                <li>Visão semanal com grade de horários de 45 minutos.</li>
                <li>Visão em calendário mensal com todos os dias letivos.</li>
                <li>Exportação da grade para impressão.</li>
              </ul>
            </div>

            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-200 dark:border-neutral-800 p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs">
                <Clock className="w-4 h-4" />
                <span>2. Informações de cada Aula</span>
              </div>
              <p className="text-xs text-gray-600 dark:text-neutral-300 leading-relaxed">
                Cada evento na sua agenda apresenta detalhes operacionais:
              </p>
              <ul className="text-xs text-gray-500 dark:text-neutral-400 space-y-1 list-disc list-inside pl-1">
                <li><strong>Turma:</strong> Identificador do curso (ex: <em>Técnico em Des. de Sistemas</em>).</li>
                <li><strong>Unidade Curricular (UC):</strong> Disciplina a ser ministrada.</li>
                <li><strong>Horário & Turno:</strong> Ex: <em>07h30 às 11h45 (Manhã)</em>.</li>
                <li><strong>Orientador (OPP):</strong> Coordenador/OPP de referência da área.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CONTEÚDO: 3. REGRAS DE NEGÓCIO & PADRÃO SENAI */}
      {/* ========================================================================= */}
      {activeTab === 'regras' && (
        <div className="space-y-5 bg-white dark:bg-neutral-900 rounded-2xl border border-gray-200 dark:border-neutral-800 p-6 shadow-xs">
          <div className="border-b border-gray-100 dark:border-neutral-800 pb-4">
            <h2 className="text-base font-bold text-gray-900 dark:text-neutral-100 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#e30613]" />
              Regras de Negócio & Padrões Oficiais
            </h2>
            <p className="text-xs text-gray-500 dark:text-neutral-400 mt-1">
              Princípios pedagógicos e diretrizes de alocação institucional do SENAI.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-neutral-800/50 border border-gray-200 dark:border-neutral-700/60 space-y-2">
              <span className="font-bold text-gray-900 dark:text-neutral-100 block">
                1. Habilitação Técnica Obrigatória
              </span>
              <p className="text-gray-600 dark:text-neutral-300">
                O docente só pode ser atribuído a uma UC se possuir a respectiva competência cadastrada em seu perfil técnico.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-gray-50 dark:bg-neutral-800/50 border border-gray-200 dark:border-neutral-700/60 space-y-2">
              <span className="font-bold text-gray-900 dark:text-neutral-100 block">
                2. Bloqueio Automático de Conflitos
              </span>
              <p className="text-gray-600 dark:text-neutral-300">
                É proibida a sobreposição de horários: nenhum docente pode estar em duas turmas no mesmo dia e intervalo de horário.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-gray-50 dark:bg-neutral-800/50 border border-gray-200 dark:border-neutral-700/60 space-y-2">
              <span className="font-bold text-gray-900 dark:text-neutral-100 block">
                3. Dimensionamento em Carga Horária (Horas)
              </span>
              <p className="text-gray-600 dark:text-neutral-300">
                O planejamento de turmas e contratos segue a matriz curricular oficial em horas (Técnicos 1200h, CAI 800h, FIC 160h).
              </p>
            </div>

            <div className="p-4 rounded-xl bg-gray-50 dark:bg-neutral-800/50 border border-gray-200 dark:border-neutral-700/60 space-y-2">
              <span className="font-bold text-gray-900 dark:text-neutral-100 block">
                4. Granularidade de 45 min & Saídas Especiais
              </span>
              <p className="text-gray-600 dark:text-neutral-300">
                A disponibilidade semanal é dividida em blocos de aula de 45 minutos com intervalos oficiais (Manhã 15m, Tarde 15m, Noite 15m) e suporte a docentes noturnos com saída às 21h30.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CONTEÚDO: 4. PERGUNTAS FREQUENTES (FAQ) */}
      {/* ========================================================================= */}
      {(activeTab === 'faq' || searchTerm) && (
        <div className="space-y-4">
          <div className="border-b border-gray-200 dark:border-neutral-800 pb-3">
            <h2 className="text-base font-bold text-gray-900 dark:text-neutral-100 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-[#e30613]" />
              Perguntas Frequentes (FAQ)
            </h2>
            <p className="text-xs text-gray-500 dark:text-neutral-400 mt-0.5">
              Dúvidas comuns sobre o uso diário e operações pedagógicas.
            </p>
          </div>

          <div className="space-y-2.5">
            {filteredFaqs.length === 0 ? (
              <div className="p-8 text-center bg-gray-50 dark:bg-neutral-900 rounded-2xl border border-gray-200 dark:border-neutral-800 text-xs text-gray-500">
                Nenhum tópico encontrado para o termo pesquisado.
              </div>
            ) : (
              filteredFaqs.map((faq, index) => {
                const isOpen = openFaqIndex === index;
                return (
                  <div
                    key={index}
                    className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 overflow-hidden shadow-2xs transition-all"
                  >
                    <button
                      onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                      className="w-full flex items-center justify-between p-4 text-left font-semibold text-xs text-gray-900 dark:text-neutral-100 hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-colors"
                    >
                      <span className="pr-4">{faq.pergunta}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-gray-400 transition-transform duration-200 shrink-0 ${
                          isOpen ? 'rotate-180 text-[#e30613]' : ''
                        }`}
                      />
                    </button>

                    {isOpen && (
                      <div className="px-4 pb-4 pt-1 text-xs text-gray-600 dark:text-neutral-300 border-t border-gray-100 dark:border-neutral-800/80 leading-relaxed bg-gray-50/50 dark:bg-neutral-800/30">
                        {faq.resposta}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
