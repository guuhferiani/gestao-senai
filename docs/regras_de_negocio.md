# ESPECIFICAÇÃO FUNCIONAL
## Sistema de Gerenciamento de Professores, Programação de Turmas e Controle de Ocupação Docente

---

### 1. Objetivo
Desenvolver uma aplicação web para gerenciamento do cadastro de professores, programação de turmas e controle da ocupação docente, permitindo ao gestor distribuir as Unidades Curriculares (UCs) entre os professores de forma inteligente, evitando conflitos de horários e maximizando o aproveitamento da carga horária disponível.

O sistema deverá centralizar todas as informações acadêmicas relacionadas ao planejamento das turmas, permitindo que Coordenadores, OPPs e Docentes tenham acesso às informações pertinentes ao seu perfil de acesso.

---

## Fluxo Funcional do Sistema

### 1. Gestão de Áreas Tecnológicas e Unidades Curriculares
**Objetivo:** Cadastrar as áreas tecnológicas existentes na unidade e suas respectivas Unidades Curriculares, formando a estrutura base para o cadastro dos docentes e das turmas.

**Funcionalidades:**
- Cadastro, edição e exclusão de Áreas Tecnológicas;
- Cadastro, edição e exclusão de Unidades Curriculares;
- Pesquisa por Área ou UC;
- Quantidade de UCs cadastradas por área;
- Associação obrigatória entre Área e Unidade Curricular.

**Regras de Negócio:**
- Uma Unidade Curricular deve pertencer obrigatoriamente a uma Área Tecnológica.
- Uma Área pode possuir diversas UCs.
- Não será permitida a exclusão de uma Área que possua UCs vinculadas.

### 2. Cadastro dos Docentes
**Objetivo:** Cadastrar todos os docentes da unidade e definir suas competências técnicas.

**Informações Cadastrais:**
- Nome;
- E-mail;
- Senha;
- Status (Ativo/Inativo).

**Competências:**
Cada docente poderá ser vinculado a:
- Uma ou mais Áreas Tecnológicas;
- Diversas Unidades Curriculares dentro dessas áreas.

**Informações Complementares:**
- Carga horária contratada;
- Tipo de contratação;
- Disponibilidade semanal (manhã, tarde, noite e integral);
- Observações.

**Regras:**
- O docente somente poderá ser designado para ministrar UCs previamente cadastradas como competência em seu perfil.

### 3. Criação das Turmas
**Objetivo:** Cadastrar as turmas que serão ofertadas pela unidade.

**Informações:**
- Nome da turma;
- Área Tecnológica;
- OPP responsável;
- Tipo do curso (Técnico, CAI ou FIC);
- Data de início e de término;
- Quantidade de aulas semanais e total de aulas;
- Dias da semana e Período (manhã, tarde, noite ou integral).

**Regra:** Após a criação da turma, deverão ser vinculadas todas as Unidades Curriculares que compõem o plano do curso.

### 4. Gestão de Professores (Atribuição das UCs)
**Objetivo:** Distribuir as Unidades Curriculares entre os professores.
O gestor seleciona uma turma, visualiza a grade semanal e atribui cada UC ao docente mais adequado.

**Critérios de Seleção:**
O sistema deverá considerar automaticamente:
- Competência na UC;
- Área Tecnológica;
- Disponibilidade no horário;
- Carga horária disponível;
- Ausência de conflitos de agenda.

**Melhoria Proposta - Painel de Disponibilidade Docente:**
Durante a atribuição, o sistema deverá exibir simultaneamente:
- **Docentes Disponíveis:** Nome, Área, Competências, Percentual de ocupação, Horas disponíveis e Botão "Designar". (Indicador visual: Verde)
- **Docentes Ocupados:** Nome, Turma atual, UC ministrada, Dia e horário da ocupação, Percentual de ocupação. (Indicador visual: Vermelho ou cinza)

### 5. Visualização Geral das Turmas
**Objetivo:** Disponibilizar uma visão consolidada das turmas cadastradas.

**Informações Apresentadas (por turma):**
- Nome, Área Tecnológica, Tipo de curso, Datas de início e término;
- Professores vinculados, Quantidade de UCs programadas;
- Percentual de preenchimento da grade e Status da programação.

**Detalhes da Turma:** Ao selecionar uma turma será exibida sua grade semanal completa, contendo: UCs programadas, Professor responsável por cada aula, Horários vagos e Horários pendentes de atribuição.

### 6. Perfil dos Docentes
**Objetivo:** Disponibilizar ao gestor e ao próprio docente uma visão completa da agenda mensal de atividades.

**Dados Gerais:**
- Nome, Área(s) de atuação, Competências (UCs);
- Carga horária contratada, Horas programadas, Horas disponíveis e Percentual de ocupação.

**Calendário Mensal:** Exibir um calendário mensal contendo todas as atribuições. Cada evento deverá apresentar: Turma, UC, Dia, Horário, Período, Local e OPP responsável.

**Indicadores:**
- Quantidade de turmas atendidas e UCs ministradas;
- Horas já programadas, Horas livres e Taxa de ocupação.

### 7. Gestão de Usuários e Perfis de Acesso
**Objetivo:** Controlar o acesso ao sistema conforme o perfil do usuário, garantindo segurança e segregação de responsabilidades.

**Perfis de Usuário:**

1. **Coordenador:**
   - Possui acesso total ao sistema.
   - Permissões: Cadastro de Áreas, UCs, Docentes, Usuários; Criação de Turmas; Atribuição de Professores; Alteração de qualquer programação; Visualização de todos os docentes; Relatórios gerenciais; Indicadores de ocupação; Painel completo de planejamento.

2. **OPP (Orientador de Prática Profissional):**
   - Possui acesso restrito à(s) sua(s) área(s) de atuação.
   - Permissões: Visualizar docentes vinculados à sua área; Criar turmas da sua área; Atribuir professores às turmas sob sua responsabilidade; Consultar calendário dos docentes da sua área; Acompanhar indicadores de ocupação dos professores vinculados.
   - Restrições: Não poderá visualizar docentes pertencentes a outras áreas nem alterar cadastros administrativos.

3. **Docente:**
   - Possui acesso exclusivamente às informações referentes às suas atribuições.
   - Permissões: Visualizar seu calendário mensal; Consultar turmas atribuídas, UCs programadas, carga horária programada e histórico de atribuições.
   - Restrições: Não poderá editar turmas, alterar atribuições ou visualizar informações de outros docentes.

---

## 🚀 Diferenciais do Sistema
- **Painel de disponibilidade em tempo real:** exibindo simultaneamente docentes disponíveis e ocupados.
- **Indicadores visuais de ocupação** (verde, amarelo e vermelho) para facilitar a tomada de decisão.
- **Controle automático de conflitos**, impedindo a atribuição de um docente em horários sobrepostos.
- **Agenda mensal individual** para cada docente, consolidando todas as suas atividades.
- **Controle de acesso por perfil**, garantindo que Coordenadores, OPPs e Docentes visualizem apenas as informações pertinentes.
- **Painel gerencial** com indicadores de ocupação, carga horária disponível, distribuição de turmas e andamento da programação.