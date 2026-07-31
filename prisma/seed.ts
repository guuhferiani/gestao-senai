import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client';
import bcrypt from 'bcryptjs';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Iniciando o seed do banco de dados PostgreSQL (Neon)...');

  // Limpar dados existentes
  await prisma.atribuicao.deleteMany();
  await prisma.turma.deleteMany();
  await prisma.docenteUC.deleteMany();
  await prisma.docenteArea.deleteMany();
  await prisma.unidadeCurricular.deleteMany();
  await prisma.areaTecnologica.deleteMany();
  await prisma.docente.deleteMany();
  await prisma.usuario.deleteMany();

  // 1. Criar um Coordenador (Admin)
  const senhaHash = await bcrypt.hash('senai123', 10);
  const coordenador = await prisma.usuario.create({
    data: {
      nome: 'Coordenador SENAI',
      email: 'coordenador@senai.br',
      senha: senhaHash,
      perfil: 'COORDENADOR',
      ativo: true,
    },
  });
  console.log(`✅ Coordenador criado: ${coordenador.email} | senha: senai123`);

  // 2. Criar um OPP (Orientador de Prática Profissional)
  const opp = await prisma.usuario.create({
    data: {
      nome: 'Orientador TI',
      email: 'opp@senai.br',
      senha: senhaHash,
      perfil: 'OPP',
      ativo: true,
    },
  });
  console.log(`✅ OPP criado: ${opp.email} | senha: senai123`);

  // 3. Criar Áreas Tecnológicas
  const areaTi = await prisma.areaTecnologica.create({
    data: {
      nome: 'Tecnologia da Informação',
    },
  });

  const areaMecanica = await prisma.areaTecnologica.create({
    data: {
      nome: 'Mecânica Automotiva',
    },
  });
  console.log(`✅ Áreas Tecnológicas criadas: TI e Mecânica.`);

  // 4. Criar Unidades Curriculares (UCs)
  await prisma.unidadeCurricular.createMany({
    data: [
      { nome: 'Lógica de Programação', areaId: areaTi.id },
      { nome: 'Desenvolvimento Web - Front-end', areaId: areaTi.id },
      { nome: 'Modelagem de Banco de Dados', areaId: areaTi.id },
      { nome: 'Metrologia Dimensional', areaId: areaMecanica.id },
      { nome: 'Motores de Combustão Interna', areaId: areaMecanica.id },
      { nome: 'Sistemas Elétricos Automotivos', areaId: areaMecanica.id },
    ],
  });
  console.log(`✅ Unidades Curriculares cadastradas.`);

  console.log('🚀 Seed no Neon Postgres concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
