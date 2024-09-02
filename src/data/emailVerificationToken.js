import prisma from '@/lib/db/prisma.mjs';

/**
 * @name getEmailVerificationToken
 * @param {string} param - Token, ID, or email of the token
 * @returns {Promise<Prisma.EmailVerificationTokenFieldRefs>}
 */
export async function getEmailVerificationToken(param) {
  if (!param) {
    throw new Error('You must provide a token, id, or email.');
  }

  const result = await prisma.emailVerificationToken.findUnique({
    where: {
      OR: [
        {
          token: param,
        },
        {
          id: param,
        },
        {
          email: param,
        },
      ],
    },
  });

  if (!result) {
    return null;
  }

  return result;
}
