"use client";

import { AtSign } from "lucide-react";
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

export function OutlookConnectCard() {
  const dispatch = useAppDispatch();
  const conn = useAppSelector((s) => s.mailerConnection.connections.outlook);
  const testingFor = useAppSelector((s) => s.mailerConnection.testingFor);
  const email = conn.email;

  return (
    <MailProviderCard
      icon={<AtSign className="h-5 w-5" aria-hidden="true" />}
      title="Outlook"
      description="Connect with Microsoft Graph / Outlook (OAuth 2.0). Best for Microsoft 365 and Outlook.com senders."
      status={conn.status}
      statusLabel={STATUS_LABEL[conn.status]}
      connectedEmail={email}
      error={conn.error}
      primaryLabel={conn.status === "connected" ? "Reconnect" : "Continue with Microsoft"}
      primaryDisabled={conn.status === "connecting"}
      onPrimary={() => dispatch(beginOAuthConnect("outlook"))}
      onTest={
        email ? () => dispatch(sendTestMail({ provider: "outlook", email })) : undefined
      }
      testPending={testingFor !== null && testingFor === email}
      onDisconnect={
        conn.status === "connected" && email
          ? () => dispatch(disconnectMailbox({ provider: "outlook", email }))
          : undefined
      }
      footer={
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          Uses delegated Mail.Send scope. You approve access in your Microsoft account.
        </p>
      }
    />
  );
}
