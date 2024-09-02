import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  /*
  * Serverside Environment variables, not available on the client.
  * Will throw if you access these variables on the client.
  */
  server: {
    NEXT_PUBLIC_APP_NAME: z.string(),
    NEXT_PUBLIC_APP_URL: z.string().url(),
    DATABASE_URL: z.string().url(),
    NEXTAUTH_SECRET: z.string(),
    NEXTAUTH_URL: z.string().url(),
    ENCRYPTION_ALGORITHM: z.enum(['aes-256-cbc', 'aes-192-cbc', 'aes-128-cbc']),
    ENCRYPTION_SECRET_KEY: z.string(),
    ENCRYPTION_SALT: z.string(),
    ENCRYPTION_HMAC_KEY: z.string(),
    JWT_ALGORITHM: z.enum(['RS256', 'RS384', 'RS512', 'HS256', 'HS384', 'HS512']).default('RS512'),
    NODE_ENV: z.enum(['development', 'production', 'test']),
  },
  /*
   * Environment variables available on the client (and server).
   *
   * 💡 You'll get type errors if these are not prefixed with NEXT_PUBLIC_.
   */
  client: {
    NEXT_PUBLIC_APP_NAME: z.string(),
    NEXT_PUBLIC_APP_URL: z.string().url(),
  },
  /*
   * Due to how Next.js bundles environment variables on Edge and Client,
   * we need to manually destructure them to make sure all are included in bundle.
   *
   * 💡 You'll get type errors if not all variables from `server` & `client` are included here.
   */
  runtimeEnv: {
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    DATABASE_URL: process.env.DATABASE_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXAUTH_URL,
    ENCRYPTION_ALGORITHM: process.env.ENCRYPTION_ALGORITHM,
    ENCRYPTION_SECRET_KEY: process.env.ENCRYPTION_SECRET_KEY,
    ENCRYPTION_SALT: process.env.ENCRYPTION_SALT,
    ENCRYPTION_HMAC_KEY: process.env.ENCRYPTION_HMAC_KEY,
    JWT_ALGORITHM: process.env.JWT_ALGORITHM,
    NODE_ENV: process.env.NODE_ENV,
  },
});

