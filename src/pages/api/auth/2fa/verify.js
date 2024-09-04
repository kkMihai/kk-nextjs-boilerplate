import prisma from "@/lib/db/prisma";
import { verifyTwoFactorSchema, z } from "@/schemas";
import { validateTOTP } from "@/lib/2fa";
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

    const { token } = verifyTwoFactorSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!existingUser || !existingUser.twoFactorSecret) {
      return res.status(400).json({
        message: "User not found or 2FA not set up",
        type: "error",
      });
    }

    const is2FAValid = validateTOTP(existingUser.twoFactorSecret, token);

    if (is2FAValid) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { twoFactorEnabled: true },
      });
    }

    res.status(is2FAValid ? 200 : 400).json({
      message: is2FAValid
        ? "Two-Factor Authentication has been enabled"
        : "The 2FA Code provided is invalid",
      type: is2FAValid ? "success" : "error",
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
