import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export const dynamic = 'force-dynamic';

// GET /api/usuarios/[id] - Obter detalhes de um usuário
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    const userPerfil = (session?.user as any)?.perfil;
    const userId = (session?.user as any)?.id;

    if (!session || (userPerfil !== 'COORDENADOR' && userPerfil !== 'SECRETARIA' && userId !== id)) {
      return NextResponse.json(
        { error: 'Acesso não autorizado aos dados deste usuário.' },
        { status: 403 }
      );
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id },
      select: {
        id: true,
        nome: true,
        email: true,
        nif: true,
        perfil: true,
        ativo: true,
        createdAt: true,
        updatedAt: true,
        docente: {
          include: {
            areas: { include: { area: true } },
            competencias: { include: { uc: true } },
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

    return NextResponse.json(usuario);
  } catch (error: any) {
    console.error('Erro ao buscar usuário:', error);
    return NextResponse.json(
      { error: 'Erro interno ao consultar usuário.', details: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/usuarios/[id] - Atualizar dados, alternar status ou redefinir senha
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    const userPerfil = (session?.user as any)?.perfil;
    const userId = (session?.user as any)?.id;

    const isCoordOrSec = userPerfil === 'COORDENADOR' || userPerfil === 'SECRETARIA';
    const isSelf = userId === id;

    if (!session || (!isCoordOrSec && !isSelf)) {
      return NextResponse.json(
        { error: 'Acesso não autorizado para alterar dados deste usuário.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { nome, email, nif, perfil, ativo, novaSenha } = body;

    const usuarioExistente = await prisma.usuario.findUnique({
      where: { id },
    });

    if (!usuarioExistente) {
      return NextResponse.json(
        { error: 'Usuário não encontrado.' },
        { status: 404 }
      );
    }

    // Se alterou e-mail, verificar se outro usuário já usa
    if (email && email.trim().toLowerCase() !== usuarioExistente.email.toLowerCase()) {
      const emailEmUso = await prisma.usuario.findUnique({
        where: { email: email.trim().toLowerCase() },
      });

      if (emailEmUso && emailEmUso.id !== id) {
        return NextResponse.json(
          { error: `O e-mail "${email}" já está sendo utilizado por outro usuário.` },
          { status: 400 }
        );
      }
    }

    const dataToUpdate: any = {};
    if (nome) dataToUpdate.nome = nome.trim();
    if (email) dataToUpdate.email = email.trim().toLowerCase();
    if (nif !== undefined) dataToUpdate.nif = nif ? String(nif).trim() : null;

    // Apenas Gestores (Coordenação e Secretaria) podem alterar o perfil ou desativar uma conta
    if (perfil && isCoordOrSec) dataToUpdate.perfil = perfil;
    if (ativo !== undefined && isCoordOrSec) dataToUpdate.ativo = Boolean(ativo);

    if (novaSenha && novaSenha.trim()) {
      dataToUpdate.senha = await bcrypt.hash(novaSenha.trim(), 10);
    }

    const atualizado = await prisma.usuario.update({
      where: { id },
      data: dataToUpdate,
      select: {
        id: true,
        nome: true,
        email: true,
        nif: true,
        perfil: true,
        ativo: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(atualizado);
  } catch (error: any) {
    console.error('Erro ao atualizar usuário:', error);
    return NextResponse.json(
      { error: 'Erro interno ao atualizar usuário.', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/usuarios/[id] - Excluir usuário (Apenas Coordenação e Secretaria)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    const userPerfil = (session?.user as any)?.perfil;

    if (!session || (userPerfil !== 'COORDENADOR' && userPerfil !== 'SECRETARIA')) {
      return NextResponse.json(
        { error: 'Apenas Coordenadores e Secretaria podem excluir contas de usuários.' },
        { status: 403 }
      );
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id },
      include: {
        docente: {
          include: {
            atribuicoes: true,
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

    // Se possuir aulas atribuídas ativas, alertar o gestor
    if (usuario.docente && usuario.docente.atribuicoes.length > 0) {
      return NextResponse.json(
        {
          error: `Não é possível excluir este usuário pois ele possui ${usuario.docente.atribuicoes.length} aula(s) atribuída(s) na grade semanal. Desaloque as aulas primeiro ou inative o usuário.`,
        },
        { status: 400 }
      );
    }

    await prisma.usuario.delete({
      where: { id },
    });

    return NextResponse.json({
      message: `Usuário "${usuario.nome}" excluído com sucesso.`,
    });
  } catch (error: any) {
    console.error('Erro ao excluir usuário:', error);
    return NextResponse.json(
      { error: 'Erro interno ao excluir usuário.', details: error.message },
      { status: 500 }
    );
  }
}
