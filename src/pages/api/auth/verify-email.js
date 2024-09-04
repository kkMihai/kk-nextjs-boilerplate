import {verifyEmailVerificationToken} from "@/lib/tokens";
import prisma from "@/lib/db/prisma";
import {getEmailVerificationTokenByToken} from "@/data/emailVerificationToken";
import {z} from "@/schemas";
import ua from "ua-parser-js";
import Notification from "@/lib/notification.mjs";

export default async function handler(req, res) {
  const { token, captchaToken } = req.body;

  if (req.method !== "POST")
    return res.status(405).json({ message: "Method not allowed" });

  if (!token) {
    return res.status(400).json({
      message: "No token provided",
      type: "error",
    });
  }

  if (!captchaToken) {
    return res.status(400).json({
      message: "No captcha token provided",
      type: "error",
    });
  }

  try {
    const verifyCaptchaResponse = await fetch(
      `${process.env.NEXTAUTH_URL}/api/verify-captcha`,
      {
        method: "POST",
        body: JSON.stringify({ token: captchaToken }),
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    const verifyCaptchaData = await verifyCaptchaResponse.json();

    if (verifyCaptchaData.type === "error") {
      return res.status(400).json({
        message: "Captcha verification failed",
        type: "error",
      });
    }

    const existingToken = await getEmailVerificationTokenByToken(token);

    if (!existingToken) {
      return res.status(400).json({
        message: "Token not found",
        type: "error",
      });
    }

    await verifyEmailVerificationToken(token);

    if (new Date(existingToken.expires) < new Date()) {
      return res.status(400).json({
        message: "Token expired",
        type: "error",
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: existingToken.userId,
      },
    });

    if (!user) {
      return res.status(400).json({
        message: "User not found",
        type: "error",
      });
    }

    const isEmailChange = user.email !== existingToken.email;

    if (isEmailChange) {
      const { sendNotification } = new Notification();

      const userAgent = req.headers["user-agent"] || "Unknown";
      const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

      const device = `${ua(userAgent).browser.name} on ${ua(userAgent).os.name} | ${ip}`;

      await sendNotification({
        notificationType: "emailChange",
        userId: existingToken.userId,
        device,
        newEmail: existingToken.email,
      });

      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          email: existingToken.email,
          emailVerified: new Date(),
        },
      });

      await prisma.userSession.deleteMany({
        where: {
          userId: existingToken.userId,
        },
      });
    } else {
      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          emailVerified: new Date(),
        },
      });
    }

    await prisma.emailVerificationToken.delete({
      where: {
        id: existingToken.id,
      },
    });

    return res.status(200).json({
      message: isEmailChange
        ? "Your email has been changed and verified"
        : "Your email has been verified",
      type: "success",
    });
  } catch (error) {
    return res.status(500).json({
      message:
        error instanceof z.ZodError
          ? error.errors[0].message
          : "Internal server error",
      type: "error",
    });
  }
}
