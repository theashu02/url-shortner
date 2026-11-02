import type { MailProvider } from "@/server/models/mailConnection";

export type { MailProvider };

export interface MailConnectionSummary {
  id: string;
  provider: string;
  email: string;
  status: string;
  connectedAt: string | null;
  lastVerifiedAt: string | null;
  smtp: {
    host: string;
    port: number;
    secure: boolean;
    username: string;
    fromName: string;
    fromEmail: string;
  } | null;
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

export type OAuthProvider = Exclude<MailProvider, "smtp">;

export type ServiceError = { status: number; message: string };

export function isOAuthProvider(p: string): p is OAuthProvider {
  return p === "gmail" || p === "outlook";
}
