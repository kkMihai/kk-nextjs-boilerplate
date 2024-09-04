import prisma from "@/lib/db/prisma";
import { validateTwoFactorSchema, z } from "@/schemas";
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

    const { token } = validateTwoFactorSchema.parse(req.body);

    const userId = session.user.id;
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
      return res.status(404).json({
        message: user ? "User does not have 2FA enabled" : "User not found",
        type: "error",
      });
    }

    const isValid = validateTOTP(user.twoFactorSecret, token);

    res.status(isValid ? 200 : 400).json({
      message: isValid ? "OTP valid" : "Invalid OTP",
      type: isValid ? "success" : "error",
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
