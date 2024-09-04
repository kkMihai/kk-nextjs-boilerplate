import bcryptjs from "bcryptjs";
import prisma from "@/lib/db/prisma";
import moment from "moment";
import { generateEmailVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/email.mjs";
import { RegisterSchema, z } from "@/schemas";
import { createId } from "@paralleldrive/cuid2";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      res.status(405).json({ message: "Method not allowed" });
      return;
    }

    const { username, password, email, captchaToken } = RegisterSchema.parse(
      req.body,
    );

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
      return res
        .status(400)
        .json({ message: "User already exists!", type: "error" });
    }

    const base64DecodedPassword = Buffer.from(password, "base64").toString();

    const newUser = await prisma.user.create({
      data: {
        id: createId(),
        username,
        password: await bcryptjs.hash(base64DecodedPassword, 13),
        email,
        createdAt: moment().format(),
      },
    });

    const verificationToken = await generateEmailVerificationToken(
      email,
      newUser.id,
    );

    const isEmailSend = await sendVerificationEmail(
      email,
      verificationToken.token,
      username,
    );

    if (!isEmailSend) {
      return res.status(500).json({
        message: "Failed to send verification email, contact support",
        type: "error",
      });
    }

    return res.status(200).json({
      message:
        "Your account has been registered! Check your email to confirm email address",
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
