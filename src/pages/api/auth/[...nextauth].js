import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import GitHubProvider from 'next-auth/providers/github';
import bcryptjs from 'bcryptjs';
import geoip from 'geoip-lite';
import { PrismaAdapter } from '@auth/prisma-adapter';
import prisma from '@/lib/db/prisma.mjs';
import { validateTOTP } from '@/lib/auth/2fa.js';
import { getUser } from '@/data/user.js';
import { getEmailVerificationToken } from '@/data/emailVerificationToken.js';
import { env } from '@/env.mjs';
import { SignInSchema, z } from '@/schemas/auth.js';

const { linkAccount } = PrismaAdapter(prisma);

export const authOptions = {
  providers: [
    GitHubProvider({
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
    }),
    Credentials({
      /**
       * Authorizes a user based on their credentials.
       *
       * @param {SignInSchema} credentials - The credentials used for sign-in.
       * @param {Object} req - The HTTP request object.
       * @returns {Promise<import('@/schemas/auth.js').SignInSchema>} - The user's credentials.
       */
      async authorize(credentials, req) {
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

        const existingToken = await getEmailVerificationToken(email);

        if (
          existingToken &&
          new Date(existingToken.expires) > new Date() &&
          !user.emailVerified
        ) {
          const timeLeft = Math.abs(
            new Date(existingToken.expires) - new Date()
          );
          const timeLeftInMinutes = Math.floor(timeLeft / 60000);
          const timeLeftInSeconds = Math.floor((timeLeft % 60000) / 1000);
          throw new Error(
            `email_verification_required:${timeLeftInMinutes}:${timeLeftInSeconds}`
          );
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
          ip: req.headers['x-forwarded-for'] || 'Unknown',
          userAgent: req.headers['user-agent'] || 'Unknown',
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        if (account.provider === 'credentials') {
          const existingUser = await getUser(user.email);
          return !!existingUser?.emailVerified;
        }

        const existingAccount = await prisma.account.findFirst({
          where: {
            provider: account.provider,
            providerAccountId: account.providerAccountId,
          },
        });

        if (existingAccount) {
          const existingUser = await getUser(existingAccount.userId);
          return !!existingUser?.emailVerified;
        }

        const existingUser = await getUser(user.email);

        if (existingUser) {
          await linkAccount({
            username: profile.name,
            provider: account.provider,
            providerAccountId: account.providerAccountId,
            access_token: account.access_token,
            refresh_token: account.refresh_token,
            userId: existingUser.id,
            type: 'oauth',
          });
          return !!existingUser.emailVerified;
        }

        const newUser = await prisma.user.create({
          data: {
            email: profile.email,
            username: profile.name,
            avatar: profile.image ?? null,
            emailVerified: new Date(),
          },
        });

        await linkAccount({
          username: profile.name,
          provider: account.provider,
          providerAccountId: account.providerAccountId,
          access_token: account.access_token,
          refresh_token: account.refresh_token,
          userId: newUser.id,
          type: 'oauth',
        });

        return true;
      } catch (error) {
        console.error('Error signing in:', error);
        throw new Error('An error occurred while signing in');
      }
    },
    async jwt({ token, user }) {
      if (user) {
        return {
          ...token,
          id: user.id,
          ip: user.ip,
          userAgent: user.userAgent,
          isSessionValid: true,
        };
      }
      return token;
    },
    async session({ session, token }) {
      const user = await getUser(token.id);
      if (!user.emailVerified) {
        throw new Error('Email not verified');
      }

      if (user.suspended) {
        throw new Error('This account has been suspended');
      }

      const existingSession = await prisma.userSession.findFirst({
        where: {
          userId: token.id,
          ip: token.ip || 'Unknown',
          userAgent: token.userAgent,
        },
      });

      if (!existingSession) {
        return null;
      }

      const isLastActiveMore =
        new Date(existingSession.lastActive) <
        new Date(new Date().getTime() - 3 * 60000);

      if (existingSession && token.isSessionValid && isLastActiveMore) {
        await prisma.userSession.update({
          where: {
            id: existingSession.id,
          },
          data: {
            lastActive: new Date(),
          },
        });
      }

      delete user.password;
      delete user.twoFactorSecret;

      return {
        ...session,
        user,
      };
    },
  },
  events: {
    async signIn({ user }) {
      const { ip, userAgent, id } = user;

      const existingSession = await prisma.userSession.findFirst({
        where: {
          userId: id,
          ip,
          userAgent,
        },
      });

      if (!existingSession) {
        const GetGeoIP = geoip.lookup(ip);
        let location;
        if (GetGeoIP === null) {
          location = 'Unknown';
        } else {
          location = `${GetGeoIP.city}, ${GetGeoIP.region}, ${GetGeoIP.country}`;
        }

        await prisma.userSession.create({
          data: {
            userId: id,
            ip,
            userAgent,
            location,
          },
        });
      }
    },
    async signOut({ token }) {
      const { ip, userAgent, id } = token;

      const existingSession = await prisma.userSession.findFirst({
        where: {
          userId: id,
          ip,
          userAgent,
        },
      });

      if (existingSession) {
        await prisma.userSession.delete({
          where: {
            id: existingSession.id,
          },
        });
      }
    },
  },
  pages: {
    signIn: '/auth/signin',
    notAdmin: '/404',
  },
  secret: env.NEXTAUTH_SECRET,
  url: env.NEXTAUTH_URL,
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  debug: env.NODE_ENV === 'development',
};

export default NextAuth(authOptions);
