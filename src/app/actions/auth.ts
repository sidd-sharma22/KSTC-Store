"use server";

import crypto from "crypto";
import prisma from "@/lib/db";
import { sendOtpEmail } from "@/lib/email";
import { createSession, destroySession, getSession, SessionPayload, UserRole } from "@/lib/session";

interface SendOtpParams {
  email: string;
  name?: string;
  phone?: string;
  role?: UserRole;
  customerTag?: string; // "HOMEOWNER", "BUILDER", "CONTRACTOR"
  shopName?: string;
  gstNumber?: string;
  companyName?: string;
  isSignUp: boolean;
}

interface VerifyOtpParams {
  email: string;
  otp: string;
  name?: string;
  phone?: string;
  role?: UserRole;
  customerTag?: string;
  shopName?: string;
  gstNumber?: string;
  companyName?: string;
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

    if (params.isSignUp && (params.role === "AUTHORIZED_DEALER" || params.role === "TRADE") && !params.shopName?.trim()) {
      return {
        success: false,
        error: "Shop / Business Name is required for dealer accounts.",
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

    const cleanPhone = params.phone?.trim() || null;

    // Find user by email OR phone to prevent unique constraint crashes
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          ...(cleanPhone ? [{ phone: cleanPhone }] : []),
        ],
      },
      include: { plumberProfile: true },
    });

    const normalizedRole = params.role || "RETAIL_CUSTOMER";

    if (!user) {
      // Create new user record
      try {
        user = await prisma.user.create({
          data: {
            email,
            name: params.name?.trim() || email.split("@")[0],
            phone: cleanPhone,
            role: normalizedRole,
            customerTag: params.customerTag?.trim() || null,
            companyName: params.companyName?.trim() || null,
            shopName: (normalizedRole === "AUTHORIZED_DEALER" || normalizedRole === "TRADE") ? params.shopName?.trim() : null,
            gstNumber: (normalizedRole === "AUTHORIZED_DEALER" || normalizedRole === "CONTRACTOR" || normalizedRole === "TRADE") ? params.gstNumber?.trim() : null,
            tradeStatus: (normalizedRole === "AUTHORIZED_DEALER" || normalizedRole === "TRADE") ? "PENDING" : null,
            emailVerified: new Date(),
          },
          include: { plumberProfile: true },
        });
      } catch (createError: any) {
        if (createError?.code === "P2002") {
          return {
            success: false,
            error: "An account with this mobile number or email is already registered. Please sign in.",
          };
        }
        throw createError;
      }

      // If registered as a certified plumber, provision their PlumberProfile
      if (normalizedRole === "PLUMBER") {
        const generatedCode = `PLUM-${Math.floor(1000 + Math.random() * 9000)}`;
        const plumberProfile = await prisma.plumberProfile.create({
          data: {
            userId: user.id,
            plumberCode: generatedCode,
            commissionRate: 0.05,
          },
        });
        user = { ...user, plumberProfile };
      }
    } else {
      // Update existing user verification status and profile details if submitted
      const updateData: Record<string, unknown> = {
        emailVerified: new Date(),
      };
      if (email && user.email !== email) {
        updateData.email = email;
      }
      if (params.name?.trim()) {
        updateData.name = params.name.trim();
      }
      if (cleanPhone) {
        updateData.phone = cleanPhone;
      }
      if (params.customerTag?.trim()) {
        updateData.customerTag = params.customerTag.trim();
      }
      if (params.companyName?.trim()) {
        updateData.companyName = params.companyName.trim();
      }
      if (params.role) {
        updateData.role = params.role;
        if (params.role === "AUTHORIZED_DEALER" || params.role === "TRADE") {
          if (params.shopName?.trim()) updateData.shopName = params.shopName.trim();
          if (params.gstNumber?.trim()) updateData.gstNumber = params.gstNumber.trim();
          if (!user.tradeStatus) updateData.tradeStatus = "PENDING";
        }
      }

      user = await prisma.user.update({
        where: { id: user.id },
        data: updateData,
        include: { plumberProfile: true },
      });

      // Ensure plumber profile exists if role is PLUMBER
      if ((user.role === "PLUMBER" || params.role === "PLUMBER") && !user.plumberProfile) {
        const generatedCode = `PLUM-${Math.floor(1000 + Math.random() * 9000)}`;
        const plumberProfile = await prisma.plumberProfile.create({
          data: {
            userId: user.id,
            plumberCode: generatedCode,
            commissionRate: 0.05,
          },
        });
        user = { ...user, plumberProfile };
      }
    }

    const sessionPayload: SessionPayload = {
      userId: user.id,
      email: user.email!,
      name: user.name,
      phone: user.phone,
      role: user.role as UserRole,
      customerTag: user.customerTag,
      tradeStatus: user.tradeStatus,
      shopName: user.shopName,
      plumberCode: user.plumberProfile?.plumberCode || null,
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
 * Server Action: Send verification OTP for updating customer email address
 */
export async function sendEmailChangeOtpAction(newEmail: string): Promise<{
  success: boolean;
  message?: string;
  error?: string;
  devOtp?: string;
}> {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Please sign in to update credentials." };
    }

    const cleanEmail = newEmail.trim().toLowerCase();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return { success: false, error: "Please enter a valid email address." };
    }

    if (cleanEmail === session.email.toLowerCase()) {
      return { success: false, error: "New email is identical to current email." };
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });
    if (existingUser && existingUser.id !== session.userId) {
      return { success: false, error: "This email address is already registered to another user." };
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.verificationOtp.deleteMany({ where: { email: cleanEmail } });
    await prisma.verificationOtp.create({
      data: { email: cleanEmail, otp, expiresAt },
    });

    const emailSent = await sendOtpEmail(cleanEmail, otp);
    return {
      success: true,
      message: emailSent
        ? `Verification code dispatched to ${cleanEmail}`
        : `Verification code generated for ${cleanEmail}`,
      devOtp: otp,
    };
  } catch (error: unknown) {
    console.error("sendEmailChangeOtpAction error:", error);
    return { success: false, error: "Failed to dispatch verification email." };
  }
}

/**
 * Server Action: Updates customer profile credentials (name, mobile, email with OTP)
 */
export async function updateProfileCredentialsAction(params: {
  name: string;
  phone: string;
  email?: string;
  emailOtp?: string;
}): Promise<{
  success: boolean;
  message?: string;
  error?: string;
  user?: SessionPayload;
}> {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return { success: false, error: "Authentication required to update profile." };
    }

    const cleanName = params.name.trim();
    const cleanPhone = params.phone.trim();

    if (!cleanName) {
      return { success: false, error: "Full name cannot be blank." };
    }

    if (!cleanPhone || !/^\d{10}$/.test(cleanPhone.replace(/\D/g, ""))) {
      return { success: false, error: "Please enter a valid 10-digit mobile number." };
    }

    // Ensure phone is not taken by another user
    const existingPhone = await prisma.user.findFirst({
      where: {
        phone: cleanPhone,
        NOT: { id: session.userId },
      },
    });
    if (existingPhone) {
      return { success: false, error: "This mobile number is already registered with another account." };
    }

    const updateData: Record<string, unknown> = {
      name: cleanName,
      phone: cleanPhone,
    };

    // If customer is updating their email, verify OTP first
    if (params.email && params.email.trim().toLowerCase() !== session.email.toLowerCase()) {
      const newEmail = params.email.trim().toLowerCase();
      if (!params.emailOtp || params.emailOtp.trim().length !== 6) {
        return { success: false, error: "Please enter the 6-digit OTP sent to your new email." };
      }

      const otpRecord = await prisma.verificationOtp.findFirst({
        where: {
          email: newEmail,
          otp: params.emailOtp.trim(),
          expiresAt: { gte: new Date() },
        },
      });

      if (!otpRecord) {
        return { success: false, error: "Invalid or expired verification code for new email." };
      }

      await prisma.verificationOtp.deleteMany({ where: { email: newEmail } });
      updateData.email = newEmail;
      updateData.emailVerified = new Date();
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.userId },
      data: updateData,
      include: { plumberProfile: true },
    });

    const updatedSession: SessionPayload = {
      ...session,
      name: updatedUser.name,
      phone: updatedUser.phone,
      email: updatedUser.email!,
    };

    await createSession(updatedSession);

    return {
      success: true,
      message: "Profile credentials updated successfully!",
      user: updatedSession,
    };
  } catch (error: unknown) {
    console.error("updateProfileCredentialsAction error:", error);
    return { success: false, error: "Failed to update profile credentials." };
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
