"use client";

import { Server } from "lucide-react";
import { useAppSelector } from "@/store";
import { useAppDispatch } from "@/store";
import {
  disconnectMailbox,
  sendTestMail,
  setSmtpDialogOpen,
} from "@/store/mailer-connection-slice";
import { MailProviderCard } from "./MailProviderCard";
import { SmtpConfigDialog } from "./SmtpConfigDialog";

export function SmtpConnectCard() {
  const dispatch = useAppDispatch();
  const conn = useAppSelector((s) => s.mailerConnection.connections.smtp);
  const saved = useAppSelector((s) => s.mailerConnection.smtpConfig);
  const testingFor = useAppSelector((s) => s.mailerConnection.testingFor);
  const email = conn.email;

  const statusLabel =
    conn.status === "connected" && saved.host
      ? "Connected"
      : conn.status === "connected"
        ? "Connected"
        : conn.status === "connecting"
          ? "Verifying"
          : conn.status === "error"
            ? "Needs attention"
            : "Not connected";

  return (
    <>
      <MailProviderCard
        icon={<Server className="h-5 w-5" aria-hidden="true" />}
        title="SMTP"
        description="Use any SMTP server with host, port, and credentials. Works with every provider."
        status={conn.status}
        statusLabel={statusLabel}
        connectedEmail={email}
        error={conn.error}
        primaryLabel={conn.status === "connected" ? "Edit settings" : "Configure SMTP"}
        primaryDisabled={conn.status === "connecting"}
        onPrimary={() => dispatch(setSmtpDialogOpen(true))}
        onTest={
          email ? () => dispatch(sendTestMail({ provider: "smtp", email })) : undefined
        }
        testPending={testingFor !== null && testingFor === email}
        onDisconnect={
          conn.status === "connected" && email
            ? () => dispatch(disconnectMailbox({ provider: "smtp", email }))
            : undefined
        }
        footer={
          saved.host ? (
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              {saved.host}:{saved.port} - {saved.username || "no username set"}
            </p>
          ) : (
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              Common ports: 587 (STARTTLS), 465 (SSL), 25 (plain).
            </p>
          )
        }
      />
      <SmtpConfigDialog />
    </>
  );
}
