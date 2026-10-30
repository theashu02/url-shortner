"use client";

import { Mail } from "lucide-react";
import { useAppSelector } from "@/store";
import { useAppDispatch } from "@/store";
import {
  beginOAuthConnect,
  disconnectMailbox,
  sendTestMail,
} from "@/store/mailer-connection-slice";
import { MailProviderCard } from "./MailProviderCard";

const STATUS_LABEL: Record<string, string> = {
  connected: "Connected",
  connecting: "Connecting",
  error: "Needs attention",
  disconnected: "Not connected",
};

export function GmailConnectCard() {
  const dispatch = useAppDispatch();
  const conn = useAppSelector((s) => s.mailerConnection.connections.gmail);
  const testingFor = useAppSelector((s) => s.mailerConnection.testingFor);
  const email = conn.email;

  return (
    <MailProviderCard
      icon={<Mail className="h-5 w-5" aria-hidden="true" />}
      title="Gmail"
      description="Connect with Google Mail APIs (OAuth 2.0). Best for Google Workspace and personal Gmail senders."
      status={conn.status}
      statusLabel={STATUS_LABEL[conn.status]}
      connectedEmail={email}
      error={conn.error}
      primaryLabel={conn.status === "connected" ? "Reconnect" : "Continue with Google"}
      primaryDisabled={conn.status === "connecting"}
      onPrimary={() => dispatch(beginOAuthConnect("gmail"))}
      onTest={
        email ? () => dispatch(sendTestMail({ provider: "gmail", email })) : undefined
      }
      testPending={testingFor !== null && testingFor === email}
      onDisconnect={
        conn.status === "connected" && email
          ? () => dispatch(disconnectMailbox({ provider: "gmail", email }))
          : undefined
      }
      footer={
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          Uses restricted Gmail send scopes. You approve access in your Google account.
        </p>
      }
    />
  );
}
