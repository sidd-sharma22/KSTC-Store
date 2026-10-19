import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE_NAME = "kstc_session";

function getSecretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET?.trim().replace(/[\r\n]/g, "");
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("AUTH_SECRET environment variable must be set in production.");
    }
    return new TextEncoder().encode("kstc-dev-fallback-insecure-secret-key-change-in-env");
  }
  return new TextEncoder().encode(secret);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  let isAuthenticated = false;
  let userRole: string | null = null;

  if (token) {
    try {
      const secret = getSecretKey();
      const { payload } = await jwtVerify(token, secret, {
        algorithms: ["HS256"],
      });
      if (payload?.userId) {
        isAuthenticated = true;
        userRole = (payload.role as string) || "RETAIL";
      }
    } catch {
      isAuthenticated = false;
    }
  }

  // Protected routes for authenticated users only
  const isProtectedPath =
    pathname.startsWith("/account") ||
    pathname.startsWith("/orders") ||
    pathname.startsWith("/trade-portal");

  // Admin routes
  const isAdminPath = pathname.startsWith("/admin");

  // If user is accessing login page while already authenticated -> redirect to home
  if (pathname === "/login" && isAuthenticated) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // If user is accessing protected routes without session -> redirect to login
  if (isProtectedPath && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If user is accessing admin routes without admin role -> redirect to home
  if (isAdminPath && userRole !== "ADMIN") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/account/:path*", "/orders/:path*", "/trade-portal/:path*", "/admin/:path*", "/login"],
};
