"use server";

import crypto from "crypto";
import prisma from "@/lib/prisma";
import { sendOtpEmail } from "@/lib/email";
import { createSession, destroySession, getSession, SessionPayload } from "@/lib/session";

interface SendOtpParams {
  email: string;
  name?: string;
  role?: "RETAIL" | "TRADE";
  shopName?: string;
  gstNumber?: string;
  isSignUp: boolean;
}

interface VerifyOtpParams {
  email: string;
  otp: string;
  name?: string;
  role?: "RETAIL" | "TRADE";
  shopName?: string;
  gstNumber?: string;
  isSignUp: boolean;
}

export interface AuthActionResult {
  success: boolean;
  message?: string;
  error?: string;
  devMode?: boolean;
  devOtp?: string;
  user?: SessionPayload;
}

/**
 * Server Action: Generates and dispatches a 6-digit OTP to the user's email.
 */
export async function sendOtpAction(params: SendOtpParams): Promise<AuthActionResult> {
  try {
    const email = params.email.trim().toLowerCase();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { success: false, error: "Please enter a valid email address." };
    }

    // Check existing account status in database
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (params.isSignUp && existingUser) {
      return {
        success: false,
        error: "An account with this email already exists. Please sign in instead.",
      };
    }

    if (!params.isSignUp && !existingUser) {
      return {
        success: false,
        error: "No account found with this email. Please sign up to create one.",
      };
    }

    if (params.isSignUp && params.role === "TRADE" && !params.shopName?.trim()) {
      return {
        success: false,
        error: "Shop/Business Name is required for trade accounts.",
      };
    }

    // Rate limiting: check if OTP was created in the last 60 seconds
    const latestOtp = await prisma.verificationOtp.findFirst({
      where: { email },
      orderBy: { createdAt: "desc" },
    });

    if (latestOtp) {
      const secondsAgo = (Date.now() - new Date(latestOtp.createdAt).getTime()) / 1000;
      if (secondsAgo < 60) {
        const waitRemaining = Math.ceil(60 - secondsAgo);
        return {
          success: false,
          error: `Please wait ${waitRemaining} seconds before requesting a new code.`,
        };
      }
    }

    // Generate secure 6-digit numeric OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Delete any old OTPs for this email and record the new one
    await prisma.verificationOtp.deleteMany({
      where: { email },
    });

    await prisma.verificationOtp.create({
      data: {
        email,
        otp,
        expiresAt,
      },
    });

    // Send email using internal dispatcher
    const emailResult = await sendOtpEmail(email, otp);

    if (!emailResult.success) {
      return {
        success: false,
        error: emailResult.error || "Failed to deliver OTP email. Please try again.",
      };
    }

    return {
      success: true,
      message: `A 6-digit verification code has been sent to ${email}.`,
      devMode: emailResult.devMode,
      devOtp: emailResult.devOtp,
    };
  } catch (error: any) {
    console.error("sendOtpAction error:", error);
    return {
      success: false,
      error: "An unexpected error occurred while sending verification code. Please try again.",
    };
  }
}

/**
 * Server Action: Verifies the 6-digit OTP, registers/signs in the user, and sets session cookie.
 */
export async function verifyOtpAction(params: VerifyOtpParams): Promise<AuthActionResult> {
  try {
    const email = params.email.trim().toLowerCase();
    const otp = params.otp.trim();

    if (!email || !otp || otp.length !== 6) {
      return { success: false, error: "Please provide a valid 6-digit verification code." };
    }

    // Verify OTP in database
    const otpRecord = await prisma.verificationOtp.findFirst({
      where: {
        email,
        otp,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!otpRecord) {
      return {
        success: false,
        error: "Invalid or expired verification code. Please request a new one.",
      };
    }

    // Delete the consumed OTP
    await prisma.verificationOtp.deleteMany({
      where: { email },
    });

    let user;

    if (params.isSignUp) {
      // Create new user record
      user = await prisma.user.create({
        data: {
          email,
          name: params.name?.trim() || email.split("@")[0],
          role: params.role || "RETAIL",
          shopName: params.role === "TRADE" ? params.shopName?.trim() : null,
          gstNumber: params.role === "TRADE" ? params.gstNumber?.trim() : null,
          tradeStatus: params.role === "TRADE" ? "PENDING" : null,
          emailVerified: new Date(),
        },
      });
    } else {
      // Find existing user
      user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return {
          success: false,
          error: "Account not found. Please sign up first.",
        };
      }

      // Mark email as verified if not yet done
      if (!user.emailVerified) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { emailVerified: new Date() },
        });
      }
    }

    const sessionPayload: SessionPayload = {
      userId: user.id,
      email: user.email!,
      name: user.name,
      role: user.role,
      tradeStatus: user.tradeStatus,
      shopName: user.shopName,
    };

    // Issue secure HTTP-only session cookie
    await createSession(sessionPayload);

    return {
      success: true,
      message: params.isSignUp ? "Account created successfully!" : "Signed in successfully!",
      user: sessionPayload,
    };
  } catch (error: any) {
    console.error("verifyOtpAction error:", error);
    return {
      success: false,
      error: "An unexpected error occurred during verification. Please try again.",
    };
  }
}

/**
 * Server Action: Logs out the current user by clearing the session cookie.
 */
export async function logoutAction(): Promise<{ success: boolean }> {
  await destroySession();
  return { success: true };
}

/**
 * Server Action: Fetches the current authenticated user's session.
 */
export async function getCurrentUserAction(): Promise<SessionPayload | null> {
  return await getSession();
}
