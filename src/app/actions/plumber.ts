"use server";

import prisma from "@/lib/db";
import { getSession } from "@/lib/session";
import { PayoutStatus } from "@prisma/client";

export interface PlumberDashboardData {
  plumberCode: string;
  name: string;
  phone: string | null;
  totalPoints: number;
  activePoints: number;
  redeemedPoints: number;
  commissionRate: number;
  upiId: string | null;
  bankAccountNumber: string | null;
  bankIfsc: string | null;
  bankAccountName: string | null;
  referrals: {
    id: string;
    orderId: string;
    orderAmount: number;
    pointsEarned: number;
    status: string;
    createdAt: Date;
  }[];
  payoutRequests: {
    id: string;
    pointsRedeemed: number;
    cashAmount: number;
    payoutStatus: string;
    utrNumber: string | null;
    createdAt: Date;
  }[];
}

/**
 * Fetch Plumber Profile, rewards wallet balance, referral ledger, and payout history
 */
export async function getPlumberDashboardAction(): Promise<{
  success: boolean;
  data?: PlumberDashboardData;
  error?: string;
}> {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return { success: false, error: "Please sign in to access plumber rewards." };
    }

    const plumberProfile = await prisma.plumberProfile.findFirst({
      where: {
        OR: [
          { userId: session.userId },
          { plumberCode: session.plumberCode || undefined },
        ],
      },
      include: {
        user: { select: { name: true, phone: true } },
        referrals: {
          orderBy: { createdAt: "desc" },
          take: 20,
        },
        payoutRequests: {
          orderBy: { createdAt: "desc" },
          take: 20,
        },
      },
    });

    if (!plumberProfile) {
      return { success: false, error: "No active plumber certificate profile found for this account." };
    }

    return {
      success: true,
      data: {
        plumberCode: plumberProfile.plumberCode,
        name: plumberProfile.user.name || "Certified Plumber",
        phone: plumberProfile.user.phone,
        totalPoints: plumberProfile.totalPoints,
        activePoints: plumberProfile.activePoints,
        redeemedPoints: plumberProfile.redeemedPoints,
        commissionRate: plumberProfile.commissionRate,
        upiId: plumberProfile.upiId,
        bankAccountNumber: plumberProfile.bankAccountNumber,
        bankIfsc: plumberProfile.bankIfsc,
        bankAccountName: plumberProfile.bankAccountName,
        referrals: plumberProfile.referrals.map((r) => ({
          id: r.id,
          orderId: r.orderId,
          orderAmount: r.orderAmount,
          pointsEarned: r.pointsEarned,
          status: r.status,
          createdAt: r.createdAt,
        })),
        payoutRequests: plumberProfile.payoutRequests.map((p) => ({
          id: p.id,
          pointsRedeemed: p.pointsRedeemed,
          cashAmount: p.cashAmount,
          payoutStatus: p.payoutStatus,
          utrNumber: p.utrNumber,
          createdAt: p.createdAt,
        })),
      },
    };
  } catch (error: unknown) {
    console.error("getPlumberDashboardAction error:", error);
    return { success: false, error: "Failed to load plumber dashboard data." };
  }
}

interface RequestPayoutParams {
  pointsToRedeem: number;
  upiId?: string;
  bankAccountNumber?: string;
  bankIfsc?: string;
  bankAccountName?: string;
}

/**
 * Plumber requests conversion of accumulated points to direct cash benefits
 */
export async function requestPlumberPayoutAction(params: RequestPayoutParams): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return { success: false, error: "Authentication required." };
    }

    const points = Math.floor(params.pointsToRedeem);
    if (points <= 0) {
      return { success: false, error: "Please enter a valid points amount to redeem." };
    }

    const plumberProfile = await prisma.plumberProfile.findFirst({
      where: {
        OR: [
          { userId: session.userId },
          { plumberCode: session.plumberCode || undefined },
        ],
      },
    });

    if (!plumberProfile) {
      return { success: false, error: "Plumber profile not found." };
    }

    if (plumberProfile.activePoints < points) {
      return {
        success: false,
        error: `Insufficient active balance. You have ${plumberProfile.activePoints} points available.`,
      };
    }

    const cashAmount = points; // 1 Point = 1 INR

    // Execute transaction: create payout request and deduct active points
    await prisma.$transaction([
      prisma.payoutRequest.create({
        data: {
          plumberId: plumberProfile.id,
          pointsRedeemed: points,
          cashAmount,
          payoutStatus: PayoutStatus.REQUESTED,
        },
      }),
      prisma.plumberProfile.update({
        where: { id: plumberProfile.id },
        data: {
          activePoints: { decrement: points },
          redeemedPoints: { increment: points },
          upiId: params.upiId?.trim() || plumberProfile.upiId,
          bankAccountNumber: params.bankAccountNumber?.trim() || plumberProfile.bankAccountNumber,
          bankIfsc: params.bankIfsc?.trim() || plumberProfile.bankIfsc,
          bankAccountName: params.bankAccountName?.trim() || plumberProfile.bankAccountName,
        },
      }),
    ]);

    return {
      success: true,
      message: `Payout request for ₹${cashAmount} submitted successfully! Funds will be disbursed to your registered account within 24 hours.`,
    };
  } catch (error: unknown) {
    console.error("requestPlumberPayoutAction error:", error);
    return { success: false, error: "Failed to submit payout request." };
  }
}
