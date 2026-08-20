# 🏛️ Sistema de Gestão Acadêmica & Otimização Docente SENAI-SP

Plataforma corporativa full-stack desenvolvida para centralizar a **governança pedagógica**, o **planejamento de turmas**, a **distribuição de carga horária docente** e a **otimização de alocação de salas e Unidades Curriculares (UCs)** nas unidades do SENAI-SP.

---

## 🎯 Finalidade do Projeto

O sistema foi concebido para transformar e digitalizar a gestão acadêmica institucional, eliminando controles manuais em planilhas dispersas e oferecendo uma solução integrada com inteligência operacional para:

1. **Gestão de Áreas Tecnológicas & Matrizes Curriculares:**
   * Cadastro e estruturação de áreas de atuação (ex: *Metalmecânica*, *Tecnologia da Informação*, *Eletroeletrônica*, *Gestão*, *Automotiva*).
   * Mapeamento minucioso de Unidades Curriculares (UCs) com definição de carga horária e planos de ensino.

2. **Gestão Estratégica do Corpo Docente:**
   * Mapeamento de perfis contratuais (*CLT 40h*, *CLT 20h*, *Horista*).
   * Matriz de competências técnicas homologadas (quais professores estão habilitados para quais UCs).
   * Desmembramento da disponibilidade semanal em **blocos de aula de 45 minutos** por turno (*Manhã*, *Tarde*, *Noite* e *Integral*).
   * Controle contínuo de saldo de horas: *Carga Contratada vs. Horas Alocadas em Sala vs. Horas Livres para Planejamento*.

3. **Planejamento de Turmas & Calendário:**
   * Gestão de cursos por modalidade (**Cursos Técnicos**, **Aprendizagem Industrial - CAI** e **Formação Inicial e Continuada - FIC**).
   * Definição de cronogramas vigentes, periodicidade e dias de aula.

4. **Matriz de Atribuição Inteligente em Tempo Real:**
   * Distribuição de professores nas turmas com **algoritmo de prevenção ativa de choques e conflitos**.
   * Painel de disponibilidade com categorização visual (*Docentes Disponíveis e Habilitados* vs. *Conflito de Horário / Sem Competência / Fora do Turno*).

5. **Simulador Preditivo de Demanda:**
   * Análise de impacto para abertura de novas turmas antes da publicação oficial.
   * Diagnóstico em tempo real da capacidade docente disponível ou necessidade de novas contratações por área tecnológica.

6. **Painel Executivo & Central de Relatórios:**
   * Métricas globais de ocupação e eficiência do corpo docente.
   * Indicadores de distribuição por área tecnológica e regimes de trabalho.
   * Exportação de relatórios gerenciais consolidados em formato CSV e planilhas.

7. **Governança & Controle de Acesso por Perfil (RBAC SENAI):**
   * **Coordenação:** Acesso total irrestrito a todas as configurações, usuários, relatórios e simulações.
   * **Secretaria (Administrativo):** Gestão administrativa de turmas, docentes, áreas e matrículas com mesmo nível operacional.
   * **Orientador Pedagógico (OPP):** Gestão e acompanhamento das turmas e docentes de seus respectivos segmentos tecnológicos.
   * **Docente:** Painel pedagógico privativo e focado exclusivamente na sua rotina (Minha Agenda Semanal/Mensal, Suas Turmas, Suas Competências e Horas de Planejamento).

8. **Segurança Institucional & Privacidade (LGPD):**
   * Acesso restrito a contas institucionais `@sp.senai.br`.
   * Recuperação de senha em 3 etapas validada por **NIF (Matrícula Funcional)** mantido em sigilo no banco de dados.
   * Redefinição gerencial de contingência com senha provisória padrão `Senai@123`.

---

## 💻 Tecnologias Utilizadas

O projeto adota uma arquitetura moderna, escalável e de alta performance:

### ⚡ Frontend & Framework
* **[Next.js 16 (App Router)](https://nextjs.org/):** Framework React para renderização híbrida rápida (SSR/SSG), Server Actions e rotas de API otimizadas.
* **[React 19](https://react.dev/):** Biblioteca para interfaces de usuário modernas, reativas e com gerenciamento de estado otimizado.
* **[TypeScript](https://www.typescriptlang.org/):** Tipagem estática rigorosa em 100% da base de código, garantindo manutenibilidade e prevenção de falhas em tempo de execução.

### 🎨 Interface & Design System SENAI
* **[Tailwind CSS v4](https://tailwindcss.com/):** Estilização moderna com classes utilitárias de alta performance.
* **Identidade Visual Corporativa SENAI:**
  * Vermelho SENAI Institucional (**Pantone 485 / `#e30613`**) e contraste acessível.
  * Tipografia padronizada em **Roboto** / **Montserrat**.
  * Componentes consistentes, layout "flat" profissional e suporte nativo a **Tema Claro (Light)** e **Tema Escuro (Dark Mode)**.
  * Sidebar expansível por hover para acomodar calendários e matrizes de grade densas.
* **[Lucide React](https://lucide.dev/):** Biblioteca de ícones vetoriais leves e consistentes.

### 🔐 Autenticação & Autorização
* **[NextAuth.js (Auth.js)](https://next-auth.js.org/):** Gerenciamento robusto de sessões com JWT criptografado e validação de credenciais.
* **[bcryptjs](https://www.npmjs.com/package/bcryptjs):** Hash unidirecional e salt seguro para senhas de acesso.
* **Middlewares e Guards RBAC:** Proteção de rotas do lado do cliente e do servidor (Next.js Server API Routes) rejeitando acessos não autorizados via HTTP `403 Forbidden`.

### 🗄️ Banco de Dados & ORM
* **[PostgreSQL Serverless (Neon DB)](https://neon.tech/):** Banco de dados relacional em nuvem, escalável e com alta disponibilidade.
* **[Prisma ORM v7](https://www.prisma.io/):** Modelagem relacional declarativa, migrações seguras e queries tipadas.
* **[@prisma/adapter-neon](https://www.npmjs.com/package/@prisma/adapter-neon):** Conector HTTP serverless ultra-rápido imune a bloqueios de firewall corporativo.

### 📱 Recursos Mobile & PWA
* **Progressive Web App (PWA):** `manifest.json`, Service Workers e ícones integrados para permitir instalação como aplicativo em computadores e dispositivos móveis (Android e iOS).
* **Impressão Otimizada:** Folhas de agenda e horários formatadas para impressão direta ou exportação em PDF.

---

## 👥 Créditos e Desenvolvimento

Projeto concebido e desenvolvido por:

* **[Gustavo Feriani](https://github.com/guuhferiani)** — *Idealização, Arquitetura de Software e Desenvolvimento Full-Stack*
* **Pair Programming & IA Assistiva:** Desenvolvido em colaboração com **Antigravity (Google DeepMind)**

---

## 🏛️ Padrão Corporativo
Desenvolvido em conformidade com as diretrizes educacionais, operacionais e de identidade visual do **SENAI-SP**.
