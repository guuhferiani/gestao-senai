import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET /api/docentes/me/agenda - Retornar agenda do docente logado na sessão
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Não autorizado. Faça login para acessar sua agenda.' },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;

    // Buscar o registro Docente correspondente ao usuário logado
    const docente = await prisma.docente.findFirst({
      where: { usuarioId: userId },
    });

    if (!docente) {
      // Caso seja um Coordenador ou OPP consultando, pegar o primeiro docente cadastrado como demonstrativo
      const fallbackDocente = await prisma.docente.findFirst({
        where: { usuario: { ativo: true } },
      });

      if (!fallbackDocente) {
        return NextResponse.json(
          { error: 'Nenhum perfil docente encontrado.' },
          { status: 404 }
        );
      }

      return NextResponse.redirect(
        new URL(`/api/docentes/${fallbackDocente.id}/agenda`, process.env.NEXTAUTH_URL || 'http://localhost:3000')
      );
    }

    return NextResponse.redirect(
      new URL(`/api/docentes/${docente.id}/agenda`, process.env.NEXTAUTH_URL || 'http://localhost:3000')
    );
  } catch (error: any) {
    console.error('Erro ao consultar agenda do docente logado:', error);
    return NextResponse.json(
      { error: 'Erro interno ao consultar agenda.', details: error.message },
      { status: 500 }
    );
  }
}
