import { z } from 'zod';
import prisma from '@/lib/db/prisma.mjs';

const UserQuerySchema = z.union([
  z.string().email(),
  z.string().cuid(),
  z
    .string()
    .regex(/^[0-9]+$/, 'Must be a numeric string for provider account ID'),
]);

/**
 * @name getUser
 * @description Retrieve a user by their email address, ID, or provider account ID
 * @param {string} query - Email, ID, or provider account ID of the user
 * @returns {Promise<Prisma.UserFieldRefs | null>} - User object or null if not found
 */
export async function getUser(query) {
  try {
    const parsed = UserQuerySchema.parse(query);

    const results = await prisma.user.findFirst({
      where: {
        OR: [
          { email: parsed },
          { id: parsed },
          {
            accounts: {
              some: {
                providerAccountId: parsed,
              },
            },
          },
        ],
      },
    });

    // Convert data types to string for JSON serialization
    if (results) {
      results.emailVerified = results.emailVerified?.toISOString() || null;
      results.createdAt = results.createdAt.toISOString();
    }

    return results;
  } catch (error) {
    console.error('Error getting user:', error);
    if (error instanceof z.ZodError) {
      throw new Error(
        `Invalid input: ${error.errors.map((e) => e.message).join(', ')}`
      );
    }
    throw new Error('An unexpected error occurred while retrieving the user');
  }
}
