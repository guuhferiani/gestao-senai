import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("E-mail e senha são obrigatórios");
        }

        const normalizedEmail = credentials.email.trim().toLowerCase();
        
        let usuario;
        try {
          usuario = await prisma.usuario.findUnique({
            where: { email: normalizedEmail }
          });
        } catch (dbError) {
          console.error("Erro de conexão ao buscar usuário no Prisma:", dbError);
          throw new Error("Erro de conexão com o banco de dados");
        }

        if (!usuario || !usuario.ativo) {
          console.log(`Tentativa de login falhou: Usuário não encontrado ou inativo (${normalizedEmail})`);
          throw new Error("Usuário não encontrado ou inativo");
        }

        const isValid = await bcrypt.compare(credentials.password, usuario.senha);

        if (!isValid) {
          console.log(`Tentativa de login falhou: Senha incorreta para (${normalizedEmail})`);
          throw new Error("Senha incorreta");
        }

        return {
          id: usuario.id,
          name: usuario.nome,
          email: usuario.email,
          perfil: usuario.perfil
        };
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 horas (duração segura de um turno de trabalho no SENAI)
    updateAge: 60 * 60, // Atualiza o token a cada 1 hora de atividade
  },
  jwt: {
    maxAge: 8 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.perfil = (user as any).perfil;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        (session.user as any).id = token.id;
        (session.user as any).perfil = token.perfil;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET || "gestao-senai-secret-key-development",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
