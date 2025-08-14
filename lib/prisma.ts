import { PrismaClient } from '@prisma/client';

declare global {
  // PrismaClient is attached to the `global` object in development to prevent
  // exhausting your database connection limit.
  var prisma: PrismaClient | undefined;
}

const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export { prisma };
