import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import GitHubProvider from 'next-auth/providers/github';
import bcryptjs from 'bcryptjs';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { z } from 'zod';
import geoip from 'geoip-lite';
import prisma from '@/lib/db/prisma.mjs';
import { validateTOTP } from '@/lib/auth/2fa.js';
import { getUser } from '@/data/user.js';
import { env } from '@/env.mjs';
import { SignInSchema } from '@/schemas/auth.js';

const { linkAccount } = PrismaAdapter(prisma);

const createOrUpdateSession = async (userId, requestInfo) => {
  const { ip, userAgent } = requestInfo;
  const GetGeoIP = geoip.lookup(ip);
  const location = GetGeoIP
    ? `${GetGeoIP.city}, ${GetGeoIP.region}, ${GetGeoIP.country}`
    : 'Unknown';

  const existingSession = await prisma.session.findFirst({
    where: { userId, ip, userAgent },
  });

  if (existingSession) {
    return prisma.session.update({
      where: { id: existingSession.id },
      data: { lastActive: new Date() },
    });
  }
  return prisma.session.create({
    data: { userId, ip, userAgent, location },
  });
};

export const authOptions = (req) => ({
  providers: [
    GitHubProvider({
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
    }),
    Credentials({
      async authorize(credentials) {
        const { email, password, twoFactorToken } =
          await SignInSchema.parseAsync(credentials).catch((error) => {
            throw new Error(
              error instanceof z.ZodError
                ? error.errors[0].message
                : 'Internal server error'
            );
          });

        const user = await getUser(email);

        if (!user) {
          throw new Error('User not found');
        }

        if (!user.password) {
          throw new Error(
            "You don't have a password set, use forgot password section to set one"
          );
        }

        const isPasswordValid = await bcryptjs.compare(
          atob(password),
          user.password
        );

        if (!isPasswordValid) {
          throw new Error('Your password is incorrect');
        }

        if (user.suspended) {
          throw new Error('This account has been suspended');
        }

        if (!user.emailVerified) {
          throw new Error('email_unverified');
        }

        if (user.twoFactorEnabled && !twoFactorToken) {
          throw new Error('2fa_required');
        }

        if (user.twoFactorEnabled && twoFactorToken) {
          const isValid = validateTOTP(user.twoFactorSecret, twoFactorToken);

          if (!isValid) {
            throw new Error('2fa_invalid');
          }
        }

        return {
          id: user.id,
          email: user.email,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        const RequestUserInfo = {
          ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
          userAgent: req.headers['user-agent'],
        };

        if (account.provider !== 'credentials') {
          // Handle OAuth sign-in (e.g., GitHub)
          let existingUser = await getUser(user.email);

          const existingAccount = await prisma.account.findFirst({
            where: {
              provider: account.provider,
              providerAccountId: account.providerAccountId,
            },
          });

          if (existingAccount) {
            if (existingAccount.userId !== existingUser?.id) {
              console.error('Account is linked to a different user');
              return false;
            }
            await prisma.user.update({
              where: { id: existingUser.id },
              data: {
                username: profile.name,
                avatar: profile.image ?? null,
                emailVerified: new Date(),
              },
            });
          } else if (!existingUser) {
            existingUser = await prisma.user.create({
              data: {
                email: profile.email,
                username: profile.name,
                avatar: profile.image ?? null,
                emailVerified: new Date(),
              },
            });
            await linkAccount({
              provider: account.provider,
              providerAccountId: account.providerAccountId,
              userId: existingUser.id,
              type: account.type,
              access_token: account.access_token,
              refresh_token: account.refresh_token,
              expires_at: account.expires_at,
              token_type: account.token_type,
              scope: account.scope,
            });
          }

          await createOrUpdateSession(existingUser.id, RequestUserInfo);

          return true;
        }
        // Handle Credentials sign-in
        const existingUser = await getUser(user.email);

        if (
          !existingUser ||
          existingUser.suspended ||
          !existingUser.emailVerified
        ) {
          console.error('User validation failed');
          return false;
        }

        await createOrUpdateSession(existingUser.id, RequestUserInfo);
        return true;
      } catch (error) {
        console.error('Error in signIn callback:', error);
        return false;
      }
    },
    // eslint-disable-next-line no-unused-vars
    async jwt({ token, user, account }) {
      if (user) {
        return {
          ...token,
          id: user.id,
          ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
          userAgent: req.headers['user-agent'],
          provider: account?.provider,
        };
      }
      return token;
    },
    async session({ session, token }) {
      const user = await getUser(token.id);

      if (!user) {
        throw new Error('User not found');
      }

      const existingSession = await prisma.session.findFirst({
        where: {
          userId: user.id,
          ip: token.ip,
          userAgent: token.userAgent,
        },
      });

      if (!existingSession) {
        throw new Error('Session not found');
      }

      const isLastActiveMore =
        new Date(existingSession.lastActive) <
        new Date(new Date().getTime() - 3 * 60000);

      if (isLastActiveMore) {
        await prisma.session.update({
          where: { id: existingSession.id },
          data: { lastActive: new Date() },
        });
      }

      delete user.password;
      delete user.twoFactorSecret;

      return {
        ...session,
        user,
        ip: token.ip,
        userAgent: token.userAgent,
        provider: token.provider,
      };
    },
  },
  events: {
    async signOut({ token }) {
      try {
        const { ip, userAgent, id } = token;

        const existingSession = await prisma.session.findFirst({
          where: { userId: id, ip, userAgent },
        });

        if (existingSession) {
          await prisma.session.delete({
            where: { id: existingSession.id },
          });
        }
      } catch (error) {
        console.error('Error in signOut event:', error);
      }
    },
  },
  pages: {
    signIn: '/auth/signin',
    notAdmin: '/404',
  },
  secret: env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  debug: env.NODE_ENV === 'development',
});

export default async function auth(req, res) {
  // eslint-disable-next-line no-return-await
  return await NextAuth(req, res, authOptions(req, res));
}
