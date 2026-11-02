import { verifySmtp, sendTestMail as legacySendTestMail } from "@/server/lib/mailer/mailSend";
import type { MailProvider } from "@/server/models/mailConnection";
import type { SmtpSettings } from "./mail.types";

/**
 * ISP: mail-transport seam. Nodemailer/Gmail/Graph today (OCP: add providers
 * without touching MailService). LSP: a different implementation is substitutable.
 */
export interface IMailSender {
  verifySmtp(settings: SmtpSettings): Promise<void>;
  sendTestMail(userId: string, provider: MailProvider, email: string): Promise<void>;
}

export class NodemailerMailSender implements IMailSender {
  verifySmtp(settings: SmtpSettings): Promise<void> {
    return verifySmtp(settings);
  }
  sendTestMail(userId: string, provider: MailProvider, email: string): Promise<void> {
    return legacySendTestMail(userId, provider, email);
  }
}

