import { PrismaClient } from '@prisma/client';

/**
 * @name prisma
 * @description Prisma client instance
 * @type {PrismaClient}
 * @returns {Promise<PrismaClient>}
 */

// eslint-disable-next-line import/no-mutable-exports
let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }

  prisma = global.prisma;
}

export default prisma;
