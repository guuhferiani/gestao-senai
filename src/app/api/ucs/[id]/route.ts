import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { nome, areaId } = await req.json();

    if (!nome || typeof nome !== "string" || !nome.trim()) {
      return NextResponse.json(
        { error: "O nome da Unidade Curricular é obrigatório." },
        { status: 400 }
      );
    }

    if (!areaId || typeof areaId !== "string") {
      return NextResponse.json(
        { error: "Uma Unidade Curricular deve pertencer obrigatoriamente a uma Área Tecnológica." },
        { status: 400 }
      );
    }

    const updatedUc = await prisma.unidadeCurricular.update({
      where: { id },
      data: {
        nome: nome.trim(),
        areaId,
      }
    });

    return NextResponse.json(updatedUc);
  } catch (error) {
    console.error("Erro ao atualizar Unidade Curricular:", error);
    return NextResponse.json(
      { error: "Erro interno ao atualizar Unidade Curricular." },
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

    await prisma.unidadeCurricular.delete({
      where: { id }
    });

    return NextResponse.json({ message: "Unidade Curricular excluída com sucesso." });
  } catch (error) {
    console.error("Erro ao excluir Unidade Curricular:", error);
    return NextResponse.json(
      { error: "Erro interno ao excluir Unidade Curricular." },
      { status: 500 }
    );
  }
}
