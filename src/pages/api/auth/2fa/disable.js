import prisma from "@/lib/db/prisma";
import * as OTPAuth from "otpauth";
import {disableTwoFactorSchema, z} from "@/schemas";
import bcryptjs from "bcryptjs";
import Notification from "@/lib/notification.mjs";
import ua from "ua-parser-js";
import {decrypt} from "@/lib/encryption/encrypt.mjs";
import Auth from "@Auth";

export default async function handler(req, res) {
  try {
    const { session } = await Auth({ req, res });

    if (!session) {
      return res.status(401).json({
        message: "Unauthorized",
        type: "error",
      });
    }

    if (req.method !== "POST")
      return res.status(405).json({ message: "Method not allowed" });

    const { token, password } = disableTwoFactorSchema.parse(req.body);
    const userId = session.user.id;
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user || !user.twoFactorSecret || !user.twoFactorEnabled) {
      return res.status(404).json({
        message: "User not found or 2FA not enabled",
        type: "error",
      });
    }

    const totp = new OTPAuth.TOTP({
      secret: OTPAuth.Secret.fromBase32(decrypt(user.twoFactorSecret)),
      algorithm: "SHA1",
      digits: 6,
      period: 30,
    });

    const isValid = totp.validate({ token, window: 1 }) !== null;

    if (!isValid) {
      return res.status(400).json({
        message: "The 2FA token provided is invalid",
        type: "error",
      });
    }

    const base64 = Buffer.from(password, "base64").toString("utf-8");

    const isPasswordValid = await bcryptjs.compare(base64, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({
        message: "The password provided does not match our records",
        type: "error",
      });
    }

    const { sendNotification } = new Notification();

    const userAgent = req.headers["user-agent"];
    const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

    const device = `${ua(userAgent).browser.name} on ${ua(userAgent).os.name} | ${ip}`;

    await sendNotification({
      notificationType: "twoFactor",
      userId: userId,
      device,
    });

    await prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorSecret: null,
        twoFactorEnabled: false,
      },
    });

    res.status(200).json({
      message: "Two-factor authentication has been disabled",
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
