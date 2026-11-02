import { decode } from "next-auth/jwt";

export async function getAuthUserId(request: Request): Promise<string | null> {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const cookies = cookieHeader.split(";").map((c) => c.trim());

  const sessionToken = cookies
    .find(
      (c) =>
        c.startsWith("next-auth.session-token=") ||
        c.startsWith("__Secure-next-auth.session-token=")
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
