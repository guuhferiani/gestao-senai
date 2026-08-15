import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

// GET /api/docentes - Listar todos os docentes com suas áreas, competências e usuário
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.toLowerCase();
    const areaId = searchParams.get('areaId');
    const status = searchParams.get('status');
    const turno = searchParams.get('turno'); // manha, tarde, noite, integral

    const docentes = await prisma.docente.findMany({
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
            perfil: true,
            ativo: true,
            createdAt: true,
          },
        },
        areas: {
          include: {
            area: {
              select: {
                id: true,
                nome: true,
              },
            },
          },
        },
        competencias: {
          include: {
            uc: {
              select: {
                id: true,
                nome: true,
                areaId: true,
              },
            },
          },
        },
        atribuicoes: {
          select: {
            id: true,
            turmaId: true,
            horario: true,
            diaSemana: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Filtros em memória (para filtros compostos e flexíveis)
    let filtered = docentes;

    if (search) {
      filtered = filtered.filter(
        (d) =>
          d.usuario?.nome.toLowerCase().includes(search) ||
          d.usuario?.email.toLowerCase().includes(search) ||
          d.areas.some((a) => a.area.nome.toLowerCase().includes(search)) ||
          d.competencias.some((c) => c.uc.nome.toLowerCase().includes(search))
      );
    }

    if (areaId && areaId !== 'ALL') {
      filtered = filtered.filter((d) => d.areas.some((a) => a.areaId === areaId));
    }

    if (status && status !== 'ALL') {
      const isAtivo = status === 'ATIVO';
      filtered = filtered.filter((d) => d.usuario?.ativo === isAtivo);
    }

    if (turno && turno !== 'ALL') {
      if (turno === 'MANHA') filtered = filtered.filter((d) => d.dispManha);
      if (turno === 'TARDE') filtered = filtered.filter((d) => d.dispTarde);
      if (turno === 'NOITE') filtered = filtered.filter((d) => d.dispNoite);
      if (turno === 'INTEGRAL') filtered = filtered.filter((d) => d.dispIntegral);
    }

    return NextResponse.json(filtered);
  } catch (error: any) {
    console.error('Erro ao buscar docentes:', error);
    return NextResponse.json(
      { error: 'Erro interno ao listar os docentes.', details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/docentes - Cadastrar novo docente com competências e áreas
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      nome,
      email,
      senha,
      ativo = true,
      cargaHorariaContratada = 40,
      tipoContratacao = 'CLT',
      observacoes,
      dispManha = false,
      dispTarde = false,
      dispNoite = false,
      dispIntegral = false,
      dispHorarios,
      areasIds = [],
      competenciasIds = [],
    } = body;

    // 1. Validações básicas
    if (!nome || !nome.trim()) {
      return NextResponse.json({ error: 'O nome do docente é obrigatório.' }, { status: 400 });
    }

    if (!email || !email.trim()) {
      return NextResponse.json({ error: 'O e-mail do docente é obrigatório.' }, { status: 400 });
    }

    const emailNormalizado = email.trim().toLowerCase();

    // 2. Verificar se e-mail já existe
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { email: emailNormalizado },
    });

    if (usuarioExistente) {
      return NextResponse.json(
        { error: 'Já existe um usuário cadastrado com este e-mail.' },
        { status: 400 }
      );
    }

    // 3. Validação de áreas
    if (!Array.isArray(areasIds) || areasIds.length === 0) {
      return NextResponse.json(
        { error: 'O docente deve ser vinculado a pelo menos uma Área Tecnológica.' },
        { status: 400 }
      );
    }

    // Hash da senha (se não informada, usa padrão 'senai123')
    const senhaFinal = senha && senha.trim() ? senha : 'senai123';
    const senhaHash = await bcrypt.hash(senhaFinal, 10);

    // Calcular disponibilidades a partir dos blocos se fornecido
    const horariosArray: string[] = Array.isArray(dispHorarios)
      ? dispHorarios
      : typeof dispHorarios === 'string' && dispHorarios.startsWith('[')
      ? JSON.parse(dispHorarios)
      : [];

    const hasManha = horariosArray.length > 0 ? horariosArray.some((h) => h.startsWith('M')) : Boolean(dispManha);
    const hasTarde = horariosArray.length > 0 ? horariosArray.some((h) => h.startsWith('T')) : Boolean(dispTarde);
    const hasNoite = horariosArray.length > 0 ? horariosArray.some((h) => h.startsWith('N')) : Boolean(dispNoite);
    const hasIntegral = Boolean(dispIntegral) || (hasManha && hasTarde && hasNoite);
    const dispHorariosString = horariosArray.length > 0 ? JSON.stringify(horariosArray) : typeof dispHorarios === 'string' ? dispHorarios : null;

    // 4. Executar inserção relacional sequencial
    const usuario = await prisma.usuario.create({
      data: {
        nome: nome.trim(),
        email: emailNormalizado,
        senha: senhaHash,
        perfil: 'DOCENTE',
        ativo: Boolean(ativo),
      },
    });

    // Cria registro de Docente
    const docente = await prisma.docente.create({
      data: {
        usuarioId: usuario.id,
        cargaHorariaContratada: Number(cargaHorariaContratada) || 40,
        tipoContratacao: tipoContratacao || 'CLT',
        observacoes: observacoes ? observacoes.trim() : null,
        dispManha: hasManha,
        dispTarde: hasTarde,
        dispNoite: hasNoite,
        dispIntegral: hasIntegral,
        dispHorarios: dispHorariosString,
      },
    });

    // Vincula Áreas Tecnológicas sequencialmente
    if (areasIds.length > 0) {
      for (const areaId of areasIds) {
        await prisma.docenteArea.create({
          data: {
            docenteId: docente.id,
            areaId,
          },
        });
      }
    }

    // Vincula Competências (UCs) sequencialmente
    if (Array.isArray(competenciasIds) && competenciasIds.length > 0) {
      for (const ucId of competenciasIds) {
        await prisma.docenteUC.create({
          data: {
            docenteId: docente.id,
            ucId,
          },
        });
      }
    }

    // Retorna com dados completos
    const novoDocente = await prisma.docente.findUnique({
      where: { id: docente.id },
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
            perfil: true,
            ativo: true,
          },
        },
        areas: {
          include: {
            area: true,
          },
        },
        competencias: {
          include: {
            uc: true,
          },
        },
      },
    });

    return NextResponse.json(novoDocente, { status: 201 });
  } catch (error: any) {
    console.error('Erro ao cadastrar docente:', error);
    return NextResponse.json(
      { error: 'Erro interno ao cadastrar o docente.', details: error.message },
      { status: 500 }
    );
  }
}
