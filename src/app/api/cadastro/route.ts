import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

// Evita múltiplas instâncias do Prisma Client em desenvolvimento
const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export async function POST(req: Request) {
  try {
    const { nome, email, senha, perfil } = await req.json();

    if (!nome || !email || !senha || !perfil) {
      return NextResponse.json(
        { error: "Todos os campos são obrigatórios." },
        { status: 400 }
      );
    }

    // Verifica se o usuário já existe
    const userExists = await prisma.usuario.findUnique({
      where: { email },
    });

    if (userExists) {
      return NextResponse.json(
        { error: "Este e-mail já está em uso." },
        { status: 400 }
      );
    }

    // Criptografa a senha
    const hashedPassword = await bcrypt.hash(senha, 10);

    // Cria o usuário
    const newUser = await prisma.usuario.create({
      data: {
        nome,
        email,
        senha: hashedPassword,
        perfil,
      },
    });

    // Se o perfil for DOCENTE, cria a entidade Docente vinculada automaticamente
    if (perfil === "DOCENTE") {
      await prisma.docente.create({
        data: {
          usuarioId: newUser.id,
          cargaHorariaContratada: 0, // Padrão inicial
          tipoContratacao: "CLT", // Padrão inicial
        },
      });
    }

    return NextResponse.json(
      { message: "Usuário criado com sucesso!" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro no cadastro:", error);
    return NextResponse.json(
      { error: "Ocorreu um erro interno ao criar o usuário." },
      { status: 500 }
    );
  }
}
