import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET /api/relatorios - Métricas consolidadas, ocupação docente, gargalos de UCs e grades de turmas
export async function GET() {
  try {
    const [docentes, turmas, ucs, areas] = await Promise.all([
      prisma.docente.findMany({
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
              turma: true,
              uc: true,
            },
          },
        },
        orderBy: {
          usuario: { nome: 'asc' },
        },
      }),

      prisma.turma.findMany({
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
            orderBy: [{ diaSemana: 'asc' }, { horario: 'asc' }],
          },
        },
        orderBy: { nome: 'asc' },
      }),

      prisma.unidadeCurricular.findMany({
        include: {
          area: true,
          docentesCompetentes: {
            include: {
              docente: {
                include: {
                  usuario: { select: { id: true, nome: true, email: true, ativo: true } },
                },
              },
            },
          },
        },
        orderBy: { nome: 'asc' },
      }),

      prisma.areaTecnologica.findMany({
        include: {
          unidadesCurriculares: true,
        },
        orderBy: { nome: 'asc' },
      }),
    ]);

    // 1. Relatório de Docentes e Carga Horária
    const relatorioDocentes = docentes.map((d) => {
      const totalAulas = d.atribuicoes.length;
      const horasAlocadas = totalAulas * 4;
      const cargaContratada = d.cargaHorariaContratada || 40;
      const horasLivres = Math.max(0, cargaContratada - horasAlocadas);
      const taxaOcupacao = Math.min(100, Math.round((horasAlocadas / cargaContratada) * 100));

      let statusCarga: 'OCIOSO' | 'EQUILIBRADO' | 'LOTADO' = 'EQUILIBRADO';
      if (taxaOcupacao >= 100) {
        statusCarga = 'LOTADO';
      } else if (taxaOcupacao < 60) {
        statusCarga = 'OCIOSO';
      }

      return {
        id: d.id,
        nome: d.usuario?.nome || 'Sem Nome',
        email: d.usuario?.email || '',
        tipoContratacao: d.tipoContratacao,
        cargaContratada,
        horasAlocadas,
        horasLivres,
        taxaOcupacao,
        totalAulas,
        statusCarga,
        areas: d.areas.map((a) => a.area.nome),
        totalCompetencias: d.competencias.length,
      };
    });

    // 2. Relatório de Gargalos Acadêmicos (UCs sem professores ou com poucos aptos)
    const gargalos = ucs.map((uc) => {
      const docentesAtivos = uc.docentesCompetentes.filter((dc) => dc.docente.usuario?.ativo);
      const totalDocentesAptos = docentesAtivos.length;

      let nivelRisco: 'CRITICO' | 'ALERTA' | 'NORMAL' = 'NORMAL';
      let motivoRisco = 'Quadro docente adequado para a disciplina.';

      if (totalDocentesAptos === 0) {
        nivelRisco = 'CRITICO';
        motivoRisco = 'Nenhum docente cadastrado possui competência técnica para ministrar esta UC.';
      } else if (totalDocentesAptos === 1) {
        nivelRisco = 'ALERTA';
        motivoRisco = 'Apenas 1 docente possui competência. Risco de indisponibilidade em caso de ausência.';
      }

      return {
        id: uc.id,
        nome: uc.nome,
        area: uc.area.nome,
        totalDocentesAptos,
        docentesNomes: docentesAtivos.map((dc) => dc.docente.usuario?.nome).filter(Boolean),
        nivelRisco,
        motivoRisco,
      };
    });

    // 3. Relatório de Turmas e Preenchimento
    const relatorioTurmas = turmas.map((t) => {
      const totalSlots = t.atribuicoes.length;
      const slotsPreenchidos = t.atribuicoes.filter((a) => a.docenteId !== null).length;
      const slotsPendentes = totalSlots - slotsPreenchidos;
      const taxaPreenchimento = totalSlots > 0 ? Math.round((slotsPreenchidos / totalSlots) * 100) : 0;

      return {
        id: t.id,
        nome: t.nome,
        area: t.area.nome,
        tipoCurso: t.tipoCurso,
        periodo: t.periodo,
        dataInicio: t.dataInicio,
        dataTermino: t.dataTermino,
        aulasSemanais: t.aulasSemanais,
        totalSlots,
        slotsPreenchidos,
        slotsPendentes,
        taxaPreenchimento,
        atribuicoes: t.atribuicoes.map((a) => ({
          id: a.id,
          diaSemana: a.diaSemana,
          horario: a.horario,
          local: a.local || 'A definir',
          ucNome: a.uc.nome,
          docenteNome: a.docente?.usuario?.nome || 'Pendente',
        })),
      };
    });

    // 4. Métricas Globais da Unidade
    const totalCargaContratada = relatorioDocentes.reduce((acc, curr) => acc + curr.cargaContratada, 0);
    const totalHorasAlocadas = relatorioDocentes.reduce((acc, curr) => acc + curr.horasAlocadas, 0);
    const eficienciaGeral = totalCargaContratada > 0 ? Math.round((totalHorasAlocadas / totalCargaContratada) * 100) : 0;

    const docentesOciosos = relatorioDocentes.filter((d) => d.statusCarga === 'OCIOSO').length;
    const docentesLotados = relatorioDocentes.filter((d) => d.statusCarga === 'LOTADO').length;
    const ucsCriticas = gargalos.filter((g) => g.nivelRisco === 'CRITICO').length;

    return NextResponse.json({
      metricasGlobais: {
        totalDocentes: relatorioDocentes.length,
        totalTurmas: relatorioTurmas.length,
        totalCargaContratada,
        totalHorasAlocadas,
        eficienciaGeral,
        docentesOciosos,
        docentesLotados,
        ucsCriticas,
      },
      relatorioDocentes,
      gargalos,
      relatorioTurmas,
      areas: areas.map((a) => ({ id: a.id, nome: a.nome })),
    });
  } catch (error: any) {
    console.error('Erro ao gerar relatórios executivos:', error);
    return NextResponse.json(
      { error: 'Erro interno ao processar relatórios.', details: error.message },
      { status: 500 }
    );
  }
}
