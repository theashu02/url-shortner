import { decode } from "next-auth/jwt";

/**
 * DIP: controllers/services depend on this interface, not on next-auth.
 * OCP: add new strategies (e.g. BearerAuthService) without touching callers.
 */
export interface IAuthService {
  getUserId(request: Request): Promise<string | null>;
}

/** Existing cookie-session logic moved verbatim into a class (SRP). */
export class NextAuthService implements IAuthService {
  async getUserId(request: Request): Promise<string | null> {
    const cookieHeader = request.headers.get("cookie") ?? "";
    const cookies = cookieHeader.split(";").map((c) => c.trim());

    const sessionToken = cookies
      .find(
        (c) =>
          c.startsWith("next-auth.session-token=") ||
          c.startsWith("__Secure-next-auth.session-token="),
      )
      ?.split("=")[1];

    if (!sessionToken) return null;
    const secret = process.env.NEXTAUTH_SECRET;
    if (!secret) return null;

    try {
      const token = await decode({ token: sessionToken, secret });
      return (token?.id as string) || (token?.sub as string) || null;
    } catch {
      return null;
    }
  }
}
