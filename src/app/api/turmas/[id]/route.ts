import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/turmas/[id] - Obter detalhes completos da turma, grade e atribuições
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    const turma = await prisma.turma.findUnique({
      where: { id },
      include: {
        area: true,
        atribuicoes: {
          include: {
            uc: true,
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
    });

    if (!turma) {
      return NextResponse.json({ error: 'Turma não encontrada.' }, { status: 404 });
    }

    let oppResponsavel = null;
    if (turma.oppResponsavelId) {
      oppResponsavel = await prisma.usuario.findUnique({
        where: { id: turma.oppResponsavelId },
        select: { id: true, nome: true, email: true },
      });
    }

    return NextResponse.json({ ...turma, oppResponsavel });
  } catch (error: any) {
    console.error('Erro ao buscar detalhes da turma:', error);
    return NextResponse.json(
      { error: 'Erro interno ao buscar a turma.', details: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/turmas/[id] - Atualizar dados da turma e sincronizar o plano de UCs
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    const {
      nome,
      areaId,
      oppResponsavelId,
      tipoCurso,
      dataInicio,
      dataTermino,
      aulasSemanais,
      totalAulas,
      diasSemana,
      periodo,
      ucsIds,
    } = body;

    const turmaExistente = await prisma.turma.findUnique({
      where: { id },
      include: { atribuicoes: true },
    });

    if (!turmaExistente) {
      return NextResponse.json({ error: 'Turma não encontrada.' }, { status: 404 });
    }

    const updateData: any = {};
    if (nome) updateData.nome = nome.trim();
    if (areaId) updateData.areaId = areaId;
    if (oppResponsavelId !== undefined) updateData.oppResponsavelId = oppResponsavelId || null;
    if (tipoCurso) updateData.tipoCurso = tipoCurso;
    if (dataInicio) updateData.dataInicio = new Date(dataInicio);
    if (dataTermino) updateData.dataTermino = new Date(dataTermino);
    if (aulasSemanais !== undefined) updateData.aulasSemanais = Number(aulasSemanais);
    if (totalAulas !== undefined) updateData.totalAulas = Number(totalAulas);
    if (diasSemana !== undefined) {
      updateData.diasSemana = Array.isArray(diasSemana) ? diasSemana.join(',') : diasSemana;
    }
    if (periodo) updateData.periodo = periodo;

    await prisma.turma.update({
      where: { id },
      data: updateData,
    });

    // Se informou lista de UCs, sincroniza as Atribuições
    if (Array.isArray(ucsIds)) {
      // Obter UCs já existentes para não apagar atribuições com docentes
      const ucsExistentes = turmaExistente.atribuicoes.map((a) => a.ucId);
      const ucsParaAdicionar = ucsIds.filter((ucId: string) => !ucsExistentes.includes(ucId));
      const ucsParaRemover = ucsExistentes.filter((ucId: string) => !ucsIds.includes(ucId));

      if (ucsParaRemover.length > 0) {
        await prisma.atribuicao.deleteMany({
          where: {
            turmaId: id,
            ucId: { in: ucsParaRemover },
          },
        });
      }

      if (ucsParaAdicionar.length > 0) {
        const periodoFinal = periodo || turmaExistente.periodo;
        for (let index = 0; index < ucsParaAdicionar.length; index++) {
          const ucId = ucsParaAdicionar[index];
          await prisma.atribuicao.create({
            data: {
              turmaId: id,
              ucId,
              docenteId: null,
              diaSemana: (index % 5) + 1,
              horario: periodoFinal === 'MANHA' ? '07:30 - 11:45' : periodoFinal === 'TARDE' ? '13:15 - 17:30' : '18:45 - 22:30',
            },
          });
        }
      }
    }

    const turmaAtualizada = await prisma.turma.findUnique({
      where: { id },
      include: {
        area: true,
        atribuicoes: {
          include: {
            uc: true,
            docente: {
              include: {
                usuario: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(turmaAtualizada);
  } catch (error: any) {
    console.error('Erro ao atualizar turma:', error);
    return NextResponse.json(
      { error: 'Erro interno ao atualizar a turma.', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/turmas/[id] - Excluir turma e suas atribuições vinculadas
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    const turma = await prisma.turma.findUnique({
      where: { id },
    });

    if (!turma) {
      return NextResponse.json({ error: 'Turma não encontrada.' }, { status: 404 });
    }

    await prisma.atribuicao.deleteMany({ where: { turmaId: id } });
    await prisma.turma.delete({ where: { id } });

    return NextResponse.json({ message: 'Turma excluída com sucesso.' });
  } catch (error: any) {
    console.error('Erro ao excluir turma:', error);
    return NextResponse.json(
      { error: 'Erro interno ao excluir a turma.', details: error.message },
      { status: 500 }
    );
  }
}
