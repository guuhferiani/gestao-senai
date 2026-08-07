import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

// GET /api/usuarios/[id] - Obter detalhes de um usuário
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const usuario = await prisma.usuario.findUnique({
      where: { id },
      select: {
        id: true,
        nome: true,
        email: true,
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
    const body = await request.json();
    const { nome, email, perfil, ativo, novaSenha } = body;

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
    if (perfil) dataToUpdate.perfil = perfil;
    if (ativo !== undefined) dataToUpdate.ativo = Boolean(ativo);

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

// DELETE /api/usuarios/[id] - Excluir usuário
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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
