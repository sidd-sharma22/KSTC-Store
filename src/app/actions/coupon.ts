"use server";

import prisma from "@/lib/db";
import { UserRole } from "@/lib/session";

export interface ValidateCouponResult {
  isValid: boolean;
  couponId?: string;
  code?: string;
  discountType?: "PERCENTAGE" | "FIXED_AMOUNT";
  discountValue?: number;
  discountAmount: number;
  finalTotal: number;
  message?: string;
  error?: string;
  isPlumberReferral?: boolean;
  plumberCode?: string;
  plumberName?: string;
}

/**
 * Validates either a standard Coupon Code or a Plumber Referral Code/Mobile
 */
export async function validateCouponAction(
  rawCode: string,
  subtotal: number,
  userRole?: UserRole | null
): Promise<ValidateCouponResult> {
  const code = rawCode.trim().toUpperCase();

  if (!code) {
    return {
      isValid: false,
      discountAmount: 0,
      finalTotal: subtotal,
      error: "Please enter a valid coupon or referral code.",
    };
  }

  try {
    // 1. Check if the code matches a registered Plumber's Code or Mobile
    const plumberProfile = await prisma.plumberProfile.findFirst({
      where: {
        OR: [
          { plumberCode: code },
          { user: { phone: rawCode.trim().replace(/\D/g, "").slice(-10) } },
        ],
      },
      include: {
        user: {
          select: { name: true, phone: true },
        },
      },
    });

    if (plumberProfile) {
      // Plumber referral discount: 5% on-the-spot discount for the customer!
      const discountPercentage = 5;
      const discountAmount = Math.round((subtotal * discountPercentage) / 100);
      const finalTotal = Math.max(0, subtotal - discountAmount);

      return {
        isValid: true,
        code: plumberProfile.plumberCode,
        discountType: "PERCENTAGE",
        discountValue: discountPercentage,
        discountAmount,
        finalTotal,
        isPlumberReferral: true,
        plumberCode: plumberProfile.plumberCode,
        plumberName: plumberProfile.user.name || "Certified Plumber Partner",
        message: `Plumber referral code applied! You save ₹${discountAmount} (5% off).`,
      };
    }

    // 2. Check standard promotional Coupons in database
    const coupon = await prisma.coupon.findUnique({
      where: { code },
    });

    if (!coupon) {
      return {
        isValid: false,
        discountAmount: 0,
        finalTotal: subtotal,
        error: "Invalid coupon or plumber referral code.",
      };
    }

    if (!coupon.isActive) {
      return {
        isValid: false,
        discountAmount: 0,
        finalTotal: subtotal,
        error: "This coupon is currently inactive.",
      };
    }

    if (coupon.validUntil && new Date() > new Date(coupon.validUntil)) {
      return {
        isValid: false,
        discountAmount: 0,
        finalTotal: subtotal,
        error: "This coupon code has expired.",
      };
    }

    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return {
        isValid: false,
        discountAmount: 0,
        finalTotal: subtotal,
        error: "This coupon has reached its maximum usage limit.",
      };
    }

    if (subtotal < coupon.minOrderValue) {
      return {
        isValid: false,
        discountAmount: 0,
        finalTotal: subtotal,
        error: `Minimum order value of ₹${coupon.minOrderValue} is required to apply this coupon.`,
      };
    }

    // Check Role Restrictions if specified on the coupon
    if (coupon.allowedRoles.length > 0 && userRole) {
      const isAllowed = coupon.allowedRoles.some(
        (r) => r.toString() === userRole.toString()
      );
      if (!isAllowed) {
        return {
          isValid: false,
          discountAmount: 0,
          finalTotal: subtotal,
          error: "This coupon is reserved for specific customer account categories.",
        };
      }
    }

    // Calculate Discount Amount
    let discountAmount = 0;
    if (coupon.discountType === "PERCENTAGE") {
      discountAmount = Math.round((subtotal * coupon.discountValue) / 100);
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else {
      discountAmount = coupon.discountValue;
    }

    discountAmount = Math.min(discountAmount, subtotal);
    const finalTotal = Math.max(0, subtotal - discountAmount);

    return {
      isValid: true,
      couponId: coupon.id,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount,
      finalTotal,
      isPlumberReferral: false,
      message: `Coupon "${coupon.code}" applied! You save ₹${discountAmount}.`,
    };
  } catch (error: unknown) {
    console.error("validateCouponAction error:", error);
    return {
      isValid: false,
      discountAmount: 0,
      finalTotal: subtotal,
      error: "Failed to validate coupon code.",
    };
  }
}
