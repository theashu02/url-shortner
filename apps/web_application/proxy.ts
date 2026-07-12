import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const PROTECTED_ROUTES = ["/dashboard"];
const AUTH_ROUTES = ["/auth"];

export async function proxy(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  const isProtected = PROTECTED_ROUTES.some((r) => pathname.startsWith(r));
  const isAuthRoute = AUTH_ROUTES.some((r) => pathname.startsWith(r));

  // Unauthenticated user trying to access a protected route → redirect to /auth
  if (isProtected && !token) {
    return NextResponse.redirect(new URL("/auth", req.url));
  }

  // Authenticated user trying to access auth page → redirect to /dashboard
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/auth/:path*"],
};
