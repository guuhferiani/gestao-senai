import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, email, nif, novaSenha } = body;

    if (!email || !email.trim()) {
      return NextResponse.json(
        { error: "O e-mail institucional é obrigatório." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedNif = nif ? String(nif).trim() : "";

    // 1. Etapa de Verificação de Identidade (E-mail + NIF)
    if (action === "verificar") {
      if (!normalizedNif) {
        return NextResponse.json(
          { error: "O NIF / Matrícula Funcional é obrigatório para autenticar a identidade." },
          { status: 400 }
        );
      }

      const usuario: any = await prisma.usuario.findUnique({
        where: { email: normalizedEmail },
      });

      if (!usuario) {
        return NextResponse.json(
          { error: "E-mail institucional ou NIF inválido. Verifique os dados digitados." },
          { status: 404 }
        );
      }

      // Validação estrita do NIF (case-insensitive e remoção de espaços)
      const userNif = (usuario.nif || "").trim().toLowerCase();
      const inputNif = normalizedNif.toLowerCase();

      if (!userNif || userNif !== inputNif) {
        return NextResponse.json(
          { error: "O NIF informado não corresponde ao cadastro deste e-mail institucional." },
          { status: 401 }
        );
      }

      if (!usuario.ativo) {
        return NextResponse.json(
          { error: "Esta conta está inativa no sistema. Entre em contato com a Coordenação ou Secretaria." },
          { status: 403 }
        );
      }

      return NextResponse.json({
        success: true,
        nome: usuario.nome,
        email: usuario.email,
        message: `Identidade confirmada com sucesso para ${usuario.nome}.`,
      });
    }

    // 2. Etapa de Redefinição de Senha
    if (action === "redefinir") {
      if (!normalizedNif) {
        return NextResponse.json(
          { error: "O NIF institucional é obrigatório para confirmar a alteração." },
          { status: 400 }
        );
      }

      if (!novaSenha || novaSenha.trim().length < 6) {
        return NextResponse.json(
          { error: "A nova senha deve possuir no mínimo 6 caracteres." },
          { status: 400 }
        );
      }

      const usuario = await prisma.usuario.findUnique({
        where: { email: normalizedEmail },
      });

      if (!usuario) {
        return NextResponse.json(
          { error: "Usuário não encontrado." },
          { status: 404 }
        );
      }

      const userNif = (usuario.nif || "").trim().toLowerCase();
      const inputNif = normalizedNif.toLowerCase();

      if (!userNif || userNif !== inputNif) {
        return NextResponse.json(
          { error: "Não autorizado: NIF inválido para esta conta." },
          { status: 401 }
        );
      }

      if (!usuario.ativo) {
        return NextResponse.json(
          { error: "Conta inativa. Não é possível alterar a senha." },
          { status: 403 }
        );
      }

      const hashedPassword = await bcrypt.hash(novaSenha.trim(), 10);

      await prisma.usuario.update({
        where: { email: normalizedEmail },
        data: { senha: hashedPassword },
      });

      return NextResponse.json({
        success: true,
        message: `Senha do usuário "${usuario.nome}" redefinida com sucesso! Você já pode realizar o login.`,
      });
    }

    return NextResponse.json(
      { error: "Ação de recuperação inválida." },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Erro na recuperação de senha:", error);
    return NextResponse.json(
      { error: "Erro interno ao processar a recuperação de senha.", details: error.message },
      { status: 500 }
    );
  }
}
