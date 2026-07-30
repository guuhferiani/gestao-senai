<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Regras de Negócio e Domínio
- **Documentação Base:** SEMPRE consulte o arquivo `docs/regras_de_negocio.md` antes de implementar novas lógicas de permissão, fluxos de docentes ou painéis de coordenação. Ele é a fonte da verdade para os requisitos.

# Identidade Visual e UI (Padrão SENAI)
- **Tipografia:** Utilize SEMPRE a fonte **Roboto** (sans-serif padrão) carregada no `layout.tsx`. Não utilize fontes modernas com serifa ou a fonte *Geist* padrão do Next.js/Tailwind.
- **Cores:** A cor primária corporativa é o Vermelho SENAI (`#FF0000`). Os fundos de sistema devem ser limpos (ex: `#F8F9FA`).
- **Navegação (Dashboard):** O layout padrão do sistema administrativo utiliza uma **Sidebar Colapsável** (expande no `hover:w-64`). Mantenha as telas (conteúdo principal) o mais amplas possível para acomodar grandes calendários e tabelas.
- **Estética:** O visual deve ser corporativo, "flat", sério e robusto. Evite uso excessivo de sombras pesadas (`box-shadow`), cantos exageradamente arredondados e gradientes complexos.
