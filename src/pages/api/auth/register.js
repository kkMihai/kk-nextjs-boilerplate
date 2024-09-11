import bcryptjs from 'bcryptjs';
import moment from 'moment';
import prisma from '@/lib/db/prisma.mjs';
import { generateEmailVerificationToken } from '@/lib/auth/tokens.js';
import { sendVerificationEmail } from '@/lib/email.mjs';
import { SignUpSchema, z } from '@/schemas/auth.js';

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      res.status(405).json({ message: 'Method not allowed' });
    }

    const { username, password, email, captchaToken } = SignUpSchema.parse(
      req.body
    );

    const verifyCaptchaResponse = await fetch(
      `${process.env.BASE_URL}/api/verify-captcha`,
      {
        method: 'POST',
        body: JSON.stringify({ token: captchaToken }),
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const verifyCaptchaData = await verifyCaptchaResponse.json();

    if (verifyCaptchaData.type === 'error') {
      res.status(400).json({
        message: 'Captcha verification failed',
        type: 'error',
      });
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          {
            username,
          },
          {
            email,
          },
        ],
      },
    });

    if (user) {
      res.status(400).json({
        message: 'Username or email already exists',
        type: 'error',
      });
    }

    const base64DecodedPassword = Buffer.from(password, 'base64').toString();

    const newUser = await prisma.user.create({
      data: {
        username,
        password: await bcryptjs.hash(base64DecodedPassword, 14),
        email,
        createdAt: moment().format(),
      },
    });

    const verificationToken = await generateEmailVerificationToken(
      email,
      newUser.id
    );

    const isEmailSend = await sendVerificationEmail(
      email,
      verificationToken.token,
      username
    );

    if (!isEmailSend) {
      res.status(500).json({
        message: 'Failed to send verification email, contact support',
        type: 'error',
      });
    }

    res.status(200).json({
      message:
        'Your account has been registered! Check your email to confirm email address',
      type: 'success',
    });
  } catch (error) {
    res.status(500).json({
      message:
        error instanceof z.ZodError
          ? error.errors[0].message
          : 'Internal server error',
      type: 'error',
    });
  }
}
