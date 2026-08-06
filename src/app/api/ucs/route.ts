import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const ucs = await prisma.unidadeCurricular.findMany({
      orderBy: { nome: 'asc' },
      include: {
        area: true,
        _count: {
          select: {
            docentesCompetentes: true,
            atribuicoes: true
          }
        }
      }
    });

    return NextResponse.json(ucs);
  } catch (error) {
    console.error("Erro ao buscar UCs:", error);
    return NextResponse.json(
      { error: "Erro ao buscar Unidades Curriculares." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
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

    // Verify area exists
    const areaExists = await prisma.areaTecnologica.findUnique({
      where: { id: areaId }
    });

    if (!areaExists) {
      return NextResponse.json(
        { error: "A Área Tecnológica selecionada não existe." },
        { status: 400 }
      );
    }

    const trimmedNome = nome.trim();

    // Check duplicate name within the same area
    const existingUc = await prisma.unidadeCurricular.findFirst({
      where: {
        areaId,
        nome: {
          equals: trimmedNome,
          mode: 'insensitive'
        }
      }
    });

    if (existingUc) {
      return NextResponse.json(
        { error: `Já existe uma UC "${trimmedNome}" cadastrada na área "${areaExists.nome}".` },
        { status: 400 }
      );
    }

    const newUc = await prisma.unidadeCurricular.create({
      data: {
        nome: trimmedNome,
        areaId,
      }
    });

    return NextResponse.json({
      ...newUc,
      area: areaExists,
      _count: { docentesCompetentes: 0, atribuicoes: 0 }
    }, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar Unidade Curricular:", error);
    return NextResponse.json(
      { error: "Erro interno ao criar Unidade Curricular." },
      { status: 500 }
    );
  }
}
