import { Suspense } from "react";
import { MailerConnectPage } from "@/components/mailer";

export const metadata = {
  title: "Mailer - Connect your mailbox",
  description: "Connect Gmail, Outlook, or any SMTP server to send personalized mails.",
};

export default function MailerPage() {
  return (
    <Suspense
      fallback={
        <div aria-busy="true" className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-6">
          <div className="w-full mx-auto space-y-6 animate-pulse">
            <div className="h-8 w-56 bg-muted" />
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="h-24 bg-muted" />
              <div className="h-24 bg-muted" />
              <div className="h-24 bg-muted" />
            </div>
          </div>
        </div>
      }
    >
      <MailerConnectPage />
    </Suspense>
  );
}
