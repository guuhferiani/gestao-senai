import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET /api/docentes/[id]/agenda - Retornar perfil completo, métricas de capacidade e agenda do docente
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const docente = await prisma.docente.findUnique({
      where: { id },
      include: {
        usuario: {
          select: { id: true, nome: true, email: true, ativo: true },
        },
        areas: {
          include: { area: true },
        },
        competencias: {
          include: {
            uc: {
              include: { area: true },
            },
          },
        },
        atribuicoes: {
          include: {
            turma: {
              include: {
                area: true,
              },
            },
            uc: true,
          },
          orderBy: [
            { diaSemana: 'asc' },
            { horario: 'asc' },
          ],
        },
      },
    });

    if (!docente) {
      return NextResponse.json(
        { error: 'Docente não encontrado no sistema.' },
        { status: 404 }
      );
    }

    // Cálculo das métricas de carga horária e capacidade
    const totalAulasSemanais = docente.atribuicoes.length;
    // Cada slot de aula no padrão SENAI equivale a ~4 horas semanais
    const horasProgramadas = totalAulasSemanais * 4;
    const cargaContratada = docente.cargaHorariaContratada || 40;
    const horasLivres = Math.max(0, cargaContratada - horasProgramadas);
    const taxaOcupacao = Math.min(100, Math.round((horasProgramadas / cargaContratada) * 100));

    // Turmas distintas atendidas
    const turmasIds = Array.from(new Set(docente.atribuicoes.map((a) => a.turmaId)));
    const turmasAtendidas = turmasIds.length;

    // UCs distintas ministradas
    const ucsIds = Array.from(new Set(docente.atribuicoes.map((a) => a.ucId)));
    const ucsMinistradas = ucsIds.length;

    // Formatar agenda estruturada
    const agenda = docente.atribuicoes.map((a) => ({
      id: a.id,
      diaSemana: a.diaSemana,
      horario: a.horario,
      local: a.local || 'Ambiente Pedagógico Principal',
      turma: {
        id: a.turma.id,
        nome: a.turma.nome,
        tipoCurso: a.turma.tipoCurso,
        periodo: a.turma.periodo,
        area: a.turma.area.nome,
        dataInicio: a.turma.dataInicio,
        dataTermino: a.turma.dataTermino,
      },
      uc: {
        id: a.uc.id,
        nome: a.uc.nome,
      },
    }));

    return NextResponse.json({
      docente: {
        id: docente.id,
        nome: docente.usuario?.nome || 'Docente Sem Nome',
        email: docente.usuario?.email || '',
        ativo: docente.usuario?.ativo ?? true,
        tipoContratacao: docente.tipoContratacao,
        cargaHorariaContratada: cargaContratada,
        dispManha: docente.dispManha,
        dispTarde: docente.dispTarde,
        dispNoite: docente.dispNoite,
        dispIntegral: docente.dispIntegral,
        observacoes: docente.observacoes,
        areas: docente.areas.map((a) => ({
          id: a.area.id,
          nome: a.area.nome,
        })),
        competencias: docente.competencias.map((c) => ({
          id: c.uc.id,
          nome: c.uc.nome,
          area: c.uc.area.nome,
        })),
      },
      metricas: {
        cargaContratada,
        horasProgramadas,
        horasLivres,
        taxaOcupacao,
        totalAulasSemanais,
        turmasAtendidas,
        ucsMinistradas,
      },
      agenda,
    });
  } catch (error: any) {
    console.error('Erro ao consultar agenda do docente:', error);
    return NextResponse.json(
      { error: 'Erro interno ao consultar agenda.', details: error.message },
      { status: 500 }
    );
  }
}
