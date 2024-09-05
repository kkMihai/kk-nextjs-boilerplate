import prisma from '@/lib/db/prisma.mjs';

/**
 * @name getUserByEmail
 * @description Retrieve a user by their email address
 * @param {string} param - Email or ID of the user
 * @returns {Promise<Prisma.UserFieldRefs>} - User object
 */
export async function getUser(param) {
  if (!param) {
    throw new Error('You must provide an email or id.');
  }

  const result = await prisma.user.findFirst({
    where: {
      OR: [
        {
          email: param,
        },
        {
          id: param,
        },
      ],
    },
  });

  if (!result) {
    return null;
  }

  return result;
}
