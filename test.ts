import 'dotenv/config';
import { PrismaClient } from './src/generated/prisma/client';

import { PrismaNeonHttp } from '@prisma/adapter-neon';

console.log('URL from process.env:', process.env.DATABASE_URL);

const adapter = new PrismaNeonHttp(process.env.DATABASE_URL || '', {});
const prisma = new PrismaClient({ adapter });
prisma.usuario.count().then(console.log).catch(console.error);
