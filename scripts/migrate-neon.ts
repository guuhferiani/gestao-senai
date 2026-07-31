import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';

const sql = neon(process.env.DATABASE_URL!);

async function migrateAndSeed() {
  console.log('⚡ Conectando ao Neon PostgreSQL via HTTPS (Porta 443)...');

  // 1. Criar tabelas se não existirem
  await sql`
    CREATE TABLE IF NOT EXISTS "Usuario" (
      "id" TEXT PRIMARY KEY,
      "nome" TEXT NOT NULL,
      "email" TEXT UNIQUE NOT NULL,
      "senha" TEXT NOT NULL,
      "perfil" TEXT NOT NULL DEFAULT 'DOCENTE',
      "ativo" BOOLEAN NOT NULL DEFAULT true,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS "AreaTecnologica" (
      "id" TEXT PRIMARY KEY,
      "nome" TEXT NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS "UnidadeCurricular" (
      "id" TEXT PRIMARY KEY,
      "nome" TEXT NOT NULL,
      "areaId" TEXT NOT NULL REFERENCES "AreaTecnologica"("id") ON DELETE CASCADE,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS "Docente" (
      "id" TEXT PRIMARY KEY,
      "usuarioId" TEXT UNIQUE REFERENCES "Usuario"("id") ON DELETE SET NULL,
      "cargaHorariaContratada" INTEGER NOT NULL,
      "tipoContratacao" TEXT NOT NULL,
      "observacoes" TEXT,
      "dispManha" BOOLEAN NOT NULL DEFAULT false,
      "dispTarde" BOOLEAN NOT NULL DEFAULT false,
      "dispNoite" BOOLEAN NOT NULL DEFAULT false,
      "dispIntegral" BOOLEAN NOT NULL DEFAULT false,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS "DocenteArea" (
      "docenteId" TEXT NOT NULL REFERENCES "Docente"("id") ON DELETE CASCADE,
      "areaId" TEXT NOT NULL REFERENCES "AreaTecnologica"("id") ON DELETE CASCADE,
      PRIMARY KEY ("docenteId", "areaId")
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS "DocenteUC" (
      "docenteId" TEXT NOT NULL REFERENCES "Docente"("id") ON DELETE CASCADE,
      "ucId" TEXT NOT NULL REFERENCES "UnidadeCurricular"("id") ON DELETE CASCADE,
      PRIMARY KEY ("docenteId", "ucId")
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS "Turma" (
      "id" TEXT PRIMARY KEY,
      "nome" TEXT NOT NULL,
      "areaId" TEXT NOT NULL REFERENCES "AreaTecnologica"("id") ON DELETE RESTRICT,
      "oppResponsavelId" TEXT,
      "tipoCurso" TEXT NOT NULL,
      "dataInicio" TIMESTAMP(3) NOT NULL,
      "dataTermino" TIMESTAMP(3) NOT NULL,
      "aulasSemanais" INTEGER NOT NULL,
      "totalAulas" INTEGER NOT NULL,
      "diasSemana" TEXT NOT NULL,
      "periodo" TEXT NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS "Atribuicao" (
      "id" TEXT PRIMARY KEY,
      "turmaId" TEXT NOT NULL REFERENCES "Turma"("id") ON DELETE RESTRICT,
      "ucId" TEXT NOT NULL REFERENCES "UnidadeCurricular"("id") ON DELETE RESTRICT,
      "docenteId" TEXT REFERENCES "Docente"("id") ON DELETE SET NULL,
      "diaSemana" INTEGER NOT NULL,
      "horario" TEXT NOT NULL,
      "local" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `;

  console.log('✅ Tabelas criadas com sucesso no Neon PostgreSQL!');

  // 2. Criar Usuários de Teste se não existirem
  const senhaHash = await bcrypt.hash('senai123', 10);
  
  const coordId = 'coord-admin-001';
  await sql`
    INSERT INTO "Usuario" ("id", "nome", "email", "senha", "perfil", "ativo", "updatedAt")
    VALUES (${coordId}, 'Coordenador SENAI', 'coordenador@senai.br', ${senhaHash}, 'COORDENADOR', true, NOW())
    ON CONFLICT ("email") DO UPDATE SET "senha" = ${senhaHash};
  `;
  console.log('✅ Usuário Coordenador criado/atualizado no Neon: coordenador@senai.br | senha: senai123');

  const oppId = 'opp-orientador-001';
  await sql`
    INSERT INTO "Usuario" ("id", "nome", "email", "senha", "perfil", "ativo", "updatedAt")
    VALUES (${oppId}, 'Orientador TI', 'opp@senai.br', ${senhaHash}, 'OPP', true, NOW())
    ON CONFLICT ("email") DO UPDATE SET "senha" = ${senhaHash};
  `;
  console.log('✅ Usuário OPP criado/atualizado no Neon: opp@senai.br | senha: senai123');

  // 3. Criar Áreas Iniciais
  const areaTiId = 'area-ti-001';
  await sql`
    INSERT INTO "AreaTecnologica" ("id", "nome", "updatedAt")
    VALUES (${areaTiId}, 'Tecnologia da Informação', NOW())
    ON CONFLICT ("id") DO NOTHING;
  `;

  const areaMecId = 'area-mec-001';
  await sql`
    INSERT INTO "AreaTecnologica" ("id", "nome", "updatedAt")
    VALUES (${areaMecId}, 'Mecânica Automotiva', NOW())
    ON CONFLICT ("id") DO NOTHING;
  `;

  console.log('✅ Áreas Tecnológicas criadas no Neon!');
  console.log('🚀 Migração e Seeding no Neon PostgreSQL concluídos via HTTPS com sucesso!');
}

migrateAndSeed().catch((err) => {
  console.error('❌ Erro durante migração:', err);
  process.exit(1);
});
