import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { verifyCashfreeWebhookSignature } from "@/lib/cashfree";
import { OrderStatus, PaymentStatus } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const timestamp = request.headers.get("x-webhook-timestamp") || "";
    const signature = request.headers.get("x-webhook-signature") || "";

    // Verify webhook authenticity
    const isValid = verifyCashfreeWebhookSignature(rawBody, timestamp, signature);
    if (!isValid) {
      console.warn("Unauthorized Cashfree webhook signature received");
      return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    console.log(`[CASHFREE WEBHOOK] Event: ${payload.type || payload.event}`);

    // Handle Payment Success
    const isPaymentSuccess =
      payload.type === "PAYMENT_SUCCESS_WEBHOOK" ||
      payload.type === "ORDER_PAID" ||
      payload.event === "ORDER_PAID";

    if (isPaymentSuccess) {
      const orderId = payload.data?.order?.order_id || payload.data?.order_id;
      const paymentId = payload.data?.payment?.cf_payment_id?.toString() || payload.data?.payment_id?.toString();

      if (!orderId) {
        return NextResponse.json({ error: "Missing order_id" }, { status: 400 });
      }

      // Update Order in database
      const order = await prisma.order.findFirst({
        where: {
          OR: [{ id: orderId }, { cashfreeOrderId: orderId }],
        },
        include: { referralTransaction: true },
      });

      if (order) {
        await prisma.order.update({
          where: { id: order.id },
          data: {
            status: OrderStatus.CONFIRMED,
            paymentStatus: PaymentStatus.COMPLETED,
            cashfreePaymentId: paymentId || order.cashfreePaymentId,
          },
        });

        // Credit Plumber referral rewards immediately if transaction exists
        if (order.referralTransaction && order.referralTransaction.status === PaymentStatus.PENDING) {
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
          console.log(`[PLUMBER REWARD CREDITED] ${order.referralTransaction.pointsEarned} points credited to plumber!`);
        }
      }
    }

    return NextResponse.json({ status: "ok" });
  } catch (error: unknown) {
    console.error("Cashfree webhook processing error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
