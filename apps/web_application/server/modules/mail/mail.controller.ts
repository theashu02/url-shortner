import { Elysia, t } from "elysia";
import { BaseController } from "@/server/core/controller";
import type { IAuthService } from "@/server/core/auth";
import type { MailService } from "./mail.service";

/** SRP: HTTP adapter for mailbox connections + OAuth callbacks. */
export class MailController extends BaseController {
  constructor(
    auth: IAuthService,
    private readonly mail: MailService,
  ) {
    super(auth);
  }

  register() {
    const app = new Elysia()
      .get("/mail/connections", async ({ request }) => {
        const userId = await this.requireUserId(request);
        const connections = await this.mail.listSummaries(userId);
        return { connections };
      })
      .get("/mailer/:provider/start", async ({ request, params }) => {
        const userId = await this.requireUserId(request);
        const url = this.mail.beginOAuth(params.provider, userId, request);
        return { url };
      })
      .get("/mailer/:provider/callback", async ({ request, params, query }) => {
        return this.mail.handleOAuthCallbackWithBase(params.provider, request, query as Record<string, unknown>);
      })
      .post(
        "/mail/smtp/verify",
        async ({ request, body, set }) => {
          try {
            const userId = await this.requireUserId(request);
            const connection = await this.mail.verifySmtpConnection(userId, {
              host: body.host,
              port: body.port,
              secure: body.secure,
              username: body.username,
              password: body.password,
              fromName: body.fromName ?? "",
              fromEmail: body.fromEmail,
            });
            return { connection };
          } catch (err) {
            console.error("[mail] smtp verify:", err);
            set.status = 400;
            return {
              message: err instanceof Error ? `SMTP verification failed. ${err.message}` : "SMTP verification failed.",
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
        },
      )
      .post(
        "/mail/connections/test",
        async ({ request, body, set }) => {
          try {
            const userId = await this.requireUserId(request);
            const message = await this.mail.sendTest(userId, body.provider, body.email);
            return { ok: true, message };
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
        },
      )
      .delete(
        "/mail/connections/:provider/:email",
        async ({ request, params }) => {
          const userId = await this.requireUserId(request);
          await this.mail.disconnect(userId, params.provider, params.email);
          return { ok: true };
        },
        {
          params: t.Object({
            provider: t.Union([t.Literal("gmail"), t.Literal("outlook"), t.Literal("smtp")]),
            email: t.String({ minLength: 3, maxLength: 320 }),
          }),
        },
      );

    return this.registerErrorHook(app, "mail");
  }
}

