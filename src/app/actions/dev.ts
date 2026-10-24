"use server";

import prisma from "@/lib/db";
import { getSession, isSuperAdmin } from "@/lib/session";

export interface SystemMetrics {
  status: "HEALTHY" | "DEGRADED" | "DOWN";
  dbLatencyMs: number;
  environment: string;
  nodeVersion: string;
  integrations: {
    cashfreeConfigured: boolean;
    cashfreeEnv: string;
    smtpConfigured: boolean;
    databaseConnected: boolean;
  };
  tableCounts: {
    users: number;
    dealers: number;
    plumbers: number;
    contractors: number;
    products: number;
    orders: number;
    quotes: number;
    coupons: number;
  };
}

/**
 * Diagnostic action for Tech Team / Developer Dashboard
 */
export async function getSystemMetricsAction(): Promise<{
  success: boolean;
  metrics?: SystemMetrics;
  error?: string;
}> {
  try {
    const session = await getSession();
    if (!session || !isSuperAdmin(session.role)) {
      return { success: false, error: "Unauthorized access: Developer credentials required." };
    }

    const start = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const dbLatencyMs = Date.now() - start;

    const [
      users,
      dealers,
      plumbers,
      contractors,
      products,
      orders,
      quotes,
      coupons,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: { in: ["AUTHORIZED_DEALER", "TRADE"] } } }),
      prisma.plumberProfile.count(),
      prisma.user.count({ where: { role: "CONTRACTOR" } }),
      prisma.product.count(),
      prisma.order.count(),
      prisma.quote.count(),
      prisma.coupon.count(),
    ]);

    const cashfreeAppId = process.env.CASHFREE_APP_ID?.trim();
    const cashfreeSecret = process.env.CASHFREE_SECRET_KEY?.trim();
    const smtpHost = process.env.SMTP_HOST?.trim();
    const smtpUser = process.env.SMTP_USER?.trim();

    return {
      success: true,
      metrics: {
        status: dbLatencyMs < 500 ? "HEALTHY" : "DEGRADED",
        dbLatencyMs,
        environment: process.env.NODE_ENV || "development",
        nodeVersion: process.version,
        integrations: {
          cashfreeConfigured: !!(cashfreeAppId && cashfreeSecret),
          cashfreeEnv: process.env.CASHFREE_ENV || "TEST",
          smtpConfigured: !!(smtpHost && smtpUser),
          databaseConnected: true,
        },
        tableCounts: {
          users,
          dealers,
          plumbers,
          contractors,
          products,
          orders,
          quotes,
          coupons,
        },
      },
    };
  } catch (error: unknown) {
    console.error("getSystemMetricsAction error:", error);
    const message = error instanceof Error ? error.message : "System check failed";
    return { success: false, error: message };
  }
}
