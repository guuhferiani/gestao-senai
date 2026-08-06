'use client';

import { useState, useEffect } from 'react';
import { 
  CheckSquare, 
  Square, 
  CheckCircle2, 
  RotateCcw, 
  ListChecks, 
  ShieldCheck, 
  Layers, 
  BookOpen, 
  Search, 
  Sparkles,
  ArrowRight,
  BookmarkCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChecklistItem {
  id: string;
  category: string;
  iconName: string;
  title: string;
  description: string;
  testSteps: string[];
  expectedResult: string;
  completed: boolean;
}

const DEFAULT_CHECKLIST: ChecklistItem[] = [
  // 1. Autenticação
  {
    id: 'auth-1',
    category: '1. Autenticação e Sessão',
    iconName: 'ShieldCheck',
    title: 'Login de Coordenador (Admin)',
    description: 'Verificar se o login de Coordenador funciona com redirecionamento correto.',
    testSteps: [
      'Acessar a página /login',
      'Inserir E-mail: coordenador@sp.senai.br',
      'Inserir Senha: senai123',
      'Clicar em "Entrar"'
    ],
    expectedResult: 'Redirecionar com sucesso para o /dashboard e exibir nome do Coordenador no topo.',
    completed: true,
  },
  {
    id: 'auth-2',
    category: '1. Autenticação e Sessão',
    iconName: 'ShieldCheck',
    title: 'Login de Orientador OPP',
    description: 'Verificar se o login do perfil OPP funciona com sucesso.',
    testSteps: [
      'Acessar /login',
      'Inserir E-mail: opp@sp.senai.br',
      'Inserir Senha: senai123',
      'Clicar em "Entrar"'
    ],
    expectedResult: 'Autenticação bem-sucedida e acesso ao sistema com o perfil OPP.',
    completed: true,
  },
  {
    id: 'auth-3',
    category: '1. Autenticação e Sessão',
    iconName: 'ShieldCheck',
    title: 'Tratamento de Credenciais Inválidas',
    description: 'Garantir mensagem clara de erro ao tentar logar com senha incorreta.',
    testSteps: [
      'Inserir um e-mail cadastrado com senha errada (ex: 123456)',
      'Clicar em "Entrar"'
    ],
    expectedResult: 'Exibir caixa de alerta vermelha com a mensagem: "E-mail ou senha inválidos."',
    completed: true,
  },
  {
    id: 'auth-4',
    category: '1. Autenticação e Sessão',
    iconName: 'ShieldCheck',
    title: 'Encerramento de Sessão (Logout)',
    description: 'Garantir que a sessão do usuário seja limpa ao sair.',
    testSteps: [
      'Estar logado no sistema',
      'No rodapé da Sidebar, clicar no botão "Sair"'
    ],
    expectedResult: 'Encerrar sessão e redirecionar imediatamente para a tela /login.',
    completed: true,
  },

  // 2. Gestão de Áreas
  {
    id: 'areas-1',
    category: '2. Gestão de Áreas Tecnológicas (Seção 1)',
    iconName: 'Layers',
    title: 'Cadastro de Nova Área Tecnológica',
    description: 'Cadastrar um novo segmento tecnológico no sistema.',
    testSteps: [
      'Ir para a tela /areas',
      'Clicar no botão "+ Nova Área"',
      'Preencher Nome: "Automação Industrial"',
      'Clicar em "Criar Área"'
    ],
    expectedResult: 'Área criada com sucesso e adicionada aos cards da tela com 0 UCs vinculadas.',
    completed: true,
  },
  {
    id: 'areas-2',
    category: '2. Gestão de Áreas Tecnológicas (Seção 1)',
    iconName: 'Layers',
    title: 'Bloqueio de Área Duplicada',
    description: 'Garantir que o sistema impeça áreas com nomes repetidos.',
    testSteps: [
      'Clicar no botão "+ Nova Área"',
      'Tentar cadastrar o mesmo nome "Automação Industrial"',
      'Clicar em "Criar Área"'
    ],
    expectedResult: 'Bloqueio da ação com a mensagem: "Já existe uma Área Tecnológica cadastrada com o nome..."',
    completed: true,
  },
  {
    id: 'areas-3',
    category: '2. Gestão de Áreas Tecnológicas (Seção 1)',
    iconName: 'Layers',
    title: 'Edição de Área Tecnológica',
    description: 'Alterar o nome de uma Área Tecnológica existente.',
    testSteps: [
      'No card da área "Automação Industrial", clicar no lápis ✏️',
      'Alterar o nome para "Robótica e Automação"',
      'Clicar em "Salvar Alterações"'
    ],
    expectedResult: 'Nome da área atualizado em tempo real na interface e no banco de dados.',
    completed: true,
  },
  {
    id: 'areas-4',
    category: '2. Gestão de Áreas Tecnológicas (Seção 1)',
    iconName: 'Layers',
    title: 'Bloqueio de Exclusão de Área com UCs',
    description: 'Regra de Negócio: Não é permitida a exclusão de uma Área que possua UCs vinculadas.',
    testSteps: [
      'No card da área "Tecnologia da Informação" (que tem UCs), clicar na lixeira 🗑️',
      'Confirmar exclusão'
    ],
    expectedResult: 'Bloqueio imediato exibindo alerta: "Não é permitida a exclusão de uma Área que possua UCs vinculadas."',
    completed: true,
  },
  {
    id: 'areas-5',
    category: '2. Gestão de Áreas Tecnológicas (Seção 1)',
    iconName: 'Layers',
    title: 'Exclusão de Área Vazia',
    description: 'Permitir excluir apenas áreas que não contêm disciplinas associadas.',
    testSteps: [
      'No card da área "Robótica e Automação" (0 UCs), clicar na lixeira 🗑️',
      'Confirmar exclusão no modal'
    ],
    expectedResult: 'Área excluída com sucesso e removida da interface.',
    completed: true,
  },

  // 3. Gestão de UCs
  {
    id: 'ucs-1',
    category: '3. Unidades Curriculares - UCs (Seção 1)',
    iconName: 'BookOpen',
    title: 'Cadastro de Nova UC vinculada a uma Área',
    description: 'Regra de Negócio: Toda UC deve pertencer obrigatoriamente a uma Área.',
    testSteps: [
      'Ir para /areas e clicar no botão "+ Nova UC"',
      'Nome: "Desenvolvimento Mobile"',
      'Selecionar Área: "Tecnologia da Informação"',
      'Clicar em "Criar UC"'
    ],
    expectedResult: 'UC cadastrada e exibida dentro do card da área de TI.',
    completed: true,
  },
  {
    id: 'ucs-2',
    category: '3. Unidades Curriculares - UCs (Seção 1)',
    iconName: 'BookOpen',
    title: 'Bloqueio de UC Duplicada na mesma Área',
    description: 'Garantir que a mesma área não possua UCs com o mesmo nome.',
    testSteps: [
      'Clicar em "+ Nova UC"',
      'Inserir o mesmo nome "Desenvolvimento Mobile" para a área de TI',
      'Clicar em "Criar UC"'
    ],
    expectedResult: 'Bloqueio com a mensagem: "Já existe uma UC Desenvolvimento Mobile cadastrada na área..."',
    completed: true,
  },
  {
    id: 'ucs-3',
    category: '3. Unidades Curriculares - UCs (Seção 1)',
    iconName: 'BookOpen',
    title: 'Edição e Reassociação de Área da UC',
    description: 'Editar o nome ou alterar a área pertencente da UC.',
    testSteps: [
      'Clicar no lápis ✏️ ao lado da UC "Desenvolvimento Mobile"',
      'Alterar o nome ou trocar para outra Área',
      'Clicar em "Salvar Alterações"'
    ],
    expectedResult: 'Alterações salvas com sucesso e refletidas nos cards e tabelas.',
    completed: true,
  },
  {
    id: 'ucs-4',
    category: '3. Unidades Curriculares - UCs (Seção 1)',
    iconName: 'BookOpen',
    title: 'Exclusão de UC e Atualização de Métricas',
    description: 'Excluir uma UC e verificar recálculo automático das estatísticas.',
    testSteps: [
      'Clicar na lixeira 🗑️ da UC "Desenvolvimento Mobile"',
      'Confirmar exclusão'
    ],
    expectedResult: 'UC excluída e atualização instantânea nos 4 cards de métricas (Total UCs, Média UCs/Área, etc.).',
    completed: true,
  },

  // 4. Filtros e Buscas
  {
    id: 'filter-1',
    category: '4. Filtros, Buscas e Abas',
    iconName: 'Search',
    title: 'Filtro por Área Tecnológica (Aba Lista de UCs)',
    description: 'Filtrar disciplinas por área específica.',
    testSteps: [
      'Na tela /areas, clicar na aba "Lista de UCs"',
      'No dropdown de filtro, selecionar "Tecnologia da Informação"'
    ],
    expectedResult: 'Exibir na tabela apenas as UCs pertencentes à área selecionada.',
    completed: true,
  },
  {
    id: 'filter-2',
    category: '4. Filtros, Buscas e Abas',
    iconName: 'Search',
    title: 'Busca Global em Tempo Real',
    description: 'Filtrar dinamicamente a tela pelo campo de busca.',
    testSteps: [
      'No campo "Buscar Área ou UC...", digitar "Mecânica" ou "Banco de Dados"'
    ],
    expectedResult: 'A tela é filtrada instantaneamente exibindo apenas os itens correspondentes ao termo.',
    completed: true,
  },
];

const LOCAL_STORAGE_KEY = 'gestao_senai_checklist_v1';

export default function ChecklistPage() {
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [filterMode, setFilterMode] = useState<'ALL' | 'PENDING' | 'DONE'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Load from localStorage or defaults
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        setChecklist(JSON.parse(saved));
      } else {
        setChecklist(DEFAULT_CHECKLIST);
      }
    } catch (e) {
      setChecklist(DEFAULT_CHECKLIST);
    }
  }, []);

  // Save to localStorage when checklist changes
  const toggleItem = (id: string) => {
    const updated = checklist.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    setChecklist(updated);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Erro ao salvar checklist:', e);
    }
  };

  const handleReset = () => {
    if (confirm('Deseja restaurar o checklist para os valores padrão?')) {
      setChecklist(DEFAULT_CHECKLIST);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_CHECKLIST));
    }
  };

  const handleMarkAll = (status: boolean) => {
    const updated = checklist.map(item => ({ ...item, completed: status }));
    setChecklist(updated);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  };

  // Metrics
  const totalItems = checklist.length;
  const completedItems = checklist.filter(i => i.completed).length;
  const pendingItems = totalItems - completedItems;
  const progressPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  // Categories
  const categories = Array.from(new Set(checklist.map(i => i.category)));

  // Filtered items
  const filteredChecklist = checklist.filter(item => {
    const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;
    const matchesStatus = 
      filterMode === 'ALL' || 
      (filterMode === 'DONE' && item.completed) || 
      (filterMode === 'PENDING' && !item.completed);
    return matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-neutral-100">
              Checklist & Histórico de Testes
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-950/60 text-[#e30613]">
              Fase 1 Concluída
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-neutral-400 mt-1">
            Acompanhamento interativo dos testes funcionais e evolução contínua das regras de negócio SENAI.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleReset}
            className="border-gray-300 dark:border-neutral-700 text-gray-700 dark:text-neutral-300 gap-1.5 text-xs font-medium"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Restaurar Padrão
          </Button>
          <Button
            onClick={() => handleMarkAll(true)}
            className="bg-[#e30613] hover:bg-[#b7040f] text-white gap-1.5 text-xs font-semibold shadow-sm"
          >
            <BookmarkCheck className="w-4 h-4" />
            Marcar Todos
          </Button>
        </div>
      </div>

      {/* Progress Dashboard Banner */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/50 text-[#e30613]">
              <ListChecks className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <span className="text-3xl font-extrabold text-gray-900 dark:text-neutral-100">
                  {progressPercent}%
                </span>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300">
                  {completedItems} de {totalItems} Testes Concluídos
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-neutral-400 mt-1">
                {pendingItems > 0 
                  ? `${pendingItems} teste(s) pendente(s) de validação pelo gestor.`
                  : '🎉 Todos os testes desta etapa foram marcados como validados!'
                }
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="text-center px-4 py-2 bg-gray-50 dark:bg-neutral-800/60 rounded-lg border border-gray-100 dark:border-neutral-800">
              <span className="block font-bold text-base text-gray-900 dark:text-neutral-100">{totalItems}</span>
              <span className="text-gray-500 dark:text-neutral-400">Total</span>
            </div>
            <div className="text-center px-4 py-2 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg border border-emerald-100 dark:border-emerald-900/40">
              <span className="block font-bold text-base text-emerald-700 dark:text-emerald-300">{completedItems}</span>
              <span className="text-emerald-600 dark:text-emerald-400">Validados</span>
            </div>
            <div className="text-center px-4 py-2 bg-amber-50 dark:bg-amber-950/40 rounded-lg border border-amber-100 dark:border-amber-900/40">
              <span className="block font-bold text-base text-amber-700 dark:text-amber-300">{pendingItems}</span>
              <span className="text-amber-600 dark:text-amber-400">Pendentes</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-100 dark:bg-neutral-800 h-3 rounded-full overflow-hidden">
          <div 
            className="bg-[#e30613] h-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Toolbar Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-gray-200 dark:border-neutral-800 pb-4">
        {/* Filter Tabs by Status */}
        <div className="flex items-center gap-2 bg-gray-100 dark:bg-neutral-900 p-1 rounded-lg w-full sm:w-auto">
          <button
            onClick={() => setFilterMode('ALL')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              filterMode === 'ALL'
                ? 'bg-white dark:bg-neutral-800 text-gray-900 dark:text-neutral-100 shadow-sm'
                : 'text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-neutral-200'
            }`}
          >
            Todos os Testes ({totalItems})
          </button>
          <button
            onClick={() => setFilterMode('DONE')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              filterMode === 'DONE'
                ? 'bg-white dark:bg-neutral-800 text-emerald-700 dark:text-emerald-300 shadow-sm font-semibold'
                : 'text-gray-600 dark:text-neutral-400 hover:text-gray-900'
            }`}
          >
            Concluídos ({completedItems})
          </button>
          <button
            onClick={() => setFilterMode('PENDING')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              filterMode === 'PENDING'
                ? 'bg-white dark:bg-neutral-800 text-amber-700 dark:text-amber-300 shadow-sm font-semibold'
                : 'text-gray-600 dark:text-neutral-400 hover:text-gray-900'
            }`}
          >
            Pendentes ({pendingItems})
          </button>
        </div>

        {/* Filter Category Dropdown */}
        <div className="w-full sm:w-72">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-md text-xs text-gray-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#e30613]"
          >
            <option value="ALL">Todas as Módulos</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Interactive Checklist Cards */}
      <div className="space-y-4">
        {filteredChecklist.length === 0 ? (
          <div className="bg-white dark:bg-neutral-900 rounded-xl p-12 text-center border border-gray-200 dark:border-neutral-800 text-gray-500 dark:text-neutral-400 space-y-2">
            <Sparkles className="w-10 h-10 mx-auto text-gray-400 dark:text-neutral-600" />
            <p className="font-semibold text-gray-800 dark:text-neutral-200 text-sm">Nenhum teste encontrado para este filtro.</p>
            <p className="text-xs">Altere a categoria ou o filtro de status acima.</p>
          </div>
        ) : (
          filteredChecklist.map((item) => (
            <div 
              key={item.id}
              onClick={() => toggleItem(item.id)}
              className={`group cursor-pointer rounded-xl border p-5 transition-all duration-200 flex items-start gap-4 ${
                item.completed 
                  ? 'bg-white dark:bg-neutral-900/90 border-gray-200 dark:border-neutral-800/80 hover:border-emerald-300 dark:hover:border-emerald-800' 
                  : 'bg-white dark:bg-neutral-900 border-amber-200/80 dark:border-amber-900/40 shadow-sm hover:shadow-md'
              }`}
            >
              {/* Checkbox Icon */}
              <div className="pt-0.5 shrink-0">
                {item.completed ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 transition-transform group-hover:scale-110" />
                ) : (
                  <Square className="w-6 h-6 text-amber-500 dark:text-amber-400 transition-transform group-hover:scale-110" />
                )}
              </div>

              {/* Details */}
              <div className="flex-1 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                      item.completed 
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40' 
                        : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/40'
                    }`}>
                      {item.category}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-neutral-500 font-mono">#{item.id}</span>
                  </div>

                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                    item.completed ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                  }`}>
                    {item.completed ? '✓ Validado' : '⏳ Pendente'}
                  </span>
                </div>

                <div>
                  <h3 className={`font-bold text-sm text-gray-900 dark:text-neutral-100 ${
                    item.completed ? 'line-through text-gray-500 dark:text-neutral-400' : ''
                  }`}>
                    {item.title}
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-neutral-400 mt-0.5">
                    {item.description}
                  </p>
                </div>

                {/* Steps Accordion / Details */}
                <div className="pt-2 border-t border-gray-100 dark:border-neutral-800/60 grid gap-3 md:grid-cols-2 text-xs">
                  <div className="bg-gray-50 dark:bg-neutral-800/40 p-3 rounded-lg border border-gray-100 dark:border-neutral-800">
                    <span className="font-semibold text-gray-700 dark:text-neutral-300 block mb-1">Passos para o teste:</span>
                    <ol className="list-decimal list-inside space-y-1 text-gray-600 dark:text-neutral-400">
                      {item.testSteps.map((step, idx) => (
                        <li key={idx}>{step}</li>
                      ))}
                    </ol>
                  </div>

                  <div className="bg-emerald-50/40 dark:bg-emerald-950/20 p-3 rounded-lg border border-emerald-100/60 dark:border-emerald-900/30">
                    <span className="font-semibold text-emerald-800 dark:text-emerald-300 block mb-1">Resultado Esperado:</span>
                    <p className="text-emerald-900 dark:text-emerald-200">
                      {item.expectedResult}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Roadmap banner for Next Steps */}
      <div className="bg-gradient-to-r from-red-900 to-[#e30613] rounded-xl p-6 text-white shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-lg">
            <Sparkles className="w-5 h-5 text-amber-300" />
            <span>Próximas Etapas do Projeto (Roadmap)</span>
          </div>
          <span className="text-xs bg-white/20 px-2.5 py-1 rounded-full font-medium">Fluxo Funcional SENAI</span>
        </div>

        <div className="grid gap-4 md:grid-cols-3 text-xs pt-2">
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/10 space-y-1">
            <div className="font-bold text-sm text-amber-300">Etapa 2 (Próxima)</div>
            <div className="font-semibold text-white">Corpo Docente & Competências</div>
            <p className="text-white/80 text-[11px]">
              Cadastro completo de professores, carga horária contratada, turnos disponíveis e competências por UC.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/10 space-y-1">
            <div className="font-bold text-sm text-amber-300">Etapa 3</div>
            <div className="font-semibold text-white">Criação & Gestão de Turmas</div>
            <p className="text-white/80 text-[11px]">
              Programação de turmas (Técnico, CAI, FIC), vinculo do plano de UCs do curso e período semanal.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/10 space-y-1">
            <div className="font-bold text-sm text-amber-300">Etapa 4</div>
            <div className="font-semibold text-white">Matriz de Atribuição & Conflitos</div>
            <p className="text-white/80 text-[11px]">
              Painel inteligente com docentes disponíveis (Verde) e ocupados (Vermelho) e cálculo de ocupação.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
