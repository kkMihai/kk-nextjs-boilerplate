import { z } from 'zod';
import prisma from '@/lib/db/prisma.mjs';

/**
 * @name getUser
 * @description Retrieve a user by their email address, ID, or provider account ID
 * @param {string} query - Email, ID, or provider account ID of the user
 * @returns {Promise<Prisma.UserFieldRefs | null>} - User object or null if not found
 */
export async function getUser(query) {
  try {
    const parsed = z
      .union([z.string().email(), z.string().uuid(), z.string()])
      .parse(query);

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
    results.emailVerified = String(results.emailVerified);
    results.createdAt = String(results.createdAt);

    return results;
  } catch (error) {
    console.error('Error getting user by email:', error);
    throw new Error(
      error instanceof z.ZodError
        ? error.errors[0].message
        : 'Something went wrong'
    );
  }
}
