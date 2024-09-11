import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import prisma from '@/lib/db/prisma.mjs';
import { getEmailVerificationToken } from '@/data/emailVerificationToken.js';
import { getPasswordResetToken } from '@/data/passwordResetToken.js';

const expires = new Date(new Date().getTime() + 1000 + 3600 * 1000); // 1 hour
const token = uuidv4();

/**
 * @name generatePasswordResetToken
 * @param {string} email - Email address of the user
 * @returns {Promise<Prisma.PasswordResetTokenFieldRefs | null>}
 * @throws {Error} If email is not provided or invalid
 */
export const generatePasswordResetToken = async (email) => {
  const parsedEmail = z.string().email().parse(email);

  const existingToken = await getPasswordResetToken(parsedEmail);

  if (existingToken) {
    await prisma.passwordResetToken.delete({
      where: {
        id: existingToken.id,
      },
    });
  }

  return prisma.passwordResetToken.create({
    data: {
      token,
      email,
      expires,
    },
  });
};

/**
 * @name generateEmailVerificationToken
 * @param {string} email - Email address of the user
 * @param {string} userId - ID of the user
 * @returns {Promise<Prisma.EmailVerificationTokenFieldRefs | null>}
 * @throws {Error} If email or userId is not provided or invalid
 */
export const generateEmailVerificationToken = async (email, userId) => {
  try {
    const parsedEmail = z.string().email().parse(email);

    const existingToken = await getEmailVerificationToken(parsedEmail);

    if (existingToken) {
      await prisma.emailVerificationToken.delete({
        where: {
          id: existingToken.id,
        },
      });
    }

    return prisma.emailVerificationToken.create({
      data: {
        token,
        email,
        userId,
        expires,
      },
    });
  } catch (error) {
    console.error('Error generating email verification token:', error);
    throw new Error(
      error instanceof z.ZodError
        ? error.errors[0].message
        : 'Something went wrong'
    );
  }
};

/**
 * @name verifyEmailVerificationToken
 * @param {string} token - Token to verify
 * @returns {Promise<Prisma.EmailVerificationToken | Error>}
 * @throws {Error} If token is not provided or invalid
 */
// eslint-disable-next-line no-shadow
export const verifyEmailVerificationToken = async (token) => {
  try {
    const parsedToken = z.string().uuid().parse(token);
    const verificationToken = await prisma.emailVerificationToken.findFirst({
      where: {
        token: parsedToken,
      },
    });

    if (!verificationToken) {
      return new Error('Token not found');
    }

    if (new Date(verificationToken.expires) < new Date()) {
      return new Error('Token expired');
    }

    return verificationToken;
  } catch (error) {
    console.error('Error verifying email verification token:', error);
    throw new Error(
      error instanceof z.ZodError
        ? error.errors[0].message
        : 'Something went wrong'
    );
  }
};
