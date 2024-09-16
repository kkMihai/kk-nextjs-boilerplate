import { z } from 'zod';
import prisma from '@/lib/db/prisma.mjs';

const EmailVerificationTokenQuerySchema = z.union([
  z.string().email(),
  z.string().cuid(),
  z.string().min(1, 'Token cannot be empty').max(255, 'Token is too long'),
]);

/**
 * @name getEmailVerificationToken
 * @param {string} query - Token, ID, or email of the token
 * @returns {Promise<Prisma.EmailVerificationTokenFieldRefs | null>}
 */
export async function getEmailVerificationToken(query) {
  try {
    const parsed = EmailVerificationTokenQuerySchema.parse(query);

    const result = await prisma.emailVerificationToken.findFirst({
      where: {
        OR: [{ token: parsed }, { id: parsed }, { email: parsed }],
      },
    });

    // Convert dates to ISO strings for consistent formatting
    if (result) {
      result.expires = result.expires.toISOString();
    }

    return result;
  } catch (error) {
    console.error('Error getting email verification token:', error);
    if (error instanceof z.ZodError) {
      throw new Error(
        `Invalid input: ${error.errors.map((e) => e.message).join(', ')}`
      );
    }
    throw new Error(
      'An unexpected error occurred while retrieving the email verification token'
    );
  }
}
