import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET /api/atribuicoes/disponibilidade
// Parâmetros: turmaId, ucId, diaSemana, horario
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const turmaId = searchParams.get('turmaId');
    const ucId = searchParams.get('ucId');
    const diaSemanaParam = searchParams.get('diaSemana');
    const horario = searchParams.get('horario');

    if (!turmaId || !ucId) {
      return NextResponse.json(
        { error: 'Os parâmetros turmaId e ucId são obrigatórios.' },
        { status: 400 }
      );
    }

    const diaSemana = diaSemanaParam ? Number(diaSemanaParam) : 1;

    // 1. Buscar a Turma e a UC
    const [turma, uc] = await Promise.all([
      prisma.turma.findUnique({
        where: { id: turmaId },
        include: { area: true },
      }),
      prisma.unidadeCurricular.findUnique({
        where: { id: ucId },
        include: { area: true },
      }),
    ]);

    if (!turma || !uc) {
      return NextResponse.json(
        { error: 'Turma ou Unidade Curricular não encontrada.' },
        { status: 404 }
      );
    }

    // 2. Buscar todos os docentes com suas competências, áreas e atribuições já existentes
    const docentes = await prisma.docente.findMany({
      where: {
        usuario: { ativo: true },
      },
      include: {
        usuario: {
          select: { id: true, nome: true, email: true, ativo: true },
        },
        areas: {
          include: { area: true },
        },
        competencias: {
          include: { uc: true },
        },
        atribuicoes: {
          include: {
            turma: {
              select: { id: true, nome: true, periodo: true },
            },
            uc: {
              select: { id: true, nome: true },
            },
          },
        },
      },
    });

    // 3. Avaliar disponibilidade de cada docente
    const resultado = docentes.map((docente) => {
      // a) Possui competência técnica na UC?
      const temCompetencia = docente.competencias.some((c) => c.ucId === ucId);

      // b) Pertence à Área Tecnológica da Turma?
      const temArea = docente.areas.some((a) => a.areaId === turma.areaId);

      // c) Tem disponibilidade no Turno da Turma?
      const temTurno =
        turma.periodo === 'MANHA'
          ? docente.dispManha || docente.dispIntegral
          : turma.periodo === 'TARDE'
          ? docente.dispTarde || docente.dispIntegral
          : turma.periodo === 'NOITE'
          ? docente.dispNoite
          : docente.dispIntegral || (docente.dispManha && docente.dispTarde);

      // d) Possui conflito de dia e horário em outra aula/turma?
      const conflito = docente.atribuicoes.find(
        (a) =>
          a.diaSemana === diaSemana &&
          a.horario === horario &&
          a.turmaId !== turmaId // outra turma
      );

      // e) Carga horária calculada (cada atribuição = ~4 horas/semana estimadas ou contagem de slots)
      const totalHorasAlocadas = docente.atribuicoes.length * 4;
      const limiteCargaAtingido = totalHorasAlocadas >= docente.cargaHorariaContratada;

      // Classificação do status e motivo
      let status: 'DISPONIVEL' | 'INDISPONIVEL' = 'DISPONIVEL';
      let motivo = 'Apto e com disponibilidade confirmada.';

      if (conflito) {
        status = 'INDISPONIVEL';
        motivo = `Conflito de Horário: Já leciona na turma "${conflito.turma.nome}" (${conflito.uc.nome}) neste mesmo dia e horário.`;
      } else if (!temCompetencia) {
        status = 'INDISPONIVEL';
        motivo = `Sem Competência Técnica: O docente não possui a UC "${uc.nome}" cadastrada em seu perfil.`;
      } else if (!temTurno) {
        status = 'INDISPONIVEL';
        motivo = `Sem Disponibilidade no Turno: Não possui disponibilidade cadastrada para o turno ${turma.periodo}.`;
      } else if (limiteCargaAtingido) {
        status = 'INDISPONIVEL';
        motivo = `Carga Horária Máxima Atingida: Já possui ${totalHorasAlocadas}h alocadas de ${docente.cargaHorariaContratada}h contratadas.`;
      }

      return {
        id: docente.id,
        nome: docente.usuario?.nome || 'Docente Sem Nome',
        email: docente.usuario?.email || '',
        tipoContratacao: docente.tipoContratacao,
        cargaHorariaContratada: docente.cargaHorariaContratada,
        horasAlocadas: totalHorasAlocadas,
        status,
        motivo,
        temCompetencia,
        temArea,
        temTurno,
        conflito: conflito
          ? {
              turmaNome: conflito.turma.nome,
              ucNome: conflito.uc.nome,
              horario: conflito.horario,
            }
          : null,
      };
    });

    // Ordenar: Disponíveis primeiro, depois por nome
    resultado.sort((a, b) => {
      if (a.status === 'DISPONIVEL' && b.status !== 'DISPONIVEL') return -1;
      if (a.status !== 'DISPONIVEL' && b.status === 'DISPONIVEL') return 1;
      return a.nome.localeCompare(b.nome);
    });

    return NextResponse.json({
      turma: {
        id: turma.id,
        nome: turma.nome,
        area: turma.area.nome,
        periodo: turma.periodo,
      },
      uc: {
        id: uc.id,
        nome: uc.nome,
      },
      diaSemana,
      horario,
      docentes: resultado,
    });
  } catch (error: any) {
    console.error('Erro ao verificar disponibilidade docente:', error);
    return NextResponse.json(
      { error: 'Erro interno ao consultar disponibilidade.', details: error.message },
      { status: 500 }
    );
  }
}
