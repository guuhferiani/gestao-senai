import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';

const sql = neon(process.env.DATABASE_URL!);

async function migrateAndSeed() {
  console.log('⚡ Conectando ao Neon PostgreSQL via HTTPS (Porta 443)...');

  // Limpar logins antigos se existirem
  await sql`DELETE FROM "Usuario" WHERE "email" IN ('coordenador@senai.br', 'opp@senai.br', 'coordenador@sp.senai.br', 'opp@sp.senai.br');`;

  const senhaHash = await bcrypt.hash('senai123', 10);
  
  const coordId = 'coord-admin-001';
  await sql`
    INSERT INTO "Usuario" ("id", "nome", "email", "senha", "perfil", "ativo", "updatedAt")
    VALUES (${coordId}, 'Coordenador SENAI', 'coordenador@sp.senai.br', ${senhaHash}, 'COORDENADOR', true, NOW());
  `;
  console.log('✅ Usuário Coordenador criado no Neon: coordenador@sp.senai.br | senha: senai123');

  const oppId = 'opp-orientador-001';
  await sql`
    INSERT INTO "Usuario" ("id", "nome", "email", "senha", "perfil", "ativo", "updatedAt")
    VALUES (${oppId}, 'Orientador TI', 'opp@sp.senai.br', ${senhaHash}, 'OPP', true, NOW());
  `;
  console.log('✅ Usuário OPP criado no Neon: opp@sp.senai.br | senha: senai123');

  console.log('🚀 Contas de teste atualizadas no Neon PostgreSQL com sucesso!');
}

migrateAndSeed().catch((err) => {
  console.error('❌ Erro durante migração:', err);
  process.exit(1);
});
