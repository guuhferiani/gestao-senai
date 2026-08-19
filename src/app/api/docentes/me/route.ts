import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export const dynamic = 'force-dynamic';

// GET /api/docentes/me - Retorna os dados, métricas e agenda do docente autenticado
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: 'Não autenticado.' },
        { status: 401 }
      );
    }

    const email = session.user.email.trim().toLowerCase();

    const usuario = await prisma.usuario.findUnique({
      where: { email },
      include: {
        docente: {
          include: {
            areas: { include: { area: true } },
            competencias: { include: { uc: true } },
            atribuicoes: {
              include: {
                turma: { include: { area: true } },
                uc: true,
              },
              orderBy: [
                { diaSemana: 'asc' },
                { horario: 'asc' },
              ],
            },
          },
        },
      },
    });

    if (!usuario) {
      return NextResponse.json(
        { error: 'Usuário não encontrado.' },
        { status: 404 }
      );
    }

    // Se o usuário não tem registro de docente criado ainda, criar ou retornar estrutura vazia
    let docente = usuario.docente;
    if (!docente) {
      docente = await prisma.docente.create({
        data: {
          usuarioId: usuario.id,
          cargaHorariaContratada: 40,
          tipoContratacao: 'CLT 40h',
          dispManha: true,
          dispTarde: true,
          dispNoite: false,
          dispIntegral: false,
        },
        include: {
          areas: { include: { area: true } },
          competencias: { include: { uc: true } },
          atribuicoes: {
            include: {
              turma: { include: { area: true } },
              uc: true,
            },
          },
        },
      });
    }

    const totalAulasSemanais = docente.atribuicoes?.length || 0;
    const horasProgramadas = totalAulasSemanais * 4;
    const cargaContratada = docente.cargaHorariaContratada || 40;
    const horasLivres = Math.max(0, cargaContratada - horasProgramadas);
    const taxaOcupacao = Math.min(100, Math.round((horasProgramadas / cargaContratada) * 100));

    const turmasIds = Array.from(new Set(docente.atribuicoes?.map((a) => a.turmaId) || []));
    const ucsIds = Array.from(new Set(docente.atribuicoes?.map((a) => a.ucId) || []));

    const agenda = (docente.atribuicoes || []).map((a) => ({
      id: a.id,
      diaSemana: a.diaSemana,
      horario: a.horario,
      local: a.local || 'A definir',
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
        nome: usuario.nome,
        email: usuario.email,
        ativo: usuario.ativo,
        tipoContratacao: docente.tipoContratacao,
        cargaHorariaContratada: docente.cargaHorariaContratada,
        dispManha: docente.dispManha,
        dispTarde: docente.dispTarde,
        dispNoite: docente.dispNoite,
        dispIntegral: docente.dispIntegral,
        dispHorarios: docente.dispHorarios,
        observacoes: docente.observacoes,
        areas: docente.areas.map((a) => ({ id: a.area.id, nome: a.area.nome })),
        competencias: docente.competencias.map((c) => ({
          id: c.uc.id,
          nome: c.uc.nome,
        })),
      },
      metricas: {
        cargaContratada,
        horasProgramadas,
        horasLivres,
        taxaOcupacao,
        totalAulasSemanais,
        turmasAtendidas: turmasIds.length,
        ucsMinistradas: ucsIds.length,
      },
      agenda,
    });
  } catch (error: any) {
    console.error('Erro ao buscar dados do docente autenticado:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar perfil docente.', details: error.message },
      { status: 500 }
    );
  }
}
