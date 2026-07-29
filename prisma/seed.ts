import { PrismaClient, Perfil } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const adminEmail = 'coordenador@sp.senai.br'
  const adminSenha = await bcrypt.hash('Senai@123', 10)

  const admin = await prisma.usuario.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      nome: 'Coordenador Geral',
      email: adminEmail,
      senha: adminSenha,
      perfil: Perfil.COORDENADOR,
    },
  })

  console.log('Seed concluído com sucesso!')
  console.log({ admin })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
