import { Elysia } from "elysia";
import { decode } from "next-auth/jwt";
import { connectToDatabase } from "@/server/db/mongoose";
import { UserModel } from "@/server/models/user";

const SESSION_COOKIE = "next-auth.session-token";

export const userRoute = new Elysia()
  .get("/user/me", async ({ request }) => {
    const cookieHeader = request.headers.get("cookie") ?? "";
    const sessionToken = cookieHeader
      .split(";")
      .map((c) => c.trim())
      .find((c) => c.startsWith(`${SESSION_COOKIE}=`))
      ?.slice(SESSION_COOKIE.length + 1);

    if (!sessionToken) {
      throw new Error("Unauthorized");
    }

    const secret = process.env.NEXTAUTH_SECRET;
    if (!secret) throw new Error("Missing NEXTAUTH_SECRET");

    const token = await decode({ token: sessionToken, secret });

    if (!token?.id) {
      throw new Error("Invalid session");
    }

    await connectToDatabase();
    const user = await UserModel.findById(token.id).lean();

    if (!user) {
      throw new Error("User not found");
    }

    return {
      id: user._id.toString(),
      name: user.name ?? null,
      email: user.email ?? null,
      image: user.image ?? null,
      provider: user.provider,
      emailVerified: user.emailVerified ?? false,
      handle: user.handle ?? null,
      country: user.country ?? null,
      bio: user.bio ?? null,
      loginCount: user.loginCount ?? 0,
      lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
      createdAt: user.createdAt?.toISOString() ?? null,
    };
  });
