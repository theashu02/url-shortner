import { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/server/db/mongoose";
import { UserModel } from "@/server/models/user";

const getEnv = (key: string) => {
  const v = process.env[key];
  if (!v) throw new Error(`Missing env var: ${key}`);
  return v;
};

export const authOptions: NextAuthOptions = {
  secret: getEnv("NEXTAUTH_SECRET"),

  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 1 day
    updateAge: 6 * 60 * 60, // refresh token every 6 hours
  },

  pages: {
    signIn: "/auth",
    error: "/auth",
  },

  providers: [
    GoogleProvider({
      clientId: getEnv("GOOGLE_CLIENT_ID"),
      clientSecret: getEnv("GOOGLE_CLIENT_SECRET"),
    }),

    CredentialsProvider({
      id: "email-password",
      name: "Email & Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        name: { label: "Name", type: "text" }, // only used during registration
        isRegister: { label: "Is Register", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        await connectToDatabase();

        // ── REGISTRATION path ──
        if (credentials.isRegister === "true") {
          const exists = await UserModel.findOne({ email: credentials.email });
          if (exists) throw new Error("EMAIL_TAKEN");

          if (credentials.password.length < 8) throw new Error("PASSWORD_TOO_SHORT");

          const hash = await bcrypt.hash(credentials.password, 12);
          const user = await UserModel.create({
            name: credentials.name || "User",
            email: credentials.email,
            passwordHash: hash,
            provider: "credentials",
            emailVerified: false,
            loginCount: 1,
            lastLoginAt: new Date(),
          });

          return { id: user._id.toString(), name: user.name, email: user.email, image: user.image };
        }

        // ── SIGN IN path ──
        const user = await UserModel.findOne({ email: credentials.email }).select("+passwordHash");
        if (!user) throw new Error("INVALID_CREDENTIALS");

        if (user.provider !== "credentials") throw new Error("USE_PROVIDER:" + user.provider);

        if (user.isBlocked) throw new Error("ACCOUNT_BLOCKED");

        const valid = await bcrypt.compare(credentials.password, user.passwordHash as string);
        if (!valid) throw new Error("INVALID_CREDENTIALS");

        user.lastLoginAt = new Date();
        user.loginCount = (user.loginCount ?? 0) + 1;
        await user.save();

        return { id: user._id.toString(), name: user.name, email: user.email, image: user.image };
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "email-password" || account?.provider === "metamask") {
        return true;
      }

      if (!user.email) return false;

      try {
        await connectToDatabase();
        const existing = await UserModel.findOne({ email: user.email });

        if (!existing) {
          await UserModel.create({
            name: user.name,
            email: user.email,
            image: user.image,
            provider: "google",
            providerAccountId: account?.providerAccountId,
            emailVerified: true,
            lastLoginAt: new Date(),
            loginCount: 1,
          });
        } else {
          if (existing.provider !== "google") return false;
          if (existing.isBlocked) return false;

          existing.name = user.name ?? existing.name;
          existing.image = user.image ?? existing.image;
          existing.lastLoginAt = new Date();
          existing.loginCount = (existing.loginCount ?? 0) + 1;
          await existing.save();
        }

        return true;
      } catch (err) {
        console.error("Google signIn callback error:", err);
        return false;
      }
    },

    async jwt({ token, user }) {
      // Only enrich token from DB on initial sign-in (when `user` is present)
      if (user) {
        await connectToDatabase();
        const dbUser = await UserModel.findOne({ email: user.email });
        if (dbUser) {
          token.id = dbUser._id.toString();
          token.name = dbUser.name ?? token.name;
          token.picture = dbUser.image ?? token.picture;
        } else {
          token.id = user.id;
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name ?? session.user.name;
        session.user.image = token.picture ?? session.user.image;
      }
      return session;
    },
  },
};
