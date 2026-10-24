import crypto from "crypto";

export interface CashfreeOrderParams {
  orderId: string;
  orderAmount: number;
  orderCurrency?: string;
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  returnUrl?: string;
  notifyUrl?: string;
}

export interface CashfreeOrderResponse {
  success: boolean;
  paymentSessionId?: string;
  orderId?: string;
  error?: string;
}

function getCashfreeConfig() {
  const appId = process.env.CASHFREE_APP_ID?.trim();
  const secretKey = process.env.CASHFREE_SECRET_KEY?.trim();
  const env = (process.env.CASHFREE_ENV || "TEST").toUpperCase(); // TEST or PROD
  const baseUrl = env === "PROD" 
    ? "https://api.cashfree.com/pg" 
    : "https://sandbox.cashfree.com/pg";

  return { appId, secretKey, env, baseUrl };
}

/**
 * Creates a payment order session via Cashfree PG REST API (v2023-08-01)
 */
export async function createCashfreeOrder(params: CashfreeOrderParams): Promise<CashfreeOrderResponse> {
  const { appId, secretKey, baseUrl, env } = getCashfreeConfig();

  // If credentials are not yet configured in .env, run in simulation mode
  if (!appId || !secretKey) {
    console.log(`[CASHFREE SIMULATION (${env})] Order created: ${params.orderId} for ₹${params.orderAmount}`);
    return {
      success: true,
      paymentSessionId: `session_sim_${Date.now()}_${params.orderId}`,
      orderId: params.orderId,
    };
  }

  try {
    const payload = {
      order_id: params.orderId,
      order_amount: Math.round(params.orderAmount * 100) / 100,
      order_currency: params.orderCurrency || "INR",
      customer_details: {
        customer_id: params.customer.id,
        customer_name: params.customer.name || "KSTC Customer",
        customer_email: params.customer.email,
        customer_phone: params.customer.phone.replace(/\D/g, "").slice(-10),
      },
      order_meta: {
        return_url: params.returnUrl || `${process.env.NEXT_PUBLIC_SITE_URL || "https://store-kstco.vercel.app"}/order-success?order_id=${params.orderId}`,
        notify_url: params.notifyUrl || `${process.env.NEXT_PUBLIC_SITE_URL || "https://store-kstco.vercel.app"}/api/webhooks/cashfree`,
      },
    };

    const response = await fetch(`${baseUrl}/orders`, {
      method: "POST",
      headers: {
        "x-client-id": appId,
        "x-client-secret": secretKey,
        "x-api-version": "2023-08-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Cashfree API error:", data);
      return {
        success: false,
        error: data.message || "Failed to create Cashfree payment order.",
      };
    }

    return {
      success: true,
      paymentSessionId: data.payment_session_id,
      orderId: data.order_id,
    };
  } catch (error: unknown) {
    console.error("Cashfree order creation exception:", error);
    const message = error instanceof Error ? error.message : "Network error contacting payment gateway";
    return { success: false, error: message };
  }
}

/**
 * Verifies Cashfree Webhook Signature (HMAC-SHA256)
 */
export function verifyCashfreeWebhookSignature(
  rawBody: string,
  timestamp: string,
  receivedSignature: string
): boolean {
  const { secretKey } = getCashfreeConfig();
  if (!secretKey) return true; // Allow in local dev when unconfigured

  try {
    const signatureData = `${timestamp}${rawBody}`;
    const expectedSignature = crypto
      .createHmac("sha256", secretKey)
      .update(signatureData)
      .digest("base64");

    return crypto.timingSafeEqual(
      Buffer.from(receivedSignature),
      Buffer.from(expectedSignature)
    );
  } catch {
    return false;
  }
}
