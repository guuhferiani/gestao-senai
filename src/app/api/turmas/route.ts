import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET /api/turmas - Listar todas as turmas com áreas, OPP responsável e contagem de UCs/atribuições
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.toLowerCase();
    const areaId = searchParams.get('areaId');
    const tipoCurso = searchParams.get('tipoCurso'); // TECNICO, CAI, FIC
    const periodo = searchParams.get('periodo'); // MANHA, TARDE, NOITE, INTEGRAL

    const turmas = await prisma.turma.findMany({
      include: {
        area: {
          select: {
            id: true,
            nome: true,
          },
        },
        atribuicoes: {
          include: {
            uc: {
              select: {
                id: true,
                nome: true,
                areaId: true,
              },
            },
            docente: {
              include: {
                usuario: {
                  select: {
                    id: true,
                    nome: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Buscar lista de OPPs cadastrados para preencher nomes quando houver oppResponsavelId
    const opps = await prisma.usuario.findMany({
      where: { perfil: 'OPP' },
      select: { id: true, nome: true, email: true },
    });
    const oppMap = new Map(opps.map((o) => [o.id, o]));

    // Mapear métricas calculadas por turma
    let result = turmas.map((turma) => {
      const oppResponsavel = turma.oppResponsavelId ? oppMap.get(turma.oppResponsavelId) || null : null;
      const totalUcs = new Set(turma.atribuicoes.map((a) => a.ucId)).size;
      const ucsAtribuidas = new Set(turma.atribuicoes.filter((a) => a.docenteId !== null).map((a) => a.ucId)).size;
      const percentualConclusao = totalUcs > 0 ? Math.round((ucsAtribuidas / totalUcs) * 100) : 0;

      return {
        ...turma,
        oppResponsavel,
        totalUcs,
        ucsAtribuidas,
        percentualConclusao,
      };
    });

    // Filtros em memória
    if (search) {
      result = result.filter(
        (t) =>
          t.nome.toLowerCase().includes(search) ||
          t.area.nome.toLowerCase().includes(search) ||
          (t.oppResponsavel && t.oppResponsavel.nome.toLowerCase().includes(search))
      );
    }

    if (areaId && areaId !== 'ALL') {
      result = result.filter((t) => t.areaId === areaId);
    }

    if (tipoCurso && tipoCurso !== 'ALL') {
      result = result.filter((t) => t.tipoCurso === tipoCurso);
    }

    if (periodo && periodo !== 'ALL') {
      result = result.filter((t) => t.periodo === periodo);
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Erro ao listar turmas:', error);
    return NextResponse.json(
      { error: 'Erro interno ao listar as turmas.', details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/turmas - Criar nova turma e vincular o plano de UCs
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      nome,
      areaId,
      oppResponsavelId,
      tipoCurso = 'TECNICO',
      dataInicio,
      dataTermino,
      aulasSemanais = 20,
      totalAulas = 400,
      diasSemana = 'Seg,Ter,Qua,Qui,Sex',
      periodo = 'MANHA',
      ucsIds = [],
    } = body;

    // 1. Validações
    if (!nome || !nome.trim()) {
      return NextResponse.json({ error: 'O nome da turma é obrigatório.' }, { status: 400 });
    }

    if (!areaId) {
      return NextResponse.json({ error: 'A Área Tecnológica é obrigatória.' }, { status: 400 });
    }

    if (!dataInicio || !dataTermino) {
      return NextResponse.json({ error: 'As datas de início e término são obrigatórias.' }, { status: 400 });
    }

    const dInicio = new Date(dataInicio);
    const dTermino = new Date(dataTermino);

    if (dInicio >= dTermino) {
      return NextResponse.json(
        { error: 'A data de término deve ser posterior à data de início.' },
        { status: 400 }
      );
    }

    // 2. Criação sequencial da turma e das atribuições iniciais
    const turma = await prisma.turma.create({
      data: {
        nome: nome.trim(),
        areaId,
        oppResponsavelId: oppResponsavelId || null,
        tipoCurso,
        dataInicio: dInicio,
        dataTermino: dTermino,
        aulasSemanais: Number(aulasSemanais) || 20,
        totalAulas: Number(totalAulas) || 400,
        diasSemana: Array.isArray(diasSemana) ? diasSemana.join(',') : diasSemana,
        periodo,
      },
    });

    // Se informou UCs do plano de curso, inicializa os registros de Atribuicao sequencialmente
    if (Array.isArray(ucsIds) && ucsIds.length > 0) {
      for (let index = 0; index < ucsIds.length; index++) {
        const ucId = ucsIds[index];
        await prisma.atribuicao.create({
          data: {
            turmaId: turma.id,
            ucId,
            docenteId: null,
            diaSemana: (index % 5) + 1, // 1 (Seg) a 5 (Sex) inicial
            horario: periodo === 'MANHA' ? '07:30 - 11:45' : periodo === 'TARDE' ? '13:15 - 17:30' : '18:45 - 22:30',
          },
        });
      }
    }

    const novaTurma = await prisma.turma.findUnique({
      where: { id: turma.id },
      include: {
        area: true,
        atribuicoes: {
          include: {
            uc: true,
          },
        },
      },
    });

    return NextResponse.json(novaTurma, { status: 201 });
  } catch (error: any) {
    console.error('Erro ao cadastrar turma:', error);
    return NextResponse.json(
      { error: 'Erro interno ao cadastrar a turma.', details: error.message },
      { status: 500 }
    );
  }
}
