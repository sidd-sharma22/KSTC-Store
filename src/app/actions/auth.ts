"use server";

import crypto from "crypto";
import prisma from "@/lib/db";
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

    if (params.isSignUp && params.role === "TRADE" && !params.shopName?.trim()) {
      return {
        success: false,
        error: "Shop / Business Name is required for trade accounts.",
      };
    }

    // Rate limiting: check if OTP was created in the last 45 seconds
    const latestOtp = await prisma.verificationOtp.findFirst({
      where: { email },
      orderBy: { createdAt: "desc" },
    });

    if (latestOtp) {
      const secondsAgo = (Date.now() - new Date(latestOtp.createdAt).getTime()) / 1000;
      if (secondsAgo >= 0 && secondsAgo < 45) {
        const waitRemaining = Math.ceil(45 - secondsAgo);
        return {
          success: false,
          error: `Please wait ${waitRemaining}s before requesting a new verification code.`,
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
        error: emailResult.error || "Failed to deliver OTP email. Please check your email configuration.",
      };
    }

    return {
      success: true,
      message: `A 6-digit verification code has been sent to ${email}.`,
      devMode: emailResult.devMode,
      devOtp: emailResult.devOtp,
    };
  } catch (error: unknown) {
    console.error("sendOtpAction error:", error);
    const errMessage = error instanceof Error ? error.message : "Database connection error";
    return {
      success: false,
      error: `Failed to process OTP request: ${errMessage}. Please try again.`,
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

    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
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
      // Update existing user verification status and trade details if submitted
      const updateData: Record<string, unknown> = {
        emailVerified: new Date(),
      };
      if (params.name?.trim() && !user.name) {
        updateData.name = params.name.trim();
      }
      if (params.role === "TRADE") {
        if (params.shopName?.trim()) updateData.shopName = params.shopName.trim();
        if (params.gstNumber?.trim()) updateData.gstNumber = params.gstNumber.trim();
        if (user.role === "RETAIL") {
          updateData.role = "TRADE";
          updateData.tradeStatus = "PENDING";
        }
      }

      user = await prisma.user.update({
        where: { id: user.id },
        data: updateData,
      });
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
      message: params.isSignUp ? "Account setup completed!" : "Signed in successfully!",
      user: sessionPayload,
    };
  } catch (error: unknown) {
    console.error("verifyOtpAction error:", error);
    const errMessage = error instanceof Error ? error.message : "Verification error";
    return {
      success: false,
      error: `Verification failed: ${errMessage}. Please try again.`,
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
