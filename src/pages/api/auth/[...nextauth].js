import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import GitHubProvider from 'next-auth/providers/github';
import bcryptjs from 'bcryptjs';
import { PrismaAdapter } from '@auth/prisma-adapter';
import prisma from '@/lib/db/prisma.mjs';
import { validateTOTP } from '@/lib/auth/2fa.js';
import { getUser } from '@/data/user.js';
import { env } from '@/env.mjs';
import { SignInSchema } from '@/schemas/auth.js';

const { linkAccount } = PrismaAdapter(prisma);

export const authOptions = {
  providers: [
    GitHubProvider({
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
    }),
    Credentials({
      async authorize(credentials, req) {
        const { email, password, twoFactorToken } =
          SignInSchema.parse(credentials);

        const user = await getUser(email);

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

        return Promise.resolve({
          id: user.id,
          ip: req.headers['x-forwarded-for'] || 'Unknown',
          userAgent: req.headers['user-agent'] || 'Unknown',
        });
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        if (account.provider === 'credentials') {
          const existingUser = await getUser(user.id);
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

      delete user.password;
      delete user.twoFactorSecret;

      return {
        ...session,
        user,
      };
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
