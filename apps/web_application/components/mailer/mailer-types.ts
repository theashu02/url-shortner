export type MailProviderId = "gmail" | "outlook" | "smtp";

export type MailConnectionStatus =
  | "disconnected"
  | "connecting"
  | "connected"
  | "error";

export interface MailProviderConnection {
  provider: MailProviderId;
  status: MailConnectionStatus;
  /** Connected mailbox address, when known. */
  email: string | null;
  connectedAt: string | null;
  error: string | null;
}

export interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  username: string;
  /** Display-only sender identity; password is never stored in redux. */
  fromName: string;
  fromEmail: string;
}

export interface SmtpFormValues extends Omit<SmtpConfig, "port"> {
  port: string;
  password: string;
}

export const MAIL_PROVIDERS: { id: MailProviderId; label: string }[] = [
  { id: "gmail", label: "Gmail" },
  { id: "outlook", label: "Outlook" },
  { id: "smtp", label: "SMTP" },
];

export const DEFAULT_SMTP_CONFIG: SmtpConfig = {
  host: "",
  port: 587,
  secure: true,
  username: "",
  fromName: "",
  fromEmail: "",
};

export function validateSmtpForm(values: SmtpFormValues): Partial<Record<keyof SmtpFormValues, string>> {
  const errors: Partial<Record<keyof SmtpFormValues, string>> = {};
  if (!values.host.trim()) errors.host = "SMTP host is required.";
  const port = Number(values.port);
  if (!values.port.trim() || !Number.isInteger(port) || port < 1 || port > 65535) {
    errors.port = "Enter a valid port (1-65535).";
  }
  if (!values.username.trim()) errors.username = "Username is required.";
  if (!values.password) errors.password = "Password / app password is required.";
  if (!values.fromEmail.trim()) {
    errors.fromEmail = "Sender email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.fromEmail.trim())) {
    errors.fromEmail = "Enter a valid sender email.";
  }
  return errors;
}
