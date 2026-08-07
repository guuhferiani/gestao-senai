import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export interface NotificacaoAlerta {
  id: string;
  tipo: 'danger' | 'warning' | 'info' | 'success';
  titulo: string;
  mensagem: string;
  link: string;
  tempo: string;
}

// GET /api/notificacoes - Retorna alertas compilados em tempo real
export async function GET() {
  try {
    const [turmas, docentes, ucs] = await Promise.all([
      prisma.turma.findMany({
        include: {
          area: true,
          atribuicoes: {
            include: { uc: true, docente: true },
          },
        },
      }),
      prisma.docente.findMany({
        where: { usuario: { ativo: true } },
        include: {
          usuario: true,
          atribuicoes: true,
        },
      }),
      prisma.unidadeCurricular.findMany({
        include: {
          area: true,
          docentesCompetentes: {
            include: { docente: { include: { usuario: true } } },
          },
        },
      }),
    ]);

    const notificacoes: NotificacaoAlerta[] = [];

    // 1. Alertas de Turmas com Aulas Pendentes
    turmas.forEach((turma) => {
      const totalAulas = turma.atribuicoes.length;
      const aulasPendentes = turma.atribuicoes.filter((a) => a.docenteId === null).length;

      if (aulasPendentes > 0) {
        notificacoes.push({
          id: `turma-pendente-${turma.id}`,
          tipo: 'danger',
          titulo: `Turma com ${aulasPendentes} aula(s) sem professor`,
          mensagem: `A turma "${turma.nome}" possui disciplinas pendentes de atribuição docente.`,
          link: `/atribuicoes?turmaId=${turma.id}`,
          tempo: 'Atenção imediata',
        });
      } else if (totalAulas > 0) {
        notificacoes.push({
          id: `turma-completa-${turma.id}`,
          tipo: 'success',
          titulo: `Grade 100% atribuída`,
          mensagem: `A turma "${turma.nome}" está com todas as ${totalAulas} aulas atribuídas e pronta para início.`,
          link: `/atribuicoes?turmaId=${turma.id}`,
          tempo: 'Concluído',
        });
      }
    });

    // 2. Alertas de Gargalos de UCs (Disciplinas sem nenhum professor habilitado)
    ucs.forEach((uc) => {
      const docentesAptos = uc.docentesCompetentes.filter((dc) => dc.docente.usuario?.ativo);
      if (docentesAptos.length === 0) {
        notificacoes.push({
          id: `uc-gargalo-${uc.id}`,
          tipo: 'danger',
          titulo: `Gargalo: UC "${uc.nome}" sem docente`,
          mensagem: `Nenhum professor cadastrado possui competência para ministrar esta disciplina na área de ${uc.area.nome}.`,
          link: `/areas`,
          tempo: 'Gargalo Crítico',
        });
      }
    });

    // 3. Alertas de Professores com Carga Horária no Limite (100%)
    docentes.forEach((d) => {
      const horasAlocadas = d.atribuicoes.length * 4;
      const cargaContratada = d.cargaHorariaContratada || 40;

      if (horasAlocadas >= cargaContratada) {
        notificacoes.push({
          id: `docente-lotado-${d.id}`,
          tipo: 'warning',
          titulo: `Professor no limite contratual (100%)`,
          mensagem: `${d.usuario?.nome || 'Docente'} atingiu ${horasAlocadas}h de ${cargaContratada}h alocadas na grade semanal.`,
          link: `/docentes/${d.id}/agenda`,
          tempo: 'Carga Máxima',
        });
      }
    });

    const totalPendentes = notificacoes.filter((n) => n.tipo === 'danger' || n.tipo === 'warning').length;

    return NextResponse.json({
      total: notificacoes.length,
      totalPendentes,
      notificacoes,
    });
  } catch (error: any) {
    console.error('Erro ao gerar notificações:', error);
    return NextResponse.json(
      { error: 'Erro interno ao consultar notificações.', details: error.message },
      { status: 500 }
    );
  }
}
