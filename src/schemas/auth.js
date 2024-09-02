import * as z from 'zod';

export { z };

export const SignInSchema = z.object({
  email: z
    .string({
      required_error: 'Email is required',
    })
    .email({
      message: 'Email is not valid',
    }),
  password: z
    .string({
      required_error: 'Password is required',
    })
    .min(8, {
      message: 'Password is required',
    }),
  twoFactorToken: z.string().optional(),
});

export const SignUpSchema = z.object({
  username: z
    .string({
      required_error: 'Username is required',
    })
    .min(3, {
      message: 'Username must be at least 3 characters',
    })
    .max(16, {
      message: 'Username must be at most 16 characters',
    })
    .regex(/^[a-zA-Z0-9]+$/, {
      message: 'Username can only contain letters and numbers',
    }),
  email: z
    .string({
      required_error: 'Email is required',
    })
    .email({
      message: 'Email is not valid',
    }),
  password: z
    .string({
      required_error: 'Password is required',
    })
    .min(8, {
      message: 'Password must be at least 8 characters',
    })
    .max(32, {
      message: 'Password must be at most 32 characters',
    }),
});
