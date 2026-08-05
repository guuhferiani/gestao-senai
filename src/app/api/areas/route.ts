import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const areas = await prisma.areaTecnologica.findMany({
      orderBy: { nome: 'asc' },
      include: {
        unidadesCurriculares: {
          orderBy: { nome: 'asc' }
        },
        _count: {
          select: {
            unidadesCurriculares: true,
            docentes: true,
          }
        }
      }
    });

    return NextResponse.json(areas);
  } catch (error) {
    console.error("Erro ao buscar áreas tecnológicas:", error);
    return NextResponse.json(
      { error: "Erro ao buscar áreas tecnológicas." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { nome } = await req.json();

    if (!nome || typeof nome !== "string" || !nome.trim()) {
      return NextResponse.json(
        { error: "O nome da Área Tecnológica é obrigatório." },
        { status: 400 }
      );
    }

    const trimmedNome = nome.trim();

    // Check duplicate name
    const existingArea = await prisma.areaTecnologica.findFirst({
      where: {
        nome: {
          equals: trimmedNome,
          mode: 'insensitive'
        }
      }
    });

    if (existingArea) {
      return NextResponse.json(
        { error: `Já existe uma Área Tecnológica cadastrada com o nome "${trimmedNome}".` },
        { status: 400 }
      );
    }

    const newArea = await prisma.areaTecnologica.create({
      data: {
        nome: trimmedNome,
      },
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

    return NextResponse.json(newArea, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar área tecnológica:", error);
    return NextResponse.json(
      { error: "Erro interno ao criar Área Tecnológica." },
      { status: 500 }
    );
  }
}
