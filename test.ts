import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

console.log('URL from process.env:', process.env.DATABASE_URL);

const prisma = new PrismaClient();
prisma.usuario.count().then(console.log).catch(console.error);
