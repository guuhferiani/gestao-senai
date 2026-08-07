import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

interface TurmaSimulada {
  id: string;
  nome: string;
  areaId: string;
  tipoCurso: string;
  periodo: string;
  aulasSemanais: number;
}

// POST /api/simulador - Processar cenário preditivo de turmas e calcular impacto na capacidade docente
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const turmasSimuladas: TurmaSimulada[] = body.turmas || [];

    // 1. Buscar docentes ativos com suas áreas, competências e horas alocadas
    const [docentes, areas] = await Promise.all([
      prisma.docente.findMany({
        where: {
          usuario: { ativo: true },
        },
        include: {
          usuario: {
            select: { id: true, nome: true, email: true },
          },
          areas: {
            include: { area: true },
          },
          competencias: {
            include: { uc: true },
          },
          atribuicoes: true,
        },
      }),
      prisma.areaTecnologica.findMany({
        include: {
          unidadesCurriculares: true,
        },
      }),
    ]);

    // 2. Calcular a capacidade livre atual de cada área
    const capacidadeAreaMap: {
      [areaId: string]: {
        areaNome: string;
        totalDocentes: number;
        cargaContratadaTotal: number;
        horasAlocadasAtuais: number;
        horasLivresAtuais: number;
        demandaHorasSimulada: number;
        turmasSimuladasQtd: number;
      };
    } = {};

    areas.forEach((area) => {
      capacidadeAreaMap[area.id] = {
        areaNome: area.nome,
        totalDocentes: 0,
        cargaContratadaTotal: 0,
        horasAlocadasAtuais: 0,
        horasLivresAtuais: 0,
        demandaHorasSimulada: 0,
        turmasSimuladasQtd: 0,
      };
    });

    // Mapear docentes em suas áreas
    docentes.forEach((d) => {
      const horasAlocadas = d.atribuicoes.length * 4;
      const cargaContratada = d.cargaHorariaContratada || 40;
      const saldoLivre = Math.max(0, cargaContratada - horasAlocadas);

      d.areas.forEach((da) => {
        if (capacidadeAreaMap[da.areaId]) {
          capacidadeAreaMap[da.areaId].totalDocentes += 1;
          capacidadeAreaMap[da.areaId].cargaContratadaTotal += cargaContratada;
          capacidadeAreaMap[da.areaId].horasAlocadasAtuais += horasAlocadas;
          capacidadeAreaMap[da.areaId].horasLivresAtuais += saldoLivre;
        }
      });
    });

    // 3. Processar a demanda de cada turma simulada
    let demandaTotalGeral = 0;

    turmasSimuladas.forEach((turma) => {
      // No SENAI, cada turma técnica tem em média 20h a 24h semanais de aula
      const horasTurma = turma.aulasSemanais ? turma.aulasSemanais * 1 : 20;
      demandaTotalGeral += horasTurma;

      if (capacidadeAreaMap[turma.areaId]) {
        capacidadeAreaMap[turma.areaId].demandaHorasSimulada += horasTurma;
        capacidadeAreaMap[turma.areaId].turmasSimuladasQtd += 1;
      }
    });

    // 4. Calcular diagnóstico e recomendação de contratação por área
    let deficitHorasGeral = 0;
    let novosDocentesRecomendadosGeral = 0;

    const diagnosticoAreas = Object.keys(capacidadeAreaMap).map((areaId) => {
      const item = capacidadeAreaMap[areaId];
      const saldoFinalHoras = item.horasLivresAtuais - item.demandaHorasSimulada;
      const deficit = saldoFinalHoras < 0 ? Math.abs(saldoFinalHoras) : 0;
      
      // Se houver déficit, calcular recomendação (1 docente 40h CLT para cada 32-40h ou horistas)
      let recomendacaoContratacao = 'Quadro docente atual é autossuficiente para atender o cenário planejado.';
      let status: 'AUTOSSUFICIENTE' | 'DEFICIT' | 'ALERTA' = 'AUTOSSUFICIENTE';
      let qtdDocentesNecessarios = 0;

      if (deficit > 0) {
        status = 'DEFICIT';
        deficitHorasGeral += deficit;
        qtdDocentesNecessarios = Math.ceil(deficit / 32); // 32h de aulas em média por docente 40h
        novosDocentesRecomendadosGeral += qtdDocentesNecessarios;

        if (deficit <= 20) {
          recomendacaoContratacao = `Déficit de ${deficit}h semanais: Recomendada a contratação de 1 Docente Horista (20h) ou ampliação de contrato existente.`;
        } else {
          recomendacaoContratacao = `Déficit crítico de ${deficit}h semanais: Recomendada a contratação de ${qtdDocentesNecessarios} novo(s) docente(s) CLT 40h na área de ${item.areaNome}.`;
        }
      } else if (item.horasLivresAtuais < item.demandaHorasSimulada * 1.15 && item.demandaHorasSimulada > 0) {
        status = 'ALERTA';
        recomendacaoContratacao = `Atenção: A área atenderá com margem estreita (restarão apenas ${saldoFinalHoras}h livres).`;
      }

      const taxaOcupacaoProjetada = item.cargaContratadaTotal > 0
        ? Math.min(100, Math.round(((item.horasAlocadasAtuais + item.demandaHorasSimulada) / item.cargaContratadaTotal) * 100))
        : 0;

      return {
        areaId,
        areaNome: item.areaNome,
        totalDocentesAtuais: item.totalDocentes,
        horasLivresAtuais: item.horasLivresAtuais,
        demandaHorasSimulada: item.demandaHorasSimulada,
        turmasSimuladasQtd: item.turmasSimuladasQtd,
        saldoFinalHoras,
        deficit,
        status,
        taxaOcupacaoProjetada,
        qtdDocentesNecessarios,
        recomendacaoContratacao,
      };
    });

    const horasAtendidasPeloQuadro = Math.max(0, demandaTotalGeral - deficitHorasGeral);

    return NextResponse.json({
      metricasSimulacao: {
        totalTurmasSimuladas: turmasSimuladas.length,
        demandaTotalGeral,
        horasAtendidasPeloQuadro,
        deficitHorasGeral,
        novosDocentesRecomendadosGeral,
        autossuficiente: deficitHorasGeral === 0,
      },
      diagnosticoAreas,
    });
  } catch (error: any) {
    console.error('Erro no simulador de demanda:', error);
    return NextResponse.json(
      { error: 'Erro interno ao processar simulação de demanda.', details: error.message },
      { status: 500 }
    );
  }
}
