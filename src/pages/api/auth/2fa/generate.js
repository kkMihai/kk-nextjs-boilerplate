import prisma from "@/lib/db/prisma";
import { generateTOTP } from "@/lib/2fa";
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

    if (session?.user?.twoFactorEnabled) {
      return res.status(400).json({
        message: "User already has OTP enabled",
        type: "error",
      });
    }

    const { encryptedSecret, otpAuthUrl } = generateTOTP(session?.user?.email);

    await prisma.user.update({
      where: { id: session?.user?.id },
      data: { twoFactorSecret: encryptedSecret },
    });

    res.status(200).json({
      otpAuthUrl,
      message: "OTP generated successfully",
      type: "success",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      type: "error",
    });
  }
}
