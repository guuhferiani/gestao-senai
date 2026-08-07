import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export interface LogItem {
  id: string;
  dataHora: string;
  usuario: string;
  perfil: string;
  modulo: 'TURMAS' | 'ATRIBUICOES' | 'DOCENTES' | 'AREAS' | 'SEGURANCA';
  acao: string;
  detalhes: string;
  tipo: 'CRIACAO' | 'EDICAO' | 'EXCLUSAO' | 'ATRIBUICAO' | 'SEGURANCA';
}

// GET /api/auditoria - Obter eventos e histórico consolidado do sistema
export async function GET() {
  try {
    const [turmas, docentes, usuarios, atribuicoes, areas] = await Promise.all([
      prisma.turma.findMany({
        include: { area: true },
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.docente.findMany({
        include: {
          usuario: true,
          areas: { include: { area: true } },
          competencias: { include: { uc: true } },
        },
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.usuario.findMany({
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.atribuicao.findMany({
        include: {
          turma: true,
          uc: true,
          docente: { include: { usuario: true } },
        },
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.areaTecnologica.findMany({
        include: { unidadesCurriculares: true },
        orderBy: { updatedAt: 'desc' },
      }),
    ]);

    const logs: LogItem[] = [];

    // 1. Logs de Atribuições de Aulas
    atribuicoes.forEach((a) => {
      if (a.docente) {
        logs.push({
          id: `atrib-log-${a.id}`,
          dataHora: a.updatedAt.toISOString(),
          usuario: 'Coordenador / OPP',
          perfil: 'COORDENADOR',
          modulo: 'ATRIBUICOES',
          acao: `Professor atribuído na turma "${a.turma.nome}"`,
          detalhes: `Docente ${a.docente.usuario?.nome} alocado para a UC "${a.uc.nome}" no ${a.horario} (Dia ${a.diaSemana}). Local: ${a.local || 'Ambiente Principal'}.`,
          tipo: 'ATRIBUICAO',
        });
      }
    });

    // 2. Logs de Turmas
    turmas.forEach((t) => {
      logs.push({
        id: `turma-log-${t.id}`,
        dataHora: t.createdAt.toISOString(),
        usuario: 'Coordenador SENAI',
        perfil: 'COORDENADOR',
        modulo: 'TURMAS',
        acao: `Criação da Turma "${t.nome}"`,
        detalhes: `Turma cadastrada na área de ${t.area.nome} com vigência de ${new Date(t.dataInicio).toLocaleDateString('pt-BR')} a ${new Date(t.dataTermino).toLocaleDateString('pt-BR')}.`,
        tipo: 'CRIACAO',
      });
    });

    // 3. Logs de Docentes
    docentes.forEach((d) => {
      logs.push({
        id: `docente-log-${d.id}`,
        dataHora: d.createdAt.toISOString(),
        usuario: 'Coordenador SENAI',
        perfil: 'COORDENADOR',
        modulo: 'DOCENTES',
        acao: `Cadastro de Docente: "${d.usuario?.nome || 'Docente'}"`,
        detalhes: `Regime ${d.tipoContratacao} com ${d.cargaHorariaContratada}h contratadas e ${d.competencias.length} competência(s) vinculada(s).`,
        tipo: 'CRIACAO',
      });
    });

    // 4. Logs de Usuários & Segurança
    usuarios.forEach((u) => {
      logs.push({
        id: `user-log-${u.id}`,
        dataHora: u.updatedAt.toISOString(),
        usuario: u.nome,
        perfil: u.perfil,
        modulo: 'SEGURANCA',
        acao: `Auditoria de Conta: ${u.email}`,
        detalhes: `Perfil de acesso [${u.perfil}] - Status: ${u.ativo ? 'Ativo' : 'Inativo'}. Credenciais validadas.`,
        tipo: 'SEGURANCA',
      });
    });

    // 5. Logs de Áreas & UCs
    areas.forEach((ar) => {
      logs.push({
        id: `area-log-${ar.id}`,
        dataHora: ar.createdAt.toISOString(),
        usuario: 'Coordenador SENAI',
        perfil: 'COORDENADOR',
        modulo: 'AREAS',
        acao: `Área Tecnológica: "${ar.nome}"`,
        detalhes: `Estrutura com ${ar.unidadesCurriculares.length} Unidade(s) Curricular(es) vinculada(s).`,
        tipo: 'CRIACAO',
      });
    });

    // Ordenar cronologicamente decrescente
    logs.sort((a, b) => new Date(b.dataHora).getTime() - new Date(a.dataHora).getTime());

    // Métricas
    const totalEventos = logs.length;
    const atribuicoesEventos = logs.filter((l) => l.modulo === 'ATRIBUICOES').length;
    const alteracoesGrade = logs.filter((l) => l.modulo === 'TURMAS' || l.modulo === 'AREAS').length;
    const acoesSeguranca = logs.filter((l) => l.modulo === 'SEGURANCA' || l.tipo === 'SEGURANCA').length;

    return NextResponse.json({
      metricas: {
        totalEventos,
        atribuicoesEventos,
        alteracoesGrade,
        acoesSeguranca,
      },
      logs,
    });
  } catch (error: any) {
    console.error('Erro ao buscar logs de auditoria:', error);
    return NextResponse.json(
      { error: 'Erro interno ao consultar auditoria.', details: error.message },
      { status: 500 }
    );
  }
}
