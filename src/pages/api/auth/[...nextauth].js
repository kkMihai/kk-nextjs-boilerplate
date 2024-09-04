import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import GitHubProvider from 'next-auth/providers/github';
import { PrismaAdapter } from '@auth/prisma-adapter';
import bcryptjs from 'bcryptjs';
import geoip from 'geoip-lite';
import prisma from '@/lib/db/prisma.mjs';
import { validateTOTP } from '@/lib/auth/2fa.js';
import { getUser } from '@/data/user.js';
import { getEmailVerificationToken } from '@/data/emailVerificationToken.js';
import { env } from '@/env.mjs';

export const authOptions = {
  adapter: PrismaAdapter(prisma),
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
        if (!credentials?.email || !credentials?.password) {
          throw new Error(`credentials_missing`);
        }

        const user = await getUser(credentials.email);

        if (!user) {
          throw new Error('user_not_found');
        }

        const isPasswordValid = await bcryptjs.compare(
          atob(credentials.password),
          user.password
        );
        if (!isPasswordValid) {
          throw new Error('password_invalid');
        }

        if (user.suspended) {
          throw new Error('account_suspended');
        }

        if (!user.emailVerified) {
          throw new Error('email_unverified');
        }

        const existingToken = await getEmailVerificationToken(
          credentials.email
        );

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

        if (user.twoFactorEnabled && !credentials.twoFactorToken) {
          throw new Error('2fa_required');
        }

        if (user.twoFactorEnabled && credentials.twoFactorToken) {
          const isValid = validateTOTP(
            user.twoFactorSecret,
            credentials.twoFactorToken
          );

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
    async signIn({ user, account }) {
      if (account.provider !== 'credentials') return true;
      const existingUser = await getUser(user.id);
      return !!existingUser.emailVerified;
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
          ip: token.ip,
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
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  debug: env.NODE_ENV === 'development',
};

export default NextAuth(authOptions);
