"use server";

import prisma from "@/lib/db";
import { getSession, isAuthorizedDealer } from "@/lib/session";

/**
 * Fetch Dealer Store Dashboard data, wholesale catalog, and credit balance
 */
export async function getDealerDashboardAction() {
  try {
    const session = await getSession();
    if (!session || !isAuthorizedDealer(session.role)) {
      return { success: false, error: "Authorized Dealer access required." };
    }

    const [user, wholesaleProducts, recentOrders] = await Promise.all([
      prisma.user.findUnique({
        where: { id: session.userId },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          shopName: true,
          gstNumber: true,
          tradeStatus: true,
          creditLimit: true,
          usedCredit: true,
        },
      }),
      prisma.product.findMany({
        where: { isActive: true },
        select: {
          id: true,
          sku: true,
          title: true,
          brand: true,
          basePrice: true,
          dealerPrice: true,
          stockCount: true,
          unit: true,
          category: { select: { name: true } },
        },
        orderBy: { title: "asc" },
      }),
      prisma.order.findMany({
        where: { userId: session.userId },
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          items: {
            include: { product: { select: { title: true, brand: true } } },
          },
        },
      }),
    ]);

    if (!user) return { success: false, error: "Dealer account not found." };

    const creditLimit = user.creditLimit || 0;
    const usedCredit = user.usedCredit || 0;
    const availableCredit = Math.max(0, creditLimit - usedCredit);

    return {
      success: true,
      data: {
        dealer: {
          ...user,
          availableCredit,
        },
        wholesaleProducts,
        recentOrders,
      },
    };
  } catch (error: unknown) {
    console.error("getDealerDashboardAction error:", error);
    return { success: false, error: "Failed to load dealer portal." };
  }
}
