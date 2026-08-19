import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export const dynamic = 'force-dynamic';

// GET /api/usuarios - Listar usuários com filtros e contadores (Apenas Coordenador e Secretaria)
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userPerfil = (session?.user as any)?.perfil;

    if (!session || (userPerfil !== 'COORDENADOR' && userPerfil !== 'SECRETARIA')) {
      return NextResponse.json(
        { error: 'Acesso não autorizado. Apenas Coordenadores e Secretaria podem consultar usuários.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const perfil = searchParams.get('perfil') || 'ALL';
    const status = searchParams.get('status') || 'ALL';

    const where: any = {};

    if (search.trim()) {
      where.OR = [
        { nome: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (perfil !== 'ALL') {
      where.perfil = perfil;
    }

    if (status === 'ATIVO') {
      where.ativo = true;
    } else if (status === 'INATIVO') {
      where.ativo = false;
    }

    const [usuarios, totalCount, coordenadoresCount, secretariaCount, oppsCount, docentesCount] =
      await Promise.all([
        prisma.usuario.findMany({
          where,
          select: {
            id: true,
            nome: true,
            email: true,
            nif: true,
            perfil: true,
            ativo: true,
            createdAt: true,
            updatedAt: true,
            docente: {
              select: {
                id: true,
                tipoContratacao: true,
                cargaHorariaContratada: true,
                areas: {
                  include: { area: true },
                },
              },
            },
          },
          orderBy: [{ perfil: 'asc' }, { nome: 'asc' }],
        }),
        prisma.usuario.count(),
        prisma.usuario.count({ where: { perfil: 'COORDENADOR' } }),
        prisma.usuario.count({ where: { perfil: 'SECRETARIA' } }),
        prisma.usuario.count({ where: { perfil: 'OPP' } }),
        prisma.usuario.count({ where: { perfil: 'DOCENTE' } }),
      ]);

    return NextResponse.json({
      usuarios,
      metricas: {
        total: totalCount,
        coordenadores: coordenadoresCount,
        secretaria: secretariaCount,
        opps: oppsCount,
        docentes: docentesCount,
      },
    });
  } catch (error: any) {
    console.error('Erro ao listar usuários:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar usuários cadastrados.', details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/usuarios - Cadastrar novo usuário com senha criptografada (Apenas Coordenador e Secretaria)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userPerfil = (session?.user as any)?.perfil;

    if (!session || (userPerfil !== 'COORDENADOR' && userPerfil !== 'SECRETARIA')) {
      return NextResponse.json(
        { error: 'Acesso não autorizado. Apenas Coordenadores e Secretaria podem cadastrar usuários.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { nome, email, nif, senha, perfil, ativo = true } = body;

    if (!nome || !email || !perfil) {
      return NextResponse.json(
        { error: 'Nome, e-mail institucional e perfil de acesso são obrigatórios.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 1. Verificar e-mail duplicado
    const existing = await prisma.usuario.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return NextResponse.json(
        { error: `Já existe um usuário cadastrado com o e-mail "${normalizedEmail}".` },
        { status: 400 }
      );
    }

    // 2. Hash da senha
    const rawPassword = senha && senha.trim() ? senha.trim() : 'senai123';
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    // 3. Criar usuário
    const novoUsuario = await prisma.usuario.create({
      data: {
        nome: nome.trim(),
        email: normalizedEmail,
        nif: nif ? String(nif).trim() : null,
        senha: hashedPassword,
        perfil,
        ativo: Boolean(ativo),
      },
      select: {
        id: true,
        nome: true,
        email: true,
        nif: true,
        perfil: true,
        ativo: true,
        createdAt: true,
      },
    });

    return NextResponse.json(novoUsuario, { status: 201 });
  } catch (error: any) {
    console.error('Erro ao cadastrar usuário:', error);
    return NextResponse.json(
      { error: 'Erro interno ao criar usuário.', details: error.message },
      { status: 500 }
    );
  }
}
