import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { nome } = await req.json();

    if (!nome || typeof nome !== "string" || !nome.trim()) {
      return NextResponse.json(
        { error: "O nome da Área Tecnológica é obrigatório." },
        { status: 400 }
      );
    }

    const updatedArea = await prisma.areaTecnologica.update({
      where: { id },
      data: { nome: nome.trim() },
      include: {
        unidadesCurriculares: true,
        _count: {
          select: {
            unidadesCurriculares: true,
            docentes: true,
          }
        }
      }
    });

    return NextResponse.json(updatedArea);
  } catch (error) {
    console.error("Erro ao atualizar área tecnológica:", error);
    return NextResponse.json(
      { error: "Erro interno ao atualizar Área Tecnológica." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Business Rule Check: Cannot delete an Area with linked UCs
    const ucsCount = await prisma.unidadeCurricular.count({
      where: { areaId: id }
    });

    if (ucsCount > 0) {
      return NextResponse.json(
        { error: `Não é permitida a exclusão de uma Área que possua UCs vinculadas. (Contém ${ucsCount} UC(s))` },
        { status: 400 }
      );
    }

    await prisma.areaTecnologica.delete({
      where: { id }
    });

    return NextResponse.json({ message: "Área Tecnológica excluída com sucesso." });
  } catch (error) {
    console.error("Erro ao excluir área tecnológica:", error);
    return NextResponse.json(
      { error: "Erro interno ao excluir Área Tecnológica." },
      { status: 500 }
    );
  }
}
