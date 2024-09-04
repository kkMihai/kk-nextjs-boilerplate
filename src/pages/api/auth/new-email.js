import {changeEmailSchema, z} from "@/schemas";
import {generateEmailVerificationToken} from "@/lib/tokens";
import {sendNewEmailVerificationEmail} from "@/lib/email.mjs";
import {compare} from "bcryptjs";
import prisma from "@/lib/db/prisma";
import {validateTOTP} from "@/lib/2fa";
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

    const { newEmail, password, twoFactorCode } = changeEmailSchema.parse(
      req.body,
    );
    if (session?.user?.email === newEmail) {
      return res.status(400).json({
        message: "You are already using this email",
        type: "error",
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: session?.user?.id },
      select: {
        id: true,
        email: true,
        password: true,
        twoFactorSecret: true,
      },
    });

    const isPasswordValid = await compare(password, existingUser.password);

    if (!isPasswordValid) {
      return res.status(400).json({
        message: "Password does not match our records",
        type: "error",
      });
    }

    const has2FA = !!existingUser.twoFactorSecret;


      const isValidOTP = validateTOTP(
        existingUser.twoFactorSecret,
        twoFactorCode,
      );

      if (has2FA && !isValidOTP) {
        return res.status(400).json({
          message: "Two-Factor Authentication Code is invalid",
          type: "error",
        });
      }


    const generateToken = await generateEmailVerificationToken(
      newEmail,
      existingUser.id,
    );

    if (!generateToken) {
      return res.status(400).json({
        message: "Failed to generate email verification token",
        type: "error",
      });
    }

    await sendNewEmailVerificationEmail(
      newEmail,
      generateToken.token,
      session?.user?.username,
    );

    return res.status(200).json({
      message:
        "An email has been sent to your new email address for verification",
      type: "success",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message:
        error instanceof z.ZodError
          ? error.errors[0].message
          : "Internal server error",
      type: "error",
    });
  }
}
