import { getBaseUrl, getRequestBaseUrl as getRequestBase, getProviderConfig, buildAuthUrl, exchangeCode, fetchAccountEmail, revokeProviderToken, signState, verifyState, getRedirectUri } from "@/server/lib/mailer/oauth";
import { HttpError } from "@/server/core/http-errors";
import { toIsoStringOrNull } from "@/server/lib/date";
import type { IMailRepository, LeanMailConnection } from "./mail.repository";
import type { ISecretCipher } from "./mail-cipher";
import type { IMailSender } from "./mail-sender";
import { isOAuthProvider, type MailConnectionSummary, type MailProvider, type OAuthProvider, type SmtpSettings } from "./mail.types";

/** SRP: mailbox-connection orchestration. Transports/cipher behind interfaces (DIP). */
export class MailService {
  constructor(
    private readonly mailboxes: IMailRepository,
    private readonly cipher: ISecretCipher,
    private readonly sender: IMailSender,
  ) {}

  toSummary(c: LeanMailConnection): MailConnectionSummary {
    return {
      id: c._id.toString(),
      provider: c.provider,
      email: c.email,
      status: c.status,
      connectedAt: toIsoStringOrNull(c.connectedAt),
      lastVerifiedAt: toIsoStringOrNull(c.lastVerifiedAt),
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

  listSummaries(userId: string): Promise<MailConnectionSummary[]> {
    return this.mailboxes.listForUser(userId).then((list) => list.map((c) => this.toSummary(c)));
  }

  beginOAuth(provider: string, userId: string, request: Request): string {
    if (!isOAuthProvider(provider)) throw new HttpError(400, "Unknown provider. Use gmail or outlook.");
    getProviderConfig(provider);
    const base = getRequestBase(request);
    return buildAuthUrl(provider, signState(userId), base);
  }

  mailerPage(params: Record<string, string>, base?: string): string {
    return `${base ?? getBaseUrl()}/appv1/Mailer?${new URLSearchParams(params).toString()}`;
  }

  requestBase(request: Request): string {
    return getRequestBase(request);
  }

  redirectUri(provider: OAuthProvider, base?: string): string {
    return getRedirectUri(provider, base);
  }

  /** Full callback flow bound to the request origin (redirect URIs are allowlisted). */
  async handleOAuthCallbackWithBase(
    provider: string,
    request: Request,
    query: { code?: unknown; state?: unknown; error?: unknown; error_description?: unknown },
  ): Promise<Response> {
    const base = getRequestBase(request);
    if (!isOAuthProvider(provider)) {
      return Response.redirect(this.mailerPage({ mail_error: "Unknown provider." }, base), 302);
    }
    try {
      if (query.error) {
        throw new Error(query.error_description ? String(query.error_description) : "Authorization was denied.");
      }
      if (!query.code || !query.state) throw new Error("Missing code or state.");
      const state = verifyState(String(query.state));
      const tokens = await exchangeCode(provider, String(query.code), base);
      const email = await fetchAccountEmail(provider, tokens.accessToken);
      if (state.userId && state.userId.length > 0) {
        await this.mailboxes.upsertOAuth({
          userId: state.userId,
          provider,
          email,
          accessTokenEnc: this.cipher.encrypt(tokens.accessToken),
          refreshTokenEnc: tokens.refreshToken ? this.cipher.encrypt(tokens.refreshToken) : undefined,
          expiresAt: new Date(Date.now() + tokens.expiresIn * 1000),
          scopes: tokens.scopes,
        });
      }
      return Response.redirect(this.mailerPage({ mail_connected: provider, mail_email: email }, base), 302);
    } catch (err) {
      console.error("[mail] oauth callback:", err);
      const message = err instanceof Error ? err.message : "Connection failed.";
      return Response.redirect(this.mailerPage({ mail_error: message.slice(0, 200) }, base), 302);
    }
  }

  async verifySmtpConnection(userId: string, body: SmtpSettings): Promise<MailConnectionSummary> {
    await this.sender.verifySmtp(body);
    const email = body.fromEmail.toLowerCase();
    const saved = await this.mailboxes.upsertSmtp({
      userId,
      email,
      smtp: {
        host: body.host,
        port: body.port,
        secure: body.secure,
        username: body.username,
        passwordEnc: this.cipher.encrypt(body.password),
        fromName: body.fromName ?? "",
        fromEmail: email,
      },
    });
    return this.toSummary(saved);
  }

  async sendTest(userId: string, provider: MailProvider, email: string): Promise<string> {
    await this.sender.sendTestMail(userId, provider, email.toLowerCase());
    return `Test mail sent to ${email}.`;
  }

  async disconnect(userId: string, provider: MailProvider, email: string): Promise<void> {
    const conn = await this.mailboxes.findForUser(userId, provider, email.toLowerCase());
    if (!conn) throw new HttpError(404, "Connection not found.");
    try {
      if ((conn.provider === "gmail" || conn.provider === "outlook") && conn.oauth?.accessTokenEnc) {
        await revokeProviderToken(conn.provider as OAuthProvider, this.cipher.decrypt(conn.oauth.accessTokenEnc));
      }
    } catch {
      // best-effort only
    }
    await conn.deleteOne();
  }
}

