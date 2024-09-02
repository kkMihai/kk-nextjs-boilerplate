import prisma from '@/lib/db/prisma.mjs';

/**
 * @name getPasswordResetToken
 * @param {string} param - Token, ID, or email of the token
 * @returns {Promise<Prisma.PasswordResetTokenFieldRefs>}
 */
export async function getPasswordResetToken(param) {
  if (!param) {
    throw new Error('You must provide a token, id, or email.');
  }

  const result = await prisma.passwordResetToken.findUnique({
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
