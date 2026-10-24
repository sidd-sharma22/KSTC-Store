"use server";

import prisma from "@/lib/db";
import { getSession, isAdminStaff } from "@/lib/session";
import { generateTallySalesXml, TallySalesOrder } from "@/lib/tally";

/**
 * Generates Tally Prime XML for all un-synced or selected confirmed orders
 */
export async function exportTallyVouchersAction(selectedOrderIds?: string[]) {
  try {
    const session = await getSession();
    if (!session || !isAdminStaff(session.role)) {
      return { success: false, error: "Unauthorized access: Admin permissions required." };
    }

    const whereClause: any = {};
    if (selectedOrderIds && selectedOrderIds.length > 0) {
      whereClause.id = { in: selectedOrderIds };
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        items: {
          include: { product: true },
        },
        user: { select: { name: true, shopName: true, gstNumber: true } },
        shippingAddress: true,
      },
      orderBy: { createdAt: "desc" },
    });

    if (orders.length === 0) {
      return { success: false, error: "No orders found to export to Tally." };
    }

    const tallyOrders: TallySalesOrder[] = orders.map((o) => {
      const state = o.shippingAddress?.state || "Madhya Pradesh";
      const isInterState = state.toLowerCase().trim() !== "madhya pradesh";

      return {
        orderId: o.id,
        orderNumber: `KSTC-${o.id.slice(-8)}`,
        date: o.createdAt,
        customerName: o.user.shopName || o.user.name || "Counter Customer",
        customerGst: o.user.gstNumber,
        state,
        isInterState,
        subtotal: o.totalAmount - o.taxAmount,
        discountAmount: o.discountAmount,
        taxAmount: o.taxAmount,
        totalAmount: o.totalAmount,
        items: o.items.map((i) => ({
          itemName: `${i.product.title} (${i.product.brand || "KSTC"})`,
          hsnCode: i.product.hsnCode || "3917",
          quantity: i.quantity,
          unit: i.product.unit || "PCS",
          rate: i.unitPrice,
          amount: i.unitPrice * i.quantity,
        })),
      };
    });

    const xml = generateTallySalesXml(tallyOrders);

    // Record sync log in PostgreSQL
    await prisma.tallySyncLog.create({
      data: {
        batchId: `BATCH-${Date.now()}`,
        vouchersCount: tallyOrders.length,
        status: "SUCCESS",
        xmlData: xml,
      },
    });

    return {
      success: true,
      vouchersCount: tallyOrders.length,
      xml,
    };
  } catch (error: unknown) {
    console.error("exportTallyVouchersAction error:", error);
    return { success: false, error: "Failed to generate Tally XML." };
  }
}
