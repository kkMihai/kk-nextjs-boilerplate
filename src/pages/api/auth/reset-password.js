import { getUserByEmail } from "@/data/user";
import { generatePasswordResetToken } from "@/lib/tokens";
import { sendPasswordResetEmail } from "@/lib/email.mjs";
import { getPasswordResetTokenByEmail } from "@/data/passwordResetToken";
import { z } from "@/schemas";
import { validateTOTP } from "@/lib/2fa";

export default async function handler(req, res) {
  const { email, captchaToken, OTPCode } = req.body;

  if (req.method !== "POST")
    return res.status(405).json({ message: "Method not allowed" });

  if (!captchaToken) {
    return res.status(400).json({
      message: "No captcha token provided",
      type: "error",
    });
  }

  if (!email) {
    return res.status(400).json({
      message: "No email provided",
      type: "error",
    });
  }

  try {
    const verifyCaptchaResponse = await fetch(
      `${process.env.BASE_URL}/api/verify-captcha`,
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

    const existingUser = await getUserByEmail(email);

    if (!existingUser) {
      return res.status(400).json({
        message: "Cannot find this email in our records",
        type: "error",
      });
    }

    const has2FA = !!existingUser.twoFactorSecret;

    if (has2FA && !OTPCode) {
      return res.status(400).json({
        message: "2FA required",
        type: "error",
      });
    } else if (has2FA && OTPCode) {
      const isValidOTP = validateTOTP(existingUser.twoFactorSecret, OTPCode);

      if (!isValidOTP) {
        return res.status(400).json({
          message: "Two-Factor Authentication Code is invalid",
          type: "error",
        });
      }
    }

    const existingToken = await getPasswordResetTokenByEmail(email);

    if (existingToken && new Date(existingToken.expires) > new Date()) {
      const timeLeft = Math.abs(new Date(existingToken.expires) - new Date());
      const timeLeftInMinutes = Math.floor(timeLeft / 60000);
      const timeLeftInSec = Math.floor((timeLeft % 60000) / 1000);

      return res.status(400).json({
        message: `You have already requested a password reset email. Please wait ${timeLeftInMinutes} minutes, ${timeLeftInSec} seconds before trying again.`,
        type: "error",
      });
    }

    const generateToken = await generatePasswordResetToken(email);

    if (!generateToken) {
      return res.status(400).json({
        message: "Failed to generate password reset token",
        type: "error",
      });
    }

    await sendPasswordResetEmail(
      email,
      generateToken.token,
      existingUser.username,
    );

    return res.status(200).json({
      message: "An Password reset email has been sent to your email",
      type: "success",
    });
  } catch (error) {
    console.error("Error in reset-password.js: ", error);
    return res.status(500).json({
      message:
        error instanceof z.ZodError
          ? error.errors[0].message
          : "Internal server error",
      type: "error",
    });
  }
}
