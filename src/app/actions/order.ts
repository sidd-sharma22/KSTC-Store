"use server";

import prisma from "@/lib/db";
import { getSession } from "@/lib/session";
import { createCashfreeOrder } from "@/lib/cashfree";
import { sendTemporaryBillEmail } from "@/lib/email";
import { PaymentMethod, DeliveryType, OrderStatus, PaymentStatus } from "@prisma/client";

export interface CreateOrderParams {
  items: {
    id: string;
    quantity: number;
    title?: string;
  }[];
  deliveryDetails: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    notes?: string;
  };
  deliveryType: "DELIVERY" | "PICKUP";
  paymentMethod: "CASHFREE" | "PAY_LATER" | "BANK_TRANSFER" | "COD";
  couponCode?: string;
  plumberCode?: string;
}

export interface CreateOrderResult {
  success: boolean;
  orderId?: string;
  orderNumber?: string;
  paymentSessionId?: string;
  requiresPaymentRedirect?: boolean;
  totalAmount?: number;
  error?: string;
}

/**
 * Creates and persists an order in PostgreSQL, handles discounts, plumber referral rewards, and Cashfree PG checkout
 */
export async function createOrderAction(params: CreateOrderParams): Promise<CreateOrderResult> {
  try {
    if (!params.items || params.items.length === 0) {
      return { success: false, error: "Your shopping cart is empty." };
    }

    const session = await getSession();

    // 1. Fetch current product prices and stock from PostgreSQL
    const productIds = params.items.map((i) => i.id);
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds } },
      include: { bulkPricing: { orderBy: { minQuantity: "asc" } } },
    });

    if (dbProducts.length === 0) {
      return { success: false, error: "Selected products are no longer available in catalog." };
    }

    // 2. Compute subtotal based on user role (Dealer vs Contractor vs Retail)
    let subtotal = 0;
    const orderItemsData: {
      productId: string;
      quantity: number;
      unitPrice: number;
    }[] = [];

    const isDealer = session?.role === "AUTHORIZED_DEALER" || session?.role === "TRADE";
    const isContr = session?.role === "CONTRACTOR";

    for (const item of params.items) {
      const dbProduct = dbProducts.find((p) => p.id === item.id);
      if (!dbProduct) continue;

      let unitPrice = dbProduct.basePrice;
      if (isDealer && dbProduct.dealerPrice) {
        unitPrice = dbProduct.dealerPrice;
      } else if (isContr && dbProduct.contractorPrice) {
        unitPrice = dbProduct.contractorPrice;
      } else if (dbProduct.bulkPricing.length > 0) {
        // Check if quantity qualifies for a bulk tier
        for (const tier of dbProduct.bulkPricing) {
          if (item.quantity >= tier.minQuantity) {
            unitPrice = tier.pricePerUnit;
          }
        }
      }

      subtotal += unitPrice * item.quantity;
      orderItemsData.push({
        productId: dbProduct.id,
        quantity: item.quantity,
        unitPrice,
      });
    }

    // 3. Process Coupon / Plumber Referral Discount
    let discountAmount = 0;
    let appliedCouponId: string | null = null;
    let verifiedPlumberProfile: { id: string; plumberCode: string } | null = null;

    // Check Plumber Code first
    if (params.plumberCode?.trim()) {
      const code = params.plumberCode.trim().toUpperCase();
      const pProfile = await prisma.plumberProfile.findFirst({
        where: {
          OR: [
            { plumberCode: code },
            { user: { phone: params.plumberCode.trim().replace(/\D/g, "").slice(-10) } },
          ],
        },
      });
      if (pProfile) {
        verifiedPlumberProfile = pProfile;
        // 5% discount for customer
        discountAmount = Math.round(subtotal * 0.05);
      }
    }

    // Check Coupon Code if no plumber referral applied or if extra coupon entered
    if (!verifiedPlumberProfile && params.couponCode?.trim()) {
      const cCode = params.couponCode.trim().toUpperCase();
      const coupon = await prisma.coupon.findUnique({ where: { code: cCode } });
      if (coupon && coupon.isActive && subtotal >= coupon.minOrderValue) {
        appliedCouponId = coupon.id;
        if (coupon.discountType === "PERCENTAGE") {
          discountAmount = Math.round((subtotal * coupon.discountValue) / 100);
          if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
            discountAmount = coupon.maxDiscount;
          }
        } else {
          discountAmount = coupon.discountValue;
        }
      }
    }

    const discountedSubtotal = Math.max(0, subtotal - discountAmount);
    const taxAmount = Math.round(discountedSubtotal * 0.18); // 18% standard GST
    const totalAmount = discountedSubtotal + taxAmount;

    // 4. Ensure Authenticated User and Address record
    if (!session?.userId) {
      return { success: false, error: "Please sign in or create an account to place an order." };
    }
    const userId = session.userId;
    const email = params.deliveryDetails.email.trim().toLowerCase();
    const phone = params.deliveryDetails.phone.trim();
    const fullName = `${params.deliveryDetails.firstName} ${params.deliveryDetails.lastName}`.trim();

    // Create shipping address record
    const address = await prisma.address.create({
      data: {
        userId,
        type: "SHIPPING",
        street: params.deliveryDetails.address,
        city: params.deliveryDetails.city,
        state: params.deliveryDetails.state,
        pincode: params.deliveryDetails.pincode,
        isDefault: true,
      },
    });

    const orderNumber = `KSTC-${Date.now().toString().slice(-8)}`;

    // 5. Create Order in PostgreSQL
    const order = await prisma.order.create({
      data: {
        userId,
        totalAmount,
        taxAmount,
        discountAmount,
        status: OrderStatus.PENDING,
        paymentMethod: params.paymentMethod as PaymentMethod,
        paymentStatus: PaymentStatus.PENDING,
        shippingAddressId: address.id,
        deliveryType: params.deliveryType as DeliveryType,
        couponId: appliedCouponId,
        referredByPlumberCode: verifiedPlumberProfile?.plumberCode || null,
        items: {
          create: orderItemsData,
        },
      },
    });

    // 6. Record Plumber Referral Reward Transaction if referred by a plumber
    if (verifiedPlumberProfile) {
      const plumberPoints = Math.round(discountedSubtotal * 0.05); // 5% points reward
      await prisma.referralTransaction.create({
        data: {
          plumberId: verifiedPlumberProfile.id,
          orderId: order.id,
          orderAmount: discountedSubtotal,
          commissionRate: 0.05,
          pointsEarned: plumberPoints,
          status: PaymentStatus.PENDING, // Will become COMPLETED when order is DELIVERED
        },
      });
    }

    // 7. If Coupon used, increment usage count
    if (appliedCouponId) {
      await prisma.coupon.update({
        where: { id: appliedCouponId },
        data: { usageCount: { increment: 1 } },
      });
    }

    // 8. If Payment Method is CASHFREE, initiate Cashfree PG Session
    let paymentSessionId: string | undefined;
    let requiresPaymentRedirect = false;

    if (params.paymentMethod === "CASHFREE") {
      const cfRes = await createCashfreeOrder({
        orderId: order.id,
        orderAmount: totalAmount,
        customer: {
          id: userId,
          name: fullName,
          email,
          phone,
        },
      });

      if (cfRes.success && cfRes.paymentSessionId) {
        paymentSessionId = cfRes.paymentSessionId;
        requiresPaymentRedirect = true;

        await prisma.order.update({
          where: { id: order.id },
          data: {
            cashfreeOrderId: order.id,
          },
        });
      } else {
        console.warn("Cashfree order creation fallback:", cfRes.error);
      }
    }

    // 9. Dispatch Temporary Bill Email to Customer with mandatory notice
    sendTemporaryBillEmail({
      email,
      customerName: fullName,
      orderNumber,
      orderId: order.id,
      totalAmount,
      temporaryBillUrl: `/api/orders/${order.id}/temporary-bill`,
    }).catch((err) => console.error("Failed to dispatch temporary bill email:", err));

    return {
      success: true,
      orderId: order.id,
      orderNumber,
      paymentSessionId,
      requiresPaymentRedirect,
      totalAmount,
    };
  } catch (error: unknown) {
    console.error("createOrderAction error:", error);
    const message = error instanceof Error ? error.message : "Failed to place order";
    return { success: false, error: message };
  }
}

/**
 * Fetch a single order by ID
 */
export async function getOrderByIdAction(orderId: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: {
              select: {
                title: true,
                brand: true,
                sku: true,
                hsnCode: true,
                images: { where: { isPrimary: true }, select: { url: true }, take: 1 },
              },
            },
          },
        },
        shippingAddress: true,
        coupon: true,
        user: {
          select: { name: true, email: true, phone: true },
        },
      },
    });

    if (!order) return { success: false, order: null, error: "Order not found." };
    return { success: true, order };
  } catch (error: unknown) {
    console.error("getOrderByIdAction error:", error);
    return { success: false, order: null, error: "Failed to load order." };
  }
}

/**
 * Fetch all orders for current authenticated user
 */
export async function getUserOrdersAction() {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return { success: false, orders: [], error: "Authentication required." };
    }

    const orders = await prisma.order.findMany({
      where: { userId: session.userId },
      include: {
        items: {
          include: {
            product: {
              select: { title: true, brand: true, sku: true },
            },
          },
        },
        shippingAddress: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, orders };
  } catch (error: unknown) {
    console.error("getUserOrdersAction error:", error);
    return { success: false, orders: [], error: "Failed to fetch orders." };
  }
}
