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
  BookmarkCheck,
  Users,
  GraduationCap,
  CalendarDays,
  XCircle,
  HelpCircle
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
  // 1. Autenticação (Etapa 1)
  {
    id: 'auth-1',
    category: '1. Autenticação e Sessão (Etapa 1)',
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
    category: '1. Autenticação e Sessão (Etapa 1)',
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
    category: '1. Autenticação e Sessão (Etapa 1)',
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
    category: '1. Autenticação e Sessão (Etapa 1)',
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

  // 2. Gestão de Áreas (Etapa 1)
  {
    id: 'areas-1',
    category: '2. Gestão de Áreas Tecnológicas (Etapa 1)',
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
    category: '2. Gestão de Áreas Tecnológicas (Etapa 1)',
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
    category: '2. Gestão de Áreas Tecnológicas (Etapa 1)',
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
    category: '2. Gestão de Áreas Tecnológicas (Etapa 1)',
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
    category: '2. Gestão de Áreas Tecnológicas (Etapa 1)',
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

  // 3. Gestão de UCs (Etapa 1)
  {
    id: 'ucs-1',
    category: '3. Unidades Curriculares - UCs (Etapa 1)',
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
    category: '3. Unidades Curriculares - UCs (Etapa 1)',
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
    category: '3. Unidades Curriculares - UCs (Etapa 1)',
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
    category: '3. Unidades Curriculares - UCs (Etapa 1)',
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

  // 4. Gestão de Docentes e Competências (Etapa 2)
  {
    id: 'docentes-1',
    category: '4. Corpo Docente & Competências (Etapa 2)',
    iconName: 'Users',
    title: 'Cadastro de Docente com Vínculo de Áreas e UCs',
    description: 'Cadastrar professor vinculando a áreas e selecionando UCs de competência.',
    testSteps: [
      'Ir para /docentes e clicar em "+ Novo Docente"',
      'Aba 1: Preencher Nome "Prof. Ricardo Mendes", E-mail "ricardo.mendes@sp.senai.br"',
      'Aba 2: Tipo "CLT 40h", Carga Horária 40h, Marcar Manhã e Noite',
      'Aba 3: Selecionar Área "Tecnologia da Informação" e marcar "Lógica de Programação"',
      'Clicar em "Cadastrar Docente"'
    ],
    expectedResult: 'Docente criado no banco Neon PostgreSQL com dados cadastrais, turnos e competências vinculadas.',
    completed: true,
  },
  {
    id: 'docentes-2',
    category: '4. Corpo Docente & Competências (Etapa 2)',
    iconName: 'Users',
    title: 'Bloqueio de E-mail de Docente Duplicado',
    description: 'Garantir a unicidade do e-mail institucional no cadastro de docentes.',
    testSteps: [
      'Clicar em "+ Novo Docente"',
      'Inserir o mesmo e-mail já existente "ricardo.mendes@sp.senai.br"',
      'Tentar submeter'
    ],
    expectedResult: 'Exibição de erro bloqueando o cadastro com a mensagem: "Já existe um usuário cadastrado com este e-mail."',
    completed: true,
  },
  {
    id: 'docentes-3',
    category: '4. Corpo Docente & Competências (Etapa 2)',
    iconName: 'Users',
    title: 'Filtros Dinâmicos por Turno, Área e Status',
    description: 'Testar os filtros em tempo real da tabela e visualização em grade.',
    testSteps: [
      'Na tela /docentes, selecionar no dropdown de Turno: "Disponível Noite"',
      'Em seguida, alternar para a visualização em Grade/Cards',
      'Verificar se apenas os docentes com disponibilidade no turno da noite são exibidos'
    ],
    expectedResult: 'Filtragem reativa instantânea nos cards e na tabela.',
    completed: true,
  },
  {
    id: 'docentes-4',
    category: '4. Corpo Docente & Competências (Etapa 2)',
    iconName: 'Users',
    title: 'Edição de Carga Horária e Adição de Novas Competências',
    description: 'Atualizar os dados de contratação e adicionar UCs de outras áreas.',
    testSteps: [
      'No docente "Prof. Ricardo Mendes", clicar no botão de edição ✏️',
      'Alterar carga horária para 30h e adicionar competência "Modelagem de Banco de Dados"',
      'Clicar em "Salvar Alterações"'
    ],
    expectedResult: 'Dados atualizados no banco de dados e refletidos imediatamente na listagem.',
    completed: true,
  },
  {
    id: 'docentes-5',
    category: '4. Corpo Docente & Competências (Etapa 2)',
    iconName: 'Users',
    title: 'Visualização da Ficha Completa de Detalhes',
    description: 'Consultar todas as informações detalhadas e competências agrupadas por área.',
    testSteps: [
      'Na linha do docente, clicar no ícone do olho 👁️ (Detalhes)',
      'Verificar a exibição das UCs agrupadas por cada área tecnológica'
    ],
    expectedResult: 'Modal abre exibindo ficha completa, carga horária, turnos e todas as competências mapeadas.',
    completed: true,
  },

  // 5. Criação e Gestão de Turmas (Etapa 3)
  {
    id: 'turmas-1',
    category: '5. Criação & Gestão de Turmas (Etapa 3)',
    iconName: 'CalendarDays',
    title: 'Cadastro de Turma com Plano de UCs Completo',
    description: 'Cadastrar turma técnica vinculada à área e associando as disciplinas do curso.',
    testSteps: [
      'Ir para /turmas e clicar em "+ Nova Turma"',
      'Aba 1: Nome "Técnico em TI - Noturno 2026/1", Área "Tecnologia da Informação", Tipo "TECNICO"',
      'Aba 2: Vigência de 6 meses no seletor de calendário, Período "NOITE", Dias Seg a Sex',
      'Aba 3: Marcar todas as UCs da área de TI',
      'Clicar em "Cadastrar Turma"'
    ],
    expectedResult: 'Turma criada no banco com os slots de atribuição gerados para cada UC selecionada.',
    completed: true,
  },
  {
    id: 'turmas-2',
    category: '5. Criação & Gestão de Turmas (Etapa 3)',
    iconName: 'CalendarDays',
    title: 'Filtros de Turmas por Tipo de Curso e Período',
    description: 'Filtrar instantaneamente as turmas cadastradas por segmento e horário.',
    testSteps: [
      'Na tela /turmas, selecionar Tipo: "Cursos Técnicos" e Período: "Noite"',
      'Verificar a listagem atualizada'
    ],
    expectedResult: 'Exibição exclusiva das turmas correspondentes com seus respectivos indicadores.',
    completed: true,
  },
  {
    id: 'turmas-3',
    category: '5. Criação & Gestão de Turmas (Etapa 3)',
    iconName: 'CalendarDays',
    title: 'Edição de Vigência e Sincronização do Plano de UCs',
    description: 'Alterar datas e adicionar novas disciplinas ao plano da turma.',
    testSteps: [
      'Clicar em Editar ✏️ na turma recém-criada',
      'Alterar o total de aulas e adicionar uma nova UC',
      'Clicar em "Salvar Alterações"'
    ],
    expectedResult: 'Atualização instantânea no banco de dados e recálculo da porcentagem de progresso.',
    completed: true,
  },
  {
    id: 'turmas-4',
    category: '5. Criação & Gestão de Turmas (Etapa 3)',
    iconName: 'CalendarDays',
    title: 'Visualização da Grade Curricular Completa',
    description: 'Acessar o modal de detalhes para checar os slots de aula e status de atribuição.',
    testSteps: [
      'Clicar no ícone de visualização 👁️ (Grade & UCs)',
      'Verificar a lista de slots e status "Pendente" para as aulas sem professor'
    ],
    expectedResult: 'Modal abre apresentando todas as UCs do plano, horários e percentual de alocação.',
    completed: true,
  },

  // 6. Matriz de Atribuição e Disponibilidade Docente (Etapa 4 - EM ANDAMENTO)
  {
    id: 'atrib-1',
    category: '6. Matriz de Atribuição & Conflitos (Etapa 4)',
    iconName: 'Sparkles',
    title: 'Painel de Disponibilidade Docente em Tempo Real (Verde)',
    description: 'Verificar se docentes com competência na UC, disponibilidade no turno e saldo de horas aparecem em VERDE.',
    testSteps: [
      'Acessar /atribuicoes e selecionar a turma "Técnico em TI - Noturno 2026/1"',
      'Clicar em "+ Atribuir Docente" na UC "Lógica de Programação"',
      'Verificar se o "Prof. Ricardo Mendes" aparece com status VERDE (Apto)'
    ],
    expectedResult: 'Docente exibido na seção de aptos com botão de atribuição rápida disponível.',
    completed: false,
  },
  {
    id: 'atrib-2',
    category: '6. Matriz de Atribuição & Conflitos (Etapa 4)',
    iconName: 'Sparkles',
    title: 'Prevenção e Bloqueio de Conflito de Horário (Vermelho)',
    description: 'Garantir que um professor não possa ser atribuído a duas turmas simultâneas no mesmo dia e horário.',
    testSteps: [
      'Atribuir o "Prof. Ricardo Mendes" na Terça-feira às 18:45 na Turma A',
      'Ir para a Turma B e tentar atribuí-lo no mesmo dia e horário',
      'Verificar se o sistema bloqueia e exibe status VERMELHO com o motivo do conflito'
    ],
    expectedResult: 'Bloqueio exibindo: "Conflito de Horário: Já leciona na turma Turma A neste mesmo horário".',
    completed: false,
  },
  {
    id: 'atrib-3',
    category: '6. Matriz de Atribuição & Conflitos (Etapa 4)',
    iconName: 'Sparkles',
    title: 'Bloqueio por Falta de Competência Técnica na UC',
    description: 'Verificar se professores sem competência cadastrada na disciplina aparecem bloqueados.',
    testSteps: [
      'Abrir slot de uma UC de Mecânica Automotiva (ex: "Metrologia")',
      'Verificar a listagem de docentes'
    ],
    expectedResult: 'Docentes da área de TI aparecem em VERMELHO com o aviso: "Sem Competência Técnica cadastrada".',
    completed: false,
  },
  {
    id: 'atrib-4',
    category: '6. Matriz de Atribuição & Conflitos (Etapa 4)',
    iconName: 'Sparkles',
    title: 'Definição e Troca de Ambiente Pedagógico (Local da Aula)',
    description: 'Definir a sala, oficina ou laboratório onde a aula será ministrada.',
    testSteps: [
      'No card da aula atribuída, definir Local como "Laboratório de TI 01"',
      'Salvar e verificar a atualização na grade semanal'
    ],
    expectedResult: 'Local salvo e exibido no card da aula da turma.',
    completed: false,
  },
  {
    id: 'atrib-5',
    category: '6. Matriz de Atribuição & Conflitos (Etapa 4)',
    iconName: 'Sparkles',
    title: 'Desalocação de Aula e Atualização da Carga Horária',
    description: 'Remover um professor de uma aula e conferir a liberação da sua agenda.',
    testSteps: [
      'Clicar no botão "Desalocar" na aula atribuída',
      'Confirmar liberação do slot'
    ],
    expectedResult: 'Aula volta para o status "Pendente", e a carga horária do docente é liberada imediatamente.',
    completed: true,
  },

  // 7. Perfil do Docente, Agenda Mensal & Perfis (Etapa 5)
  {
    id: 'agenda-1',
    category: '7. Perfil & Agenda Mensal do Docente (Etapa 5)',
    iconName: 'CalendarDays',
    title: 'Visualização da Agenda Mensal e Semanal Individual',
    description: 'Consultar o calendário completo e grade horária de um professor específico.',
    testSteps: [
      'Na tela /docentes, clicar no botão "Agenda 📅" do Prof. Ricardo Mendes',
      'Alternar entre as abas: Grade Semanal, Calendário Mensal e Lista Detalhada'
    ],
    expectedResult: 'Página abre exibindo a grade completa com todas as aulas, turmas, horários e ambientes pedagógicos.',
    completed: true,
  },
  {
    id: 'agenda-2',
    category: '7. Perfil & Agenda Mensal do Docente (Etapa 5)',
    iconName: 'CalendarDays',
    title: 'Indicadores de Capacidade e Saldo de Horas Livres',
    description: 'Validar os 4 cards de produtividade (Carga contratada, Horas alocadas, Saldo livre e Taxa de ocupação).',
    testSteps: [
      'Na página da agenda do docente, checar os 4 KPI cards no topo',
      'Verificar se a barra de progresso reflete a porcentagem de horas alocadas'
    ],
    expectedResult: 'Métricas calculadas dinamicamente com base nas atribuições ativas do professor.',
    completed: true,
  },
  {
    id: 'agenda-3',
    category: '7. Perfil & Agenda Mensal do Docente (Etapa 5)',
    iconName: 'CalendarDays',
    title: 'Impressão e Exportação da Grade de Aulas do Professor',
    description: 'Garantir que o professor ou gestor possa imprimir a grade de horários formatada.',
    testSteps: [
      'Clicar no botão "Imprimir / Exportar Grade"',
      'Verificar o disparo da janela de impressão com formatação limpa'
    ],
    expectedResult: 'Janela de impressão aberta com layout preparado e legível.',
    completed: true,
  },
  {
    id: 'agenda-4',
    category: '7. Perfil & Agenda Mensal do Docente (Etapa 5)',
    iconName: 'CalendarDays',
    title: 'Acesso Direto à Própria Agenda (/minha-agenda)',
    description: 'Permitir que o usuário com perfil Docente acesse diretamente sua escala de trabalho.',
    testSteps: [
      'Acessar a rota /minha-agenda',
      'Verificar o redirecionamento automático para a agenda do docente logado'
    ],
    expectedResult: 'Redirecionamento instantâneo para a agenda individual com sincronização em tempo real.',
    completed: true,
  },

  // 8. Gestão de Usuários e Perfis RBAC
  {
    id: 'user-1',
    category: '8. Gestão de Usuários & Perfis RBAC',
    iconName: 'UserCog',
    title: 'Cadastro e Criação de Contas com Perfil',
    description: 'Cadastrar novos Coordenadores, Orientadores OPP e Docentes com senha criptografada.',
    testSteps: [
      'Acessar /usuarios e clicar em "+ Novo Usuário"',
      'Preencher Nome, E-mail institucional e selecionar perfil OPP',
      'Clicar em "Criar Usuário"'
    ],
    expectedResult: 'Usuário cadastrado com hash bcrypt e exibido na listagem com badge correspondente.',
    completed: true,
  },
  {
    id: 'user-2',
    category: '8. Gestão de Usuários & Perfis RBAC',
    iconName: 'UserCog',
    title: 'Redefinição Rápida de Senha de Acesso',
    description: 'Alterar a senha de qualquer usuário com validação de segurança.',
    testSteps: [
      'Clicar no ícone de chave 🔑 no card ou linha do usuário',
      'Inserir nova senha e confirmar'
    ],
    expectedResult: 'Senha atualizada imediatamente no banco de dados e notificação de sucesso.',
    completed: true,
  },

  // 9. Central de Relatórios & Exportações
  {
    id: 'relat-1',
    category: '9. Relatórios Executivos & Exportações',
    iconName: 'BarChart3',
    title: 'Relatório de Ocupação e Exportação Excel (CSV)',
    description: 'Gerar o relatório de capacidade docente e baixar em planilha CSV formatada.',
    testSteps: [
      'Acessar /relatorios e visualizar a tabela de Ocupação & Capacidade',
      'Clicar no botão "Exportar para Excel (.CSV)"'
    ],
    expectedResult: 'Download automático do arquivo CSV com codificação UTF-8 compatível com Excel.',
    completed: true,
  },
  {
    id: 'relat-2',
    category: '9. Relatórios Executivos & Exportações',
    iconName: 'BarChart3',
    title: 'Diagnóstico Preventivo de Gargalos de UCs',
    description: 'Identificar disciplinas sem professores qualificados cadastrados na unidade.',
    testSteps: [
      'Acessar a aba "2. Diagnóstico de Gargalos Acadêmicos"',
      'Verificar o status Crítico e Alerta para disciplinas com 0 ou 1 docente habilitado'
    ],
    expectedResult: 'Mapeamento visual claro com recomendações pedagógicas de contratação.',
    completed: true,
  },

  // 10. Simulador de Capacidade & Contratações
  {
    id: 'simul-1',
    category: '10. Simulador de Capacidade & Contratações',
    iconName: 'Sparkles',
    title: 'Configuração Preditiva de Novas Turmas',
    description: 'Adicionar turmas simuladas e calcular o impacto instantâneo na carga horária.',
    testSteps: [
      'Acessar /simulador e clicar em "+ 2 Turmas TI Noturno"',
      'Verificar o recálculo em tempo real dos 4 KPI cards'
    ],
    expectedResult: 'Cálculo de demanda, horas supridas e novos docentes necessários sem alterar dados de produção.',
    completed: true,
  },
  {
    id: 'simul-2',
    category: '10. Simulador de Capacidade & Contratações',
    iconName: 'Sparkles',
    title: 'Parecer Executivo de Contratação para a Direção',
    description: 'Validar a recomendação de contratação por área tecnológica e exportação/impressão.',
    testSteps: [
      'Verificar o parecer detalhado no card de Síntese Executiva',
      'Clicar no botão "Imprimir Diagnóstico"'
    ],
    expectedResult: 'Recomendação quantitativa precisa (docentes CLT 40h vs Horistas) e relatório pronto para impressão.',
    completed: true,
  },

  // 11. Central de Notificações Inteligentes
  {
    id: 'notif-1',
    category: '11. Central de Notificações & Alertas',
    iconName: 'Bell',
    title: 'Badge Inteligente e Popover no Sino da Topbar',
    description: 'Verificar a contagem de alertas ativos e abertura do popover suspenso com abas de severidade.',
    testSteps: [
      'Observar o sino na barra superior (Topbar)',
      'Clicar no ícone de sino e verificar a lista de alertas'
    ],
    expectedResult: 'Popover abre exibindo as pendências em tempo real com links diretos de resolução em 1 clique.',
    completed: true,
  },
];

const LOCAL_STORAGE_KEY = 'gestao_senai_checklist_v8';

export default function ChecklistPage() {
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [filterMode, setFilterMode] = useState<'ALL' | 'PENDING' | 'DONE'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Carregar do localStorage ou carregar o padrão
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

  // Alternar o status individual clicando no card
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
    if (confirm('Deseja restaurar o checklist para os valores padrão de fábrica?')) {
      setChecklist(DEFAULT_CHECKLIST);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_CHECKLIST));
    }
  };

  const handleUnmarkAll = () => {
    if (confirm('Deseja desmarcar todos os testes para realizar a validação manual?')) {
      const updated = checklist.map(item => ({ ...item, completed: false }));
      setChecklist(updated);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    }
  };

  const handleMarkAll = (status: boolean) => {
    const updated = checklist.map(item => ({ ...item, completed: status }));
    setChecklist(updated);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  };

  // Métricas
  const totalItems = checklist.length;
  const completedItems = checklist.filter(i => i.completed).length;
  const pendingItems = totalItems - completedItems;
  const progressPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  // Categorias
  const categories = Array.from(new Set(checklist.map(i => i.category)));

  // Itens filtrados
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
      
      {/* Banner Explicativo sobre a Linha do Tempo e Etapas */}
      <div className="bg-gradient-to-r from-neutral-900 to-gray-800 text-white rounded-2xl p-6 shadow-md border border-neutral-700 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-700/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-600/30 text-red-400 border border-red-500/40">
              <Sparkles className="w-6 h-6 text-[#e30613]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Linha do Tempo & Status do Projeto
              </h2>
              <p className="text-xs text-neutral-300">
                Acompanhe o que já foi entregue e qual etapa estamos desenvolvendo.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
              Etapa 4 em Desenvolvimento
            </span>
          </div>
        </div>

        {/* 4 Blocos das Etapas */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-xs pt-1">
          <div className="bg-white/5 p-3.5 rounded-xl border border-white/10 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-400">Etapa 1 • Concluída</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="font-semibold text-neutral-100">Áreas & Unidades Curriculares</p>
            <p className="text-[11px] text-neutral-400">CRUD de áreas, UCs e autenticação.</p>
          </div>

          <div className="bg-white/5 p-3.5 rounded-xl border border-white/10 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-400">Etapa 2 • Concluída</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="font-semibold text-neutral-100">Docentes & Competências</p>
            <p className="text-[11px] text-neutral-400">Cadastro de professores e competências por UC.</p>
          </div>

          <div className="bg-white/5 p-3.5 rounded-xl border border-white/10 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-400">Etapa 3 • Concluída</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="font-semibold text-neutral-100">Turmas & Planos de Curso</p>
            <p className="text-[11px] text-neutral-400">Criação de turmas e plano de disciplinas.</p>
          </div>

          <div className="bg-red-950/40 p-3.5 rounded-xl border border-red-500/50 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-400">Etapa 4 • Em Execução 🎯</span>
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>
            <p className="font-semibold text-white">Matriz de Atribuição & Conflitos</p>
            <p className="text-[11px] text-neutral-300">Grade semanal e painel verde/vermelho.</p>
          </div>
        </div>
      </div>

      {/* Header & Ações */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-neutral-100">
              Checklist de Testes & Validação
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-950/60 text-[#e30613]">
              Painel Interativo
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-neutral-400 mt-1">
            Clique em qualquer card para marcar ou desmarcar os testes que você mesmo validou na interface.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            onClick={handleUnmarkAll}
            className="border-gray-300 dark:border-neutral-700 text-gray-700 dark:text-neutral-300 gap-1.5 text-xs font-medium"
          >
            <XCircle className="w-3.5 h-3.5 text-amber-600" />
            Desmarcar Todos
          </Button>
          <Button
            variant="outline"
            onClick={handleReset}
            className="border-gray-300 dark:border-neutral-700 text-gray-700 dark:text-neutral-300 gap-1.5 text-xs font-medium"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Restaurar Padrão
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
                  {completedItems} de {totalItems} Testes Marcados
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-neutral-400 mt-1">
                {pendingItems > 0 
                  ? `${pendingItems} teste(s) aguardando sua validação manual na tela.`
                  : '🎉 Todos os testes foram marcados como validados!'
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
            Todos ({totalItems})
          </button>
          <button
            onClick={() => setFilterMode('DONE')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              filterMode === 'DONE'
                ? 'bg-white dark:bg-neutral-800 text-emerald-700 dark:text-emerald-300 shadow-sm font-semibold'
                : 'text-gray-600 dark:text-neutral-400 hover:text-gray-900'
            }`}
          >
            Validados ({completedItems})
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
        <div className="w-full sm:w-80">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-md text-xs text-gray-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#e30613]"
          >
            <option value="ALL">Todos os Módulos / Etapas</option>
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
                    {item.completed ? '✓ Marcado como Validado' : '⏳ Pendente de Validação'}
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
                    <span className="font-semibold text-gray-700 dark:text-neutral-300 block mb-1">Passos para você testar na tela:</span>
                    <ol className="list-decimal list-inside space-y-1 text-gray-600 dark:text-neutral-400">
                      {item.testSteps.map((step, idx) => (
                        <li key={idx}>{step}</li>
                      ))}
                    </ol>
                  </div>

                  <div className="bg-emerald-50/40 dark:bg-emerald-950/20 p-3 rounded-lg border border-emerald-100/60 dark:border-emerald-900/30">
                    <span className="font-semibold text-emerald-800 dark:text-emerald-300 block mb-1">Resultado Esperado do Sistema:</span>
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

    </div>
  );
}
