import nodemailer from "nodemailer";
import { connectToDatabase } from "@/server/db/mongoose";
import { MailConnectionModel, type MailProvider } from "@/server/models/mailConnection";
import { decryptSecret, encryptSecret } from "./crypto";
import { refreshAccessToken, type OAuthProvider } from "./oauth";

function toBase64Url(raw: string): string {
  return Buffer.from(raw, "utf8").toString("base64url");
}

/** Returns a valid OAuth access token, refreshing it in DB when expired. */
export async function getValidAccessToken(
  userId: string,
  provider: OAuthProvider,
  email: string
): Promise<string> {
  await connectToDatabase();
  const conn = await MailConnectionModel.findOne({ userId, provider, email });
  if (!conn?.oauth?.accessTokenEnc) throw new Error("Mailbox is not connected.");

  const skewMs = 60 * 1000;
  const expired = !conn.oauth.expiresAt || conn.oauth.expiresAt.getTime() - skewMs < Date.now();
  if (!expired) return decryptSecret(conn.oauth.accessTokenEnc);

  if (!conn.oauth.refreshTokenEnc) throw new Error("Stored session expired. Reconnect the mailbox.");
  const tokens = await refreshAccessToken(provider, decryptSecret(conn.oauth.refreshTokenEnc));
  conn.oauth.accessTokenEnc = encryptSecret(tokens.accessToken);
  if (tokens.refreshToken) conn.oauth.refreshTokenEnc = encryptSecret(tokens.refreshToken);
  conn.oauth.expiresAt = new Date(Date.now() + tokens.expiresIn * 1000);
  conn.status = "connected";
  conn.lastError = undefined;
  await conn.save();
  return tokens.accessToken;
}

async function sendViaGmail(accessToken: string, to: string, subject: string, text: string) {
  const raw = toBase64Url(
    `To: ${to}\r\nSubject: ${subject}\r\nContent-Type: text/plain; charset="UTF-8"\r\n\r\n${text}`
  );
  const res = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({ raw }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Gmail send failed (${res.status}). ${body.slice(0, 200)}`);
  }
}

async function sendViaOutlook(accessToken: string, to: string, subject: string, text: string) {
  const res = await fetch("https://graph.microsoft.com/v1.0/me/sendMail", {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      message: {
        subject,
        body: { contentType: "Text", content: text },
        toRecipients: [{ emailAddress: { address: to } }],
      },
      saveToSentItems: true,
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Outlook send failed (${res.status}). ${body.slice(0, 200)}`);
  }
}

export interface SmtpSettings {
  host: string;
  port: number;
  secure: boolean;
  username: string;
  password: string;
  fromName: string;
  fromEmail: string;
}

export async function verifySmtp(settings: SmtpSettings): Promise<void> {
  const transporter = nodemailer.createTransport({
    host: settings.host,
    port: settings.port,
    secure: settings.secure,
    auth: { user: settings.username, pass: settings.password },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
  });
  try {
    await transporter.verify();
  } finally {
    transporter.close();
  }
}

export async function sendViaSmtp(settings: SmtpSettings, to: string, subject: string, text: string) {
  const transporter = nodemailer.createTransport({
    host: settings.host,
    port: settings.port,
    secure: settings.secure,
    auth: { user: settings.username, pass: settings.password },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
  });
  try {
    await transporter.sendMail({
      from: settings.fromName ? `"${settings.fromName}" <${settings.fromEmail}>` : settings.fromEmail,
      to,
      subject,
      text,
    });
  } finally {
    transporter.close();
  }
}

/** Sends a test mail to the connected mailbox itself. Proves the saved connection can send. */
export async function sendTestMail(userId: string, provider: MailProvider, email: string) {
  await connectToDatabase();
  const conn = await MailConnectionModel.findOne({ userId, provider, email }).select(
    "+smtp.passwordEnc"
  );
  if (!conn) throw new Error("Mailbox is not connected.");

  const subject = "Mailer test mail";
  const text = "This is a test mail from your connected mailbox. Sending works.";

  if (provider === "gmail" || provider === "outlook") {
    const token = await getValidAccessToken(userId, provider, email);
    if (provider === "gmail") await sendViaGmail(token, email, subject, text);
    else await sendViaOutlook(token, email, subject, text);
  } else {
    if (!conn.smtp?.passwordEnc) throw new Error("SMTP credentials missing. Reconnect SMTP.");
    await sendViaSmtp(
      {
        host: conn.smtp.host as string,
        port: conn.smtp.port as number,
        secure: conn.smtp.secure ?? true,
        username: conn.smtp.username as string,
        password: decryptSecret(conn.smtp.passwordEnc),
        fromName: (conn.smtp.fromName as string) ?? "",
        fromEmail: (conn.smtp.fromEmail as string) ?? email,
      },
      email,
      subject,
      text
    );
  }

  conn.status = "connected";
  conn.lastError = undefined;
  conn.lastVerifiedAt = new Date();
  await conn.save();
}
