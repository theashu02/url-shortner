import { api } from "@/lib/eden";
import type { MailProviderId, SmtpConfig, SmtpFormValues } from "./mailer-types";

export interface MailConnectionSummary {
  id: string;
  provider: MailProviderId;
  email: string;
  status: string;
  connectedAt: string | null;
  lastVerifiedAt: string | null;
  smtp: SmtpConfig | null;
}

function extractErrorMessage(res: unknown): string {
  if (res && typeof res === "object" && "error" in res && (res as { error?: { value?: unknown } }).error) {
    const errVal = (res as { error?: { value?: unknown } }).error?.value;
    if (errVal && typeof errVal === "object" && "message" in errVal) {
      return String(errVal.message);
    }
  }
  return "An error occurred";
}

function toSummary(raw: {
  id: string;
  provider: string;
  email: string;
  status: string;
  connectedAt: string | null;
  lastVerifiedAt: string | null;
  smtp: SmtpConfig | null;
}): MailConnectionSummary {
  return { ...raw, provider: raw.provider as MailProviderId };
}

/** Start OAuth by asking the server for the provider consent URL. */
export async function fetchStartUrl(
  provider: Exclude<MailProviderId, "smtp">
): Promise<string> {
  const res = await api.mailer({ provider }).start.get();
  if (res.error) throw new Error(extractErrorMessage(res));
  if (res.data && "url" in res.data && typeof res.data.url === "string") {
    return res.data.url;
  }
  throw new Error(extractErrorMessage(res));
}

/** List saved connections (secrets never leave the server). */
export async function fetchConnections(): Promise<MailConnectionSummary[]> {
  const res = await api.mail.connections.get();
  if (res.error) throw new Error(extractErrorMessage(res));
  if (res.data && "connections" in res.data && Array.isArray(res.data.connections)) {
    return res.data.connections.map(toSummary);
  }
  throw new Error(extractErrorMessage(res));
}

/** Verify SMTP credentials; the server encrypts and saves on success. */
export async function verifySmtp(values: SmtpFormValues): Promise<MailConnectionSummary> {
  const res = await api.mail.smtp.verify.post({
    host: values.host.trim(),
    port: Number(values.port),
    secure: values.secure,
    username: values.username.trim(),
    password: values.password,
    fromName: values.fromName.trim(),
    fromEmail: values.fromEmail.trim(),
  });
  if (res.error) throw new Error(extractErrorMessage(res));
  if (res.data && "connection" in res.data && res.data.connection) {
    return toSummary(res.data.connection);
  }
  throw new Error(extractErrorMessage(res));
}

/** Revoke (best-effort) and delete a saved connection. */
export async function disconnectMailbox(
  provider: MailProviderId,
  email: string
): Promise<void> {
  const res = await api.mail.connections({ provider })({ email }).delete();
  if (res.error) throw new Error(extractErrorMessage(res));
}

/** Send a test mail from a saved connection to its own mailbox. */
export async function sendTestMail(
  provider: MailProviderId,
  email: string
): Promise<string> {
  const res = await api.mail.connections.test.post({ provider, email });
  if (res.error) throw new Error(extractErrorMessage(res));
  return res.data?.message ?? "Test mail sent.";
}

