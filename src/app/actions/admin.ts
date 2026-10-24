"use server";

import fs from "fs/promises";
import path from "path";
import prisma from "@/lib/db";
import { getSession, isAdminStaff } from "@/lib/session";
import { sendRealBillEmail } from "@/lib/email";
import { OrderStatus, PaymentStatus, PayoutStatus, TradeStatus, Role, DiscountType } from "@prisma/client";

/**
 * Fetch executive overview for the Business Owner Dashboard
 */
export async function getAdminOverviewAction() {
  try {
    const session = await getSession();
    if (!session || !isAdminStaff(session.role)) {
      return { success: false, error: "Unauthorized access: Admin permissions required." };
    }

    const [
      orders,
      pendingDealers,
      pendingPayouts,
      plumbersCount,
      totalSalesAgg,
      recentOrders,
    ] = await Promise.all([
      prisma.order.findMany({ select: { id: true, status: true, totalAmount: true } }),
      prisma.user.findMany({
        where: {
          role: { in: ["AUTHORIZED_DEALER", "TRADE"] },
          tradeStatus: TradeStatus.PENDING,
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          shopName: true,
          gstNumber: true,
          createdAt: true,
        },
      }),
      prisma.payoutRequest.findMany({
        where: { payoutStatus: PayoutStatus.REQUESTED },
        include: {
          plumber: {
            include: { user: { select: { name: true, phone: true } } },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.plumberProfile.count(),
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { paymentStatus: PaymentStatus.COMPLETED },
      }),
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true, email: true, phone: true } },
          items: {
            include: { product: { select: { title: true, brand: true } } },
          },
        },
      }),
    ]);

    const totalRevenue = totalSalesAgg._sum.totalAmount || 0;
    const pendingOrdersCount = orders.filter((o) => o.status === OrderStatus.PENDING).length;

    return {
      success: true,
      data: {
        totalRevenue,
        totalOrdersCount: orders.length,
        pendingOrdersCount,
        plumbersCount,
        pendingDealers,
        pendingPayouts: pendingPayouts.map((p) => ({
          id: p.id,
          plumberId: p.plumberId,
          plumberName: p.plumber.user.name || "Plumber",
          plumberPhone: p.plumber.user.phone,
          plumberCode: p.plumber.plumberCode,
          upiId: p.plumber.upiId,
          bankAccount: p.plumber.bankAccountNumber,
          bankIfsc: p.plumber.bankIfsc,
          pointsRedeemed: p.pointsRedeemed,
          cashAmount: p.cashAmount,
          createdAt: p.createdAt,
        })),
        recentOrders,
      },
    };
  } catch (error: unknown) {
    console.error("getAdminOverviewAction error:", error);
    return { success: false, error: "Failed to load admin overview." };
  }
}

/**
 * Update order dispatch / fulfillment status
 */
export async function updateOrderStatusAction(orderId: string, status: OrderStatus) {
  try {
    const session = await getSession();
    if (!session || !isAdminStaff(session.role)) {
      return { success: false, error: "Unauthorized access." };
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { referralTransaction: true },
    });

    if (!order) return { success: false, error: "Order not found." };

    await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });

    // If marked DELIVERED, automatically credit plumber referral points if not yet completed!
    if (status === OrderStatus.DELIVERED && order.referralTransaction && order.referralTransaction.status === PaymentStatus.PENDING) {
      await prisma.$transaction([
        prisma.referralTransaction.update({
          where: { id: order.referralTransaction.id },
          data: { status: PaymentStatus.COMPLETED },
        }),
        prisma.plumberProfile.update({
          where: { id: order.referralTransaction.plumberId },
          data: {
            activePoints: { increment: order.referralTransaction.pointsEarned },
            totalPoints: { increment: order.referralTransaction.pointsEarned },
          },
        }),
      ]);
    }

    return { success: true, message: `Order #${orderId.slice(-8)} updated to ${status}.` };
  } catch (error: unknown) {
    console.error("updateOrderStatusAction error:", error);
    return { success: false, error: "Failed to update order status." };
  }
}

/**
 * Approve or Reject Authorized Dealer shop application
 */
export async function approveDealerAction(userId: string, approved: boolean, creditLimit = 100000) {
  try {
    const session = await getSession();
    if (!session || !isAdminStaff(session.role)) {
      return { success: false, error: "Unauthorized access." };
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        tradeStatus: approved ? TradeStatus.APPROVED : TradeStatus.REJECTED,
        creditLimit: approved ? creditLimit : 0,
        role: approved ? Role.AUTHORIZED_DEALER : Role.RETAIL_CUSTOMER,
      },
    });

    return {
      success: true,
      message: approved ? `Dealer approved with credit line of ₹${creditLimit.toLocaleString()}.` : "Dealer application rejected.",
    };
  } catch (error: unknown) {
    console.error("approveDealerAction error:", error);
    return { success: false, error: "Failed to process dealer application." };
  }
}

/**
 * Disburse or Reject Plumber Cash Payout Request
 */
export async function processPlumberPayoutAction(payoutId: string, status: "PAID" | "REJECTED", utrNumber?: string) {
  try {
    const session = await getSession();
    if (!session || !isAdminStaff(session.role)) {
      return { success: false, error: "Unauthorized access." };
    }

    const payout = await prisma.payoutRequest.findUnique({
      where: { id: payoutId },
    });

    if (!payout) return { success: false, error: "Payout request not found." };

    if (status === "PAID") {
      await prisma.payoutRequest.update({
        where: { id: payoutId },
        data: {
          payoutStatus: PayoutStatus.PAID,
          utrNumber: utrNumber?.trim() || `UTR-${Date.now().toString().slice(-8)}`,
          processedAt: new Date(),
        },
      });
      return { success: true, message: "Payout marked as PAID and UTR recorded." };
    } else {
      // If rejected, refund points back to plumber's active balance
      await prisma.$transaction([
        prisma.payoutRequest.update({
          where: { id: payoutId },
          data: {
            payoutStatus: PayoutStatus.REJECTED,
            processedAt: new Date(),
          },
        }),
        prisma.plumberProfile.update({
          where: { id: payout.plumberId },
          data: {
            activePoints: { increment: payout.pointsRedeemed },
            redeemedPoints: { decrement: payout.pointsRedeemed },
          },
        }),
      ]);
      return { success: true, message: "Payout rejected. Points refunded to plumber active wallet." };
    }
  } catch (error: unknown) {
    console.error("processPlumberPayoutAction error:", error);
    return { success: false, error: "Failed to process payout." };
  }
}

/**
 * Uploads finalized official real tax invoice for an order and emails it to the customer within seconds
 */
export async function uploadRealBillAction(formData: FormData) {
  try {
    const session = await getSession();
    if (!session || !isAdminStaff(session.role)) {
      return { success: false, error: "Unauthorized access: Admin permissions required." };
    }

    const orderId = formData.get("orderId") as string;
    const file = formData.get("billFile") as File | null;
    const directUrl = formData.get("billUrl") as string | null;

    if (!orderId) {
      return { success: false, error: "Order ID is required." };
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: { select: { name: true, email: true, shopName: true } } },
    });

    if (!order) {
      return { success: false, error: "Order not found." };
    }

    let billUrl = directUrl?.trim() || "";
    let filename = "official-tax-invoice.pdf";

    if (file && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const safeFilename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
      const uploadDir = path.join(process.cwd(), "public", "uploads", "bills");
      await fs.mkdir(uploadDir, { recursive: true });
      const filePath = path.join(uploadDir, safeFilename);
      await fs.writeFile(filePath, buffer);

      billUrl = `/uploads/bills/${safeFilename}`;
      filename = file.name;
    }

    if (!billUrl) {
      return { success: false, error: "Please select a bill file (PDF/Image) or provide a document URL." };
    }

    await prisma.order.update({
      where: { id: orderId },
      data: {
        realBillUrl: billUrl,
        realBillFilename: filename,
        realBillUploadedAt: new Date(),
        realBillUploadedBy: session.email,
      },
    });

    // Send real bill email to customer within seconds
    if (order.user.email) {
      const fullBillUrl = billUrl.startsWith("http")
        ? billUrl
        : `${process.env.NEXT_PUBLIC_APP_URL || "https://store-kstco.vercel.app"}${billUrl}`;

      sendRealBillEmail({
        email: order.user.email,
        customerName: order.user.shopName || order.user.name || "Valued Customer",
        orderNumber: `KSTC-${order.id.slice(-8).toUpperCase()}`,
        realBillUrl: fullBillUrl,
        filename,
      }).catch((e) => console.error("Async real bill email error:", e));
    }

    return {
      success: true,
      message: `Official real bill uploaded and emailed to ${order.user.email} within seconds!`,
      realBillUrl: billUrl,
      filename,
    };
  } catch (error: unknown) {
    console.error("uploadRealBillAction error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to upload real bill." };
  }
}
