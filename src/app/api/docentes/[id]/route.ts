import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/docentes/[id] - Obter detalhes de um docente
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    const docente = await prisma.docente.findUnique({
      where: { id },
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
            perfil: true,
            ativo: true,
            createdAt: true,
          },
        },
        areas: {
          include: {
            area: true,
          },
        },
        competencias: {
          include: {
            uc: {
              include: {
                area: true,
              },
            },
          },
        },
        atribuicoes: {
          include: {
            turma: true,
            uc: true,
          },
        },
      },
    });

    if (!docente) {
      return NextResponse.json({ error: 'Docente não encontrado.' }, { status: 404 });
    }

    return NextResponse.json(docente);
  } catch (error: any) {
    console.error('Erro ao obter docente:', error);
    return NextResponse.json(
      { error: 'Erro interno ao buscar o docente.', details: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/docentes/[id] - Atualizar dados do docente, usuário, áreas e competências
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    const {
      nome,
      email,
      senha,
      ativo,
      cargaHorariaContratada,
      tipoContratacao,
      observacoes,
      dispManha,
      dispTarde,
      dispNoite,
      dispIntegral,
      dispHorarios,
      areasIds,
      competenciasIds,
    } = body;

    // 1. Verificar se docente existe
    const docenteExistente = await prisma.docente.findUnique({
      where: { id },
      include: { usuario: true },
    });

    if (!docenteExistente) {
      return NextResponse.json({ error: 'Docente não encontrado.' }, { status: 404 });
    }

    // 2. Se email foi alterado, verificar duplicidade
    if (email && docenteExistente.usuario && email.toLowerCase() !== docenteExistente.usuario.email.toLowerCase()) {
      const emailDuplicado = await prisma.usuario.findUnique({
        where: { email: email.toLowerCase().trim() },
      });
      if (emailDuplicado) {
        return NextResponse.json(
          { error: 'Já existe outro usuário cadastrado com este e-mail.' },
          { status: 400 }
        );
      }
    }

    // 3. Executar atualização sequencial
    if (docenteExistente.usuarioId) {
      const updateUserData: any = {};
      if (nome) updateUserData.nome = nome.trim();
      if (email) updateUserData.email = email.toLowerCase().trim();
      if (typeof ativo === 'boolean') updateUserData.ativo = ativo;
      if (senha && senha.trim()) {
        updateUserData.senha = await bcrypt.hash(senha.trim(), 10);
      }

      await prisma.usuario.update({
        where: { id: docenteExistente.usuarioId },
        data: updateUserData,
      });
    }

    // Atualiza dados do docente
    const updateDocenteData: any = {};
    if (cargaHorariaContratada !== undefined) {
      updateDocenteData.cargaHorariaContratada = Number(cargaHorariaContratada);
    }
    if (tipoContratacao !== undefined) {
      updateDocenteData.tipoContratacao = tipoContratacao;
    }
    if (observacoes !== undefined) {
      updateDocenteData.observacoes = observacoes ? observacoes.trim() : null;
    }

    if (dispHorarios !== undefined) {
      const horariosArray: string[] = Array.isArray(dispHorarios)
        ? dispHorarios
        : typeof dispHorarios === 'string' && dispHorarios.startsWith('[')
        ? JSON.parse(dispHorarios)
        : [];

      if (horariosArray.length > 0) {
        updateDocenteData.dispManha = horariosArray.some((h) => h.startsWith('M'));
        updateDocenteData.dispTarde = horariosArray.some((h) => h.startsWith('T'));
        updateDocenteData.dispNoite = horariosArray.some((h) => h.startsWith('N'));
        updateDocenteData.dispIntegral = updateDocenteData.dispManha && updateDocenteData.dispTarde && updateDocenteData.dispNoite;
        updateDocenteData.dispHorarios = JSON.stringify(horariosArray);
      } else {
        updateDocenteData.dispHorarios = typeof dispHorarios === 'string' ? dispHorarios : null;
        if (dispManha !== undefined) updateDocenteData.dispManha = Boolean(dispManha);
        if (dispTarde !== undefined) updateDocenteData.dispTarde = Boolean(dispTarde);
        if (dispNoite !== undefined) updateDocenteData.dispNoite = Boolean(dispNoite);
        if (dispIntegral !== undefined) updateDocenteData.dispIntegral = Boolean(dispIntegral);
      }
    } else {
      if (dispManha !== undefined) updateDocenteData.dispManha = Boolean(dispManha);
      if (dispTarde !== undefined) updateDocenteData.dispTarde = Boolean(dispTarde);
      if (dispNoite !== undefined) updateDocenteData.dispNoite = Boolean(dispNoite);
      if (dispIntegral !== undefined) updateDocenteData.dispIntegral = Boolean(dispIntegral);
    }

    await prisma.docente.update({
      where: { id },
      data: updateDocenteData,
    });

    // Se informou nova lista de áreas, sincroniza DocenteArea sequencialmente
    if (Array.isArray(areasIds)) {
      const uniqueAreasIds: string[] = Array.from(new Set(areasIds.filter(Boolean) as string[]));
      await prisma.docenteArea.deleteMany({ where: { docenteId: id } });
      for (const areaId of uniqueAreasIds) {
        await prisma.docenteArea.create({
          data: {
            docenteId: id,
            areaId,
          },
        });
      }
    }

    // Se informou nova lista de competências, sincroniza DocenteUC sequencialmente
    if (Array.isArray(competenciasIds)) {
      const uniqueCompetenciasIds: string[] = Array.from(new Set(competenciasIds.filter(Boolean) as string[]));
      await prisma.docenteUC.deleteMany({ where: { docenteId: id } });
      for (const ucId of uniqueCompetenciasIds) {
        await prisma.docenteUC.create({
          data: {
            docenteId: id,
            ucId,
          },
        });
      }
    }

    const docenteAtualizado = await prisma.docente.findUnique({
      where: { id },
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
            perfil: true,
            ativo: true,
          },
        },
        areas: {
          include: {
            area: true,
          },
        },
        competencias: {
          include: {
            uc: true,
          },
        },
      },
    });

    return NextResponse.json(docenteAtualizado);
  } catch (error: any) {
    console.error('Erro ao atualizar docente:', error);
    return NextResponse.json(
      { error: 'Erro interno ao atualizar o docente.', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/docentes/[id] - Excluir docente ou inativar caso tenha vínculos
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    const docente = await prisma.docente.findUnique({
      where: { id },
      include: {
        atribuicoes: true,
        usuario: true,
      },
    });

    if (!docente) {
      return NextResponse.json({ error: 'Docente não encontrado.' }, { status: 404 });
    }

    // Se o docente possui aulas/atribuições vinculadas em turmas
    if (docente.atribuicoes.length > 0) {
      return NextResponse.json(
        {
          error: `Este docente possui ${docente.atribuicoes.length} aula(s)/atribuição(ões) vinculada(s) a turmas. Não é permitido excluir diretamente. Desvincule as aulas ou inative o cadastro.`,
        },
        { status: 400 }
      );
    }

    // Exclusão completa em cascata sequencial
    await prisma.docenteArea.deleteMany({ where: { docenteId: id } });
    await prisma.docenteUC.deleteMany({ where: { docenteId: id } });
    await prisma.docente.delete({ where: { id } });

    if (docente.usuarioId) {
      await prisma.usuario.delete({ where: { id: docente.usuarioId } });
    }

    return NextResponse.json({ message: 'Docente excluído com sucesso.' });
  } catch (error: any) {
    console.error('Erro ao excluir docente:', error);
    return NextResponse.json(
      { error: 'Erro interno ao excluir o docente.', details: error.message },
      { status: 500 }
    );
  }
}
