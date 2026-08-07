import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET /api/atribuicoes - Obter turmas com grade e atribuições de aulas
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const turmaId = searchParams.get('turmaId');

    const where: any = {};
    if (turmaId && turmaId !== 'ALL') {
      where.id = turmaId;
    }

    const turmas = await prisma.turma.findMany({
      where,
      include: {
        area: true,
        atribuicoes: {
          include: {
            uc: true,
            docente: {
              include: {
                usuario: {
                  select: { id: true, nome: true, email: true },
                },
              },
            },
          },
          orderBy: [
            { diaSemana: 'asc' },
            { horario: 'asc' },
          ],
        },
      },
      orderBy: { nome: 'asc' },
    });

    // Métricas gerais
    let totalSlots = 0;
    let slotsAtribuidos = 0;

    turmas.forEach((t) => {
      totalSlots += t.atribuicoes.length;
      slotsAtribuidos += t.atribuicoes.filter((a) => a.docenteId !== null).length;
    });

    const slotsPendentes = totalSlots - slotsAtribuidos;
    const taxaGeralOcupacao = totalSlots > 0 ? Math.round((slotsAtribuidos / totalSlots) * 100) : 0;

    return NextResponse.json({
      turmas,
      metricas: {
        totalSlots,
        slotsAtribuidos,
        slotsPendentes,
        taxaGeralOcupacao,
      },
    });
  } catch (error: any) {
    console.error('Erro ao buscar atribuições:', error);
    return NextResponse.json(
      { error: 'Erro interno ao consultar matriz de atribuição.', details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/atribuicoes - Atribuir ou atualizar docente e local em um slot de aula
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { atribuicaoId, docenteId, local, diaSemana, horario } = body;

    if (!atribuicaoId) {
      return NextResponse.json(
        { error: 'O ID do slot de atribuição é obrigatório.' },
        { status: 400 }
      );
    }

    // 1. Buscar a atribuição atual
    const atribuicaoAtual = await prisma.atribuicao.findUnique({
      where: { id: atribuicaoId },
      include: {
        turma: true,
        uc: true,
      },
    });

    if (!atribuicaoAtual) {
      return NextResponse.json(
        { error: 'Slot de aula não encontrado.' },
        { status: 404 }
      );
    }

    const diaFinal = diaSemana !== undefined ? Number(diaSemana) : atribuicaoAtual.diaSemana;
    const horarioFinal = horario || atribuicaoAtual.horario;

    // 2. Se for atribuir um docente, verificar conflitos de agenda
    if (docenteId) {
      const docente = await prisma.docente.findUnique({
        where: { id: docenteId },
        include: {
          usuario: true,
          competencias: true,
          areas: true,
          atribuicoes: {
            include: {
              turma: true,
              uc: true,
            },
          },
        },
      });

      if (!docente) {
        return NextResponse.json(
          { error: 'Docente não encontrado.' },
          { status: 404 }
        );
      }

      // Validação a: Competência técnica
      const temCompetencia = docente.competencias.some(
        (c) => c.ucId === atribuicaoAtual.ucId
      );
      if (!temCompetencia) {
        return NextResponse.json(
          {
            error: `Bloqueio: O professor ${docente.usuario?.nome || ''} não possui competência técnica cadastrada para a UC "${atribuicaoAtual.uc.nome}".`,
          },
          { status: 400 }
        );
      }

      // Validação b: Conflito de choque de horários em outra turma
      const conflito = docente.atribuicoes.find(
        (a) =>
          a.id !== atribuicaoId && // não é o mesmo slot
          a.diaSemana === diaFinal &&
          a.horario === horarioFinal
      );

      if (conflito) {
        return NextResponse.json(
          {
            error: `Conflito de Horário: O professor ${docente.usuario?.nome || ''} já possui aula na turma "${conflito.turma.nome}" (${conflito.uc.nome}) no mesmo dia e horário.`,
          },
          { status: 400 }
        );
      }
    }

    // 3. Atualizar o slot de atribuição
    const atualizado = await prisma.atribuicao.update({
      where: { id: atribuicaoId },
      data: {
        docenteId: docenteId || null,
        local: local !== undefined ? local : atribuicaoAtual.local,
        diaSemana: diaFinal,
        horario: horarioFinal,
      },
      include: {
        turma: true,
        uc: true,
        docente: {
          include: {
            usuario: true,
          },
        },
      },
    });

    return NextResponse.json(atualizado);
  } catch (error: any) {
    console.error('Erro ao salvar atribuição:', error);
    return NextResponse.json(
      { error: 'Erro interno ao salvar atribuição.', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/atribuicoes - Desalocar docente de um slot de aula
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID do slot de atribuição é obrigatório.' },
        { status: 400 }
      );
    }

    const atualizado = await prisma.atribuicao.update({
      where: { id },
      data: {
        docenteId: null,
      },
      include: {
        turma: true,
        uc: true,
      },
    });

    return NextResponse.json({
      message: 'Docente desalocado com sucesso. O slot de aula retornou para o status pendente.',
      atribuicao: atualizado,
    });
  } catch (error: any) {
    console.error('Erro ao desalocar docente:', error);
    return NextResponse.json(
      { error: 'Erro interno ao desalocar docente.', details: error.message },
      { status: 500 }
    );
  }
}
