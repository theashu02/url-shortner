import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { getRequestBaseUrl } from "@/lib/constant";

const PROTECTED_ROUTES = ["/appv1/dashboard"];
const AUTH_ROUTES = ["/auth"];

export async function proxy(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  const isProtected = PROTECTED_ROUTES.some((r) => pathname.startsWith(r));
  const isAuthRoute = AUTH_ROUTES.some((r) => pathname.startsWith(r));

  // Unauthenticated user trying to access a protected route → redirect to /auth
  if (isProtected && !token) {
    const baseUrl = getRequestBaseUrl(req.headers, req.nextUrl.origin);
    return NextResponse.redirect(new URL("/auth", baseUrl));
  }

  // Authenticated user trying to access auth page → redirect to /appv1/dashboard
  if (isAuthRoute && token) {
    return NextResponse.redirect(
      new URL(
        "/appv1/dashboard",
        getRequestBaseUrl(req.headers, req.nextUrl.origin),
      ),
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/appv1/dashboard/:path*", "/auth/:path*"],
};
