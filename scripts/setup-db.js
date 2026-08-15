const { neon } = require('@neondatabase/serverless');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function setupDatabase() {
  console.log('--- INICIANDO CRIAÇÃO DE TABELAS E SEED VIA HTTP (NEON) ---');
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('DATABASE_URL não configurado.');
    process.exit(1);
  }

  const sql = neon(dbUrl);

  try {
    console.log('1. Criando tabelas...');

    await sql`
      CREATE TABLE IF NOT EXISTS "Usuario" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "nome" TEXT NOT NULL,
        "email" TEXT NOT NULL UNIQUE,
        "senha" TEXT NOT NULL,
        "perfil" TEXT NOT NULL DEFAULT 'DOCENTE',
        "ativo" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS "AreaTecnologica" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "nome" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS "UnidadeCurricular" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "nome" TEXT NOT NULL,
        "areaId" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "UnidadeCurricular_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "AreaTecnologica"("id") ON DELETE RESTRICT ON UPDATE CASCADE
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS "Docente" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "usuarioId" TEXT UNIQUE,
        "cargaHorariaContratada" INTEGER NOT NULL,
        "tipoContratacao" TEXT NOT NULL,
        "observacoes" TEXT,
        "dispManha" BOOLEAN NOT NULL DEFAULT false,
        "dispTarde" BOOLEAN NOT NULL DEFAULT false,
        "dispNoite" BOOLEAN NOT NULL DEFAULT false,
        "dispIntegral" BOOLEAN NOT NULL DEFAULT false,
        "dispHorarios" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Docente_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS "DocenteArea" (
        "docenteId" TEXT NOT NULL,
        "areaId" TEXT NOT NULL,
        PRIMARY KEY ("docenteId", "areaId"),
        CONSTRAINT "DocenteArea_docenteId_fkey" FOREIGN KEY ("docenteId") REFERENCES "Docente"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "DocenteArea_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "AreaTecnologica"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS "DocenteUC" (
        "docenteId" TEXT NOT NULL,
        "ucId" TEXT NOT NULL,
        PRIMARY KEY ("docenteId", "ucId"),
        CONSTRAINT "DocenteUC_docenteId_fkey" FOREIGN KEY ("docenteId") REFERENCES "Docente"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "DocenteUC_ucId_fkey" FOREIGN KEY ("ucId") REFERENCES "UnidadeCurricular"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS "Turma" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "nome" TEXT NOT NULL,
        "areaId" TEXT NOT NULL,
        "oppResponsavelId" TEXT,
        "tipoCurso" TEXT NOT NULL,
        "dataInicio" TIMESTAMP(3) NOT NULL,
        "dataTermino" TIMESTAMP(3) NOT NULL,
        "aulasSemanais" INTEGER NOT NULL,
        "totalAulas" INTEGER NOT NULL,
        "diasSemana" TEXT NOT NULL,
        "periodo" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Turma_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "AreaTecnologica"("id") ON DELETE RESTRICT ON UPDATE CASCADE
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS "Atribuicao" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "turmaId" TEXT NOT NULL,
        "ucId" TEXT NOT NULL,
        "docenteId" TEXT,
        "diaSemana" INTEGER NOT NULL,
        "horario" TEXT NOT NULL,
        "local" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Atribuicao_turmaId_fkey" FOREIGN KEY ("turmaId") REFERENCES "Turma"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        CONSTRAINT "Atribuicao_ucId_fkey" FOREIGN KEY ("ucId") REFERENCES "UnidadeCurricular"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        CONSTRAINT "Atribuicao_docenteId_fkey" FOREIGN KEY ("docenteId") REFERENCES "Docente"("id") ON DELETE SET NULL ON UPDATE CASCADE
      );
    `;

    console.log('✅ Tabelas criadas com sucesso!');

    console.log('2. Inserindo/Atualizando usuários padrão...');
    const senhaHash = await bcrypt.hash('senai123', 10);
    const now = new Date().toISOString();

    // Coordenador
    await sql`
      INSERT INTO "Usuario" ("id", "nome", "email", "senha", "perfil", "ativo", "createdAt", "updatedAt")
      VALUES ('user-coord-1', 'Coordenador SENAI', 'coordenador@sp.senai.br', ${senhaHash}, 'COORDENADOR', true, ${now}, ${now})
      ON CONFLICT ("email") 
      DO UPDATE SET "senha" = ${senhaHash}, "ativo" = true, "updatedAt" = ${now};
    `;
    console.log('✅ Coordenador inserido/atualizado: coordenador@sp.senai.br | senha: senai123');

    // OPP
    await sql`
      INSERT INTO "Usuario" ("id", "nome", "email", "senha", "perfil", "ativo", "createdAt", "updatedAt")
      VALUES ('user-opp-1', 'Orientador TI', 'opp@sp.senai.br', ${senhaHash}, 'OPP', true, ${now}, ${now})
      ON CONFLICT ("email") 
      DO UPDATE SET "senha" = ${senhaHash}, "ativo" = true, "updatedAt" = ${now};
    `;
    console.log('✅ OPP inserido/atualizado: opp@sp.senai.br | senha: senai123');

    console.log('🎉 Setup do banco de dados concluído com sucesso!');
  } catch (err) {
    console.error('❌ Erro no setup do banco:', err);
  }
}

setupDatabase();
