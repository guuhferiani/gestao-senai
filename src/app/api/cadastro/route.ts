import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { nome, email, nif, senha, perfil } = await req.json();

    if (!nome || !email || !senha || !perfil) {
      return NextResponse.json(
        { error: "Todos os campos são obrigatórios." },
        { status: 400 }
      );
    }

    // Validação estrita do domínio institucional SENAI SP
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail.endsWith("@sp.senai.br")) {
      return NextResponse.json(
        { error: "Apenas e-mails institucionais do SENAI (@sp.senai.br) são permitidos para cadastro." },
        { status: 400 }
      );
    }

    // Verifica se o usuário já existe
    const userExists = await prisma.usuario.findUnique({
      where: { email: normalizedEmail },
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
        email: normalizedEmail,
        nif: nif ? String(nif).trim() : null,
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
