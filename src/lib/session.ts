import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export interface SessionPayload {
  userId: string;
  email: string;
  name?: string | null;
  role: "RETAIL" | "TRADE" | "ADMIN";
  tradeStatus?: "PENDING" | "APPROVED" | "REJECTED" | null;
  shopName?: string | null;
}

const SESSION_COOKIE_NAME = "kstc_session";
const SESSION_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days

function getSecretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET || "kstc-super-secret-internal-jwt-key-2026-auth";
  return new TextEncoder().encode(secret);
}

/**
 * Creates and signs an encrypted JWT session cookie for the authenticated user.
 */
export async function createSession(payload: SessionPayload): Promise<void> {
  const expiresAt = new Date(Date.now() + SESSION_DURATION);
  const secret = getSecretKey();

  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

/**
 * Retrieves and validates the current user's session from the request cookies.
 */
export async function getSession(): Promise<SessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!token) return null;

    const secret = getSecretKey();
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ["HS256"],
    });

    return {
      userId: payload.userId as string,
      email: payload.email as string,
      name: (payload.name as string) || null,
      role: (payload.role as "RETAIL" | "TRADE" | "ADMIN") || "RETAIL",
      tradeStatus: (payload.tradeStatus as any) || null,
      shopName: (payload.shopName as string) || null,
    };
  } catch (error) {
    return null;
  }
}

/**
 * Clears the session cookie on user logout.
 */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
