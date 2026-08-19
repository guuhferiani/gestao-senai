import { PrismaClient } from '../generated/prisma/client'
import { PrismaNeonHttp } from '@prisma/adapter-neon'

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL_UNPOOLED || ''
const adapter = new PrismaNeonHttp(connectionString, {})

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const createPrismaClient = () => new PrismaClient({ adapter })

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

// Força atualização em desenvolvimento para reconhecer alterações no schema
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = createPrismaClient()
}
// Atualizado com suporte ao campo nif no modelo Usuario



