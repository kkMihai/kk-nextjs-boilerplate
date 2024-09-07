import bcryptjs from 'bcryptjs';
import ua from 'ua-parser-js';
import { getPasswordResetTokenByToken } from '@/data/passwordResetToken';
import { getUserByEmail } from '@/data/user';
import { NewPasswordSchema, z } from '@/schemas';
import prisma from '@/lib/db/prisma';
import Notification from '@/lib/notification.mjs';

export default async function handler(req, res) {
  const { token } = req.body;
  const { password } = NewPasswordSchema.parse(req.body);

  if (req.method !== 'POST') {
    return res.status(405).json({
      message: 'Method not allowed',
      type: 'error',
    });
  }

  try {
    const existingToken = await getPasswordResetTokenByToken(token);

    if (!existingToken) {
      return res.status(400).json({
        message: 'Token not found',
        type: 'error',
      });
    }

    const hasExpired = new Date(existingToken.expires) < new Date();

    if (hasExpired) {
      return res.status(400).json({
        message: 'Token has expired',
        type: 'error',
      });
    }

    const existingUser = await getUserByEmail(existingToken.email);

    if (!existingUser) {
      return res.status(400).json({
        message: 'Email does not exist',
        type: 'error',
      });
    }

    const hashedPassword = await bcryptjs.hash(atob(password), 10);

    const updatedUser = await prisma.user.update({
      where: {
        id: existingUser.id,
      },
      data: {
        password: hashedPassword,
      },
    });

    if (!updatedUser) {
      return res.status(400).json({
        message: 'Failed to reset password',
        type: 'error',
      });
    }

    await prisma.passwordResetToken.delete({
      where: {
        id: existingToken.id,
      },
    });

    await prisma.session.deleteMany({
      where: {
        userId: existingUser.id,
      },
    });

    const userAgent = req.headers['user-agent'] || 'Unknown';
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    const device = `${ua(userAgent).browser.name} on ${ua(userAgent).os.name} | ${ip}`;

    const { sendNotification } = new Notification();
    await sendNotification({
      notificationType: 'passwordChange',
      userId: updatedUser.id,
      device,
    });

    return res.status(200).json({
      message: 'Your password has been updated',
      type: 'success',
    });
  } catch (error) {
    console.error('[API /auth/new-password] Error:', error);
    return res.status(500).json({
      message:
        error instanceof z.ZodError
          ? error.errors[0].message
          : 'Internal server error',
      type: 'error',
    });
  }
}
