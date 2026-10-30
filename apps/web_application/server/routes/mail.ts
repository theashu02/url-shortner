import { Elysia, t } from "elysia";
import { getAuthUserId } from "@/server/lib/auth";
import { connectToDatabase } from "@/server/db/mongoose";
import {
  MailConnectionModel,
  type MailProvider,
} from "@/server/models/mailConnection";
import { decryptSecret, encryptSecret } from "@/server/lib/mailer/crypto";
import {
  buildAuthUrl,
  exchangeCode,
  fetchAccountEmail,
  getBaseUrl,
  getProviderConfig,
  getRequestBaseUrl,
  revokeProviderToken,
  signState,
  verifyState,
  type OAuthProvider,
} from "@/server/lib/mailer/oauth";
import { sendTestMail, verifySmtp } from "@/server/lib/mailer/mailSend";

type LeanConn = {
  _id: { toString(): string };
  provider: string;
  email: string;
  status: string;
  connectedAt?: Date;
  lastVerifiedAt?: Date;
  smtp?: { host?: string; port?: number; secure?: boolean; username?: string; fromName?: string; fromEmail?: string };
};

function toSummary(c: LeanConn) {
  return {
    id: c._id.toString(),
    provider: c.provider,
    email: c.email,
    status: c.status,
    connectedAt: c.connectedAt?.toISOString() ?? null,
    lastVerifiedAt: c.lastVerifiedAt?.toISOString() ?? null,
    smtp:
      c.provider === "smtp"
        ? {
            host: c.smtp?.host ?? "",
            port: c.smtp?.port ?? 587,
            secure: c.smtp?.secure ?? true,
            username: c.smtp?.username ?? "",
            fromName: c.smtp?.fromName ?? "",
            fromEmail: c.smtp?.fromEmail ?? "",
          }
        : null,
  };
}

function isOAuthProvider(p: string): p is OAuthProvider {
  return p === "gmail" || p === "outlook";
}

function mailerPage(params: Record<string, string>, base?: string): string {
  return `${base ?? getBaseUrl()}/appv1/Mailer?${new URLSearchParams(params).toString()}`;
}

export const mailRoute = new Elysia()
  // List my connected mailboxes (secrets never leave the server).
  .get("/mail/connections", async ({ request, set }) => {
    try {
      const userId = await getAuthUserId(request);
      if (!userId) {
        set.status = 401;
        return { message: "Unauthorized. Please log in." };
      }
      await connectToDatabase();
      const list = await MailConnectionModel.find({ userId }).sort({ createdAt: -1 }).lean();
      return { connections: (list as unknown as LeanConn[]).map(toSummary) };
    } catch (err) {
      console.error("[mail] list:", err);
      set.status = 500;
      return { message: "Internal server error" };
    }
  })

  // Begin OAuth: frontend navigates the browser to the returned URL.
  .get("/mailer/:provider/start", async ({ request, params, set }) => {
    try {
      const userId = await getAuthUserId(request);
      if (!userId) {
        set.status = 401;
        return { message: "Unauthorized. Please log in." };
      }
      if (!isOAuthProvider(params.provider)) {
        set.status = 400;
        return { message: "Unknown provider. Use gmail or outlook." };
      }
      getProviderConfig(params.provider); // throws when env keys are missing
      const base = getRequestBaseUrl(request);
      return { url: buildAuthUrl(params.provider, signState(userId), base) };
    } catch (err) {
      console.error("[mail] oauth start:", err);
      set.status = 500;
      return { message: err instanceof Error ? err.message : "Could not start OAuth." };
    }
  })

  // OAuth callback (browser redirect from Google/Microsoft).
  .get("/mailer/:provider/callback", async ({ request, params, query }) => {
    const base = getRequestBaseUrl(request);
    if (!isOAuthProvider(params.provider)) {
      return Response.redirect(mailerPage({ mail_error: "Unknown provider." }, base), 302);
    }
    try {
      if (query.error) {
        throw new Error(
          query.error_description ? String(query.error_description) : "Authorization was denied."
        );
      }
      if (!query.code || !query.state) throw new Error("Missing code or state.");
      const state = verifyState(String(query.state));

      const tokens = await exchangeCode(params.provider, String(query.code), base);
      const email = await fetchAccountEmail(params.provider, tokens.accessToken);

      if (state.userId && state.userId.length > 0) {
        await connectToDatabase();
        await MailConnectionModel.findOneAndUpdate(
          { userId: state.userId, provider: params.provider, email },
          {
            $set: {
              status: "connected",
              oauth: {
                accessTokenEnc: encryptSecret(tokens.accessToken),
                refreshTokenEnc: tokens.refreshToken ? encryptSecret(tokens.refreshToken) : undefined,
                expiresAt: new Date(Date.now() + tokens.expiresIn * 1000),
                scopes: tokens.scopes,
              },
              lastError: undefined,
              connectedAt: new Date(),
              lastVerifiedAt: new Date(),
            },
          },
          { upsert: true, new: true }
        );
      }
      return Response.redirect(
        mailerPage({ mail_connected: params.provider, mail_email: email }, base),
        302
      );
    } catch (err) {
      console.error("[mail] oauth callback:", err);
      const message = err instanceof Error ? err.message : "Connection failed.";
      return Response.redirect(mailerPage({ mail_error: message.slice(0, 200) }, base), 302);
    }
  })

  // Verify SMTP credentials, encrypt and save them.
  .post(
    "/mail/smtp/verify",
    async ({ request, body, set }) => {
      try {
        const userId = await getAuthUserId(request);
        if (!userId) {
          set.status = 401;
          return { message: "Unauthorized. Please log in." };
        }
        await verifySmtp({
          host: body.host,
          port: body.port,
          secure: body.secure,
          username: body.username,
          password: body.password,
          fromName: body.fromName ?? "",
          fromEmail: body.fromEmail,
        });

        await connectToDatabase();
        const email = body.fromEmail.toLowerCase();
        const saved = await MailConnectionModel.findOneAndUpdate(
          { userId, provider: "smtp" as MailProvider, email },
          {
            $set: {
              status: "connected",
              smtp: {
                host: body.host,
                port: body.port,
                secure: body.secure,
                username: body.username,
                passwordEnc: encryptSecret(body.password),
                fromName: body.fromName ?? "",
                fromEmail: email,
              },
              lastError: undefined,
              connectedAt: new Date(),
              lastVerifiedAt: new Date(),
            },
          },
          { upsert: true, new: true }
        ).lean();

        return { connection: toSummary(saved as unknown as LeanConn) };
      } catch (err) {
        console.error("[mail] smtp verify:", err);
        set.status = 400;
        return {
          message:
            err instanceof Error ? `SMTP verification failed. ${err.message}` : "SMTP verification failed.",
        };
      }
    },
    {
      body: t.Object({
        host: t.String({ minLength: 1, maxLength: 255 }),
        port: t.Integer({ minimum: 1, maximum: 65535 }),
        secure: t.Boolean(),
        username: t.String({ minLength: 1, maxLength: 320 }),
        password: t.String({ minLength: 1, maxLength: 1024 }),
        fromName: t.Optional(t.String({ maxLength: 120 })),
        fromEmail: t.String({ format: "email", maxLength: 320 }),
      }),
    }
  )

  // Send a test mail from a saved connection to its own mailbox.
  .post(
    "/mail/connections/test",
    async ({ request, body, set }) => {
      try {
        const userId = await getAuthUserId(request);
        if (!userId) {
          set.status = 401;
          return { message: "Unauthorized. Please log in." };
        }
        await sendTestMail(userId, body.provider, body.email.toLowerCase());
        return { ok: true, message: `Test mail sent to ${body.email}.` };
      } catch (err) {
        console.error("[mail] test send:", err);
        set.status = 400;
        return { message: err instanceof Error ? err.message : "Test mail failed." };
      }
    },
    {
      body: t.Object({
        provider: t.Union([t.Literal("gmail"), t.Literal("outlook"), t.Literal("smtp")]),
        email: t.String({ format: "email", maxLength: 320 }),
      }),
    }
  )

  // Disconnect: revoke provider best-effort, then delete the record.
  .delete(
    "/mail/connections/:provider/:email",
    async ({ request, params, set }) => {
      try {
        const userId = await getAuthUserId(request);
        if (!userId) {
          set.status = 401;
          return { message: "Unauthorized. Please log in." };
        }
        await connectToDatabase();
        const email = params.email.toLowerCase();
        const conn = await MailConnectionModel.findOne({
          userId,
          provider: params.provider,
          email,
        });
        if (!conn) {
          set.status = 404;
          return { message: "Connection not found." };
        }
        try {
          if (
            (conn.provider === "gmail" || conn.provider === "outlook") &&
            conn.oauth?.accessTokenEnc
          ) {
            await revokeProviderToken(
              conn.provider as OAuthProvider,
              decryptSecret(conn.oauth.accessTokenEnc)
            );
          }
        } catch {
          // best-effort only
        }
        await conn.deleteOne();
        return { ok: true };
      } catch (err) {
        console.error("[mail] disconnect:", err);
        set.status = 500;
        return { message: "Internal server error" };
      }
    },
    {
      params: t.Object({
        provider: t.Union([t.Literal("gmail"), t.Literal("outlook"), t.Literal("smtp")]),
        email: t.String({ minLength: 3, maxLength: 320 }),
      }),
    }
  );
