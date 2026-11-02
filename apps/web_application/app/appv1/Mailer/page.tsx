import { MailerConnectPage } from "@/components/mailer";

export const metadata = {
  title: "Mailer - Connect your mailbox",
  description: "Connect Gmail, Outlook, or any SMTP server to send personalized mails.",
};

export default function MailerPage() {
  return <MailerConnectPage />;
}
