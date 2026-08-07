import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET /api/dashboard/stats - Retorna métricas consolidadas para os gráficos e painéis do Dashboard
export async function GET() {
  try {
    const [docentes, turmas, areas, ucs, usuarios] = await Promise.all([
      prisma.docente.findMany({
        where: { usuario: { ativo: true } },
        include: {
          usuario: true,
          areas: { include: { area: true } },
          atribuicoes: true,
          competencias: true,
        },
      }),
      prisma.turma.findMany({
        include: {
          area: true,
          atribuicoes: {
            include: { docente: { include: { usuario: true } } },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.areaTecnologica.findMany({
        include: {
          unidadesCurriculares: true,
          docentes: true,
        },
      }),
      prisma.unidadeCurricular.findMany(),
      prisma.usuario.findMany({ where: { ativo: true } }),
    ]);

    // 1. Métricas Globais
    const totalDocentes = docentes.length;
    const totalTurmas = turmas.length;
    const totalAreas = areas.length;
    const totalUCs = ucs.length;

    const totalCargaContratada = docentes.reduce((acc, d) => acc + (d.cargaHorariaContratada || 40), 0);
    const totalHorasAlocadas = docentes.reduce((acc, d) => acc + d.atribuicoes.length * 4, 0);
    const eficienciaGeral = totalCargaContratada > 0 ? Math.round((totalHorasAlocadas / totalCargaContratada) * 100) : 0;

    // 2. Distribuição por Regime de Contratação
    const regimeCounts: { [key: string]: number } = {
      'CLT 40h': 0,
      'CLT 20h': 0,
      'Horista': 0,
    };

    docentes.forEach((d) => {
      if (d.tipoContratacao.includes('40')) {
        regimeCounts['CLT 40h'] += 1;
      } else if (d.tipoContratacao.includes('20')) {
        regimeCounts['CLT 20h'] += 1;
      } else {
        regimeCounts['Horista'] += 1;
      }
    });

    const regimesData = [
      { nome: 'CLT 40h', quantidade: regimeCounts['CLT 40h'], cor: '#e30613' },
      { nome: 'CLT 20h', quantidade: regimeCounts['CLT 20h'], cor: '#2563eb' },
      { nome: 'Horista', quantidade: regimeCounts['Horista'], cor: '#10b981' },
    ];

    // 3. Ocupação por Área Tecnológica
    const ocupacaoPorArea = areas.map((area) => {
      // Docentes que atuam nesta área
      const docentesArea = docentes.filter((d) => d.areas.some((da) => da.areaId === area.id));
      const cargaTotal = docentesArea.reduce((acc, d) => acc + (d.cargaHorariaContratada || 40), 0);
      const horasAlocadas = docentesArea.reduce((acc, d) => acc + d.atribuicoes.length * 4, 0);
      const taxaOcupacao = cargaTotal > 0 ? Math.min(100, Math.round((horasAlocadas / cargaTotal) * 100)) : 0;

      return {
        areaId: area.id,
        areaNome: area.nome,
        totalDocentes: docentesArea.length,
        totalUCs: area.unidadesCurriculares.length,
        cargaTotal,
        horasAlocadas,
        taxaOcupacao,
      };
    });

    // 4. Resumo das Turmas
    const turmasResumo = turmas.slice(0, 6).map((t) => {
      const totalSlots = t.atribuicoes.length;
      const preenchidos = t.atribuicoes.filter((a) => a.docenteId !== null).length;
      const percentual = totalSlots > 0 ? Math.round((preenchidos / totalSlots) * 100) : 0;

      return {
        id: t.id,
        nome: t.nome,
        areaNome: t.area.nome,
        periodo: t.periodo,
        tipoCurso: t.tipoCurso,
        totalSlots,
        preenchidos,
        percentual,
      };
    });

    return NextResponse.json({
      metricasGlobais: {
        totalDocentes,
        totalTurmas,
        totalAreas,
        totalUCs,
        totalCargaContratada,
        totalHorasAlocadas,
        eficienciaGeral,
      },
      regimesData,
      ocupacaoPorArea,
      turmasResumo,
    });
  } catch (error: any) {
    console.error('Erro ao buscar estatísticas do dashboard:', error);
    return NextResponse.json(
      { error: 'Erro interno ao consultar dashboard.', details: error.message },
      { status: 500 }
    );
  }
}
