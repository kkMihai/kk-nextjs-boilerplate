import { z } from 'zod';
import prisma from '@/lib/db/prisma.mjs';

const PasswordResetTokenQuerySchema = z.union([
  z.string().email(),
  z.string().cuid(),
  z.string().min(1, 'Token cannot be empty').max(255, 'Token is too long'),
]);

/**
 * @name getPasswordResetToken
 * @param {string} query - Token, ID, or email of the token
 * @returns {Promise<Prisma.PasswordResetTokenFieldRefs | null>}
 */
export async function getPasswordResetToken(query) {
  try {
    const parsed = PasswordResetTokenQuerySchema.parse(query);

    const result = await prisma.passwordResetToken.findFirst({
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
    console.error('Error getting password reset token:', error);
    if (error instanceof z.ZodError) {
      throw new Error(
        `Invalid input: ${error.errors.map((e) => e.message).join(', ')}`
      );
    }
    throw new Error(
      'An unexpected error occurred while retrieving the password reset token'
    );
  }
}
