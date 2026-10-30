"use client";

import {
  AlertCircle,
  Layers,
  MailCheck,
  RefreshCw,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GmailConnectCard } from "./GmailConnectCard";
import { OutlookConnectCard } from "./OutlookConnectCard";
import { SmtpConnectCard } from "./SmtpConnectCard";
import { useMailerConnect, PROVIDER_LABEL } from "./useMailerConnect";

const TOTAL_PROVIDERS = 3;

function Metric({
  icon: Icon,
  label,
  value,
  swatch,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  swatch: string;
}) {
  return (
    <div className="flex items-center gap-3 border bg-card p-4">
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center ${swatch}`}
      >
        <Icon className="h-5 w-5" />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-2xl font-extrabold tracking-tight text-foreground tabular-nums">
          {value}
        </span>
        <span className="block text-[11px] font-bold tracking-widest text-muted-foreground uppercase">
          {label}
        </span>
      </span>
    </div>
  );
}

export function MailerConnectPage() {
  const { connected, listLoading, errorCount, refresh } = useMailerConnect();

  return (
    <div className="flex-1 w-full overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-6">
      <div className="w-full max-w-7xl mx-auto space-y-6">
        <div className="space-y-5">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div className="space-y-2">
              <p className="flex items-center gap-2 text-[11px] font-bold tracking-[0.2em] text-muted-foreground uppercase">
                <span className="inline-block h-2.5 w-2.5 bg-ember" aria-hidden="true" />
                Email delivery
              </p>
              <h1 className="font-display text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-foreground">
                Mailer
              </h1>
              <p className="text-muted-foreground text-xs sm:text-sm max-w-xl">
                Connect Gmail, Outlook, or any SMTP server to send personalized and bulk mails.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={refresh}
                disabled={listLoading}
                className="gap-1.5 text-xs h-9 rounded-none"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${listLoading ? "animate-spin" : ""}`} />
                <span>Refresh</span>
              </Button>
              <Badge
                variant={connected.length > 0 ? "default" : "outline"}
                className="h-9 px-3 rounded-none text-xs"
              >
                {listLoading
                  ? "Loading..."
                  : connected.length + " of " + TOTAL_PROVIDERS + " connected"}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Metric
              icon={MailCheck}
              label="Connected"
              value={String(connected.length)}
              swatch="bg-ember text-on-ember"
            />
            <Metric
              icon={Layers}
              label="Providers"
              value={String(TOTAL_PROVIDERS)}
              swatch="bg-lake text-on-lake"
            />
            <Metric
              icon={AlertCircle}
              label="Needs attention"
              value={String(errorCount)}
              swatch="bg-lime-soft text-on-lime"
            />
          </div>
        </div>

        {connected.length > 0 ? (
          <section
            aria-label="Connected senders"
            className="border bg-card p-4"
          >
            <p className="text-[11px] font-bold tracking-widest text-muted-foreground uppercase">
              Ready to send from
            </p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {connected.map((c) => (
                <li key={c.provider + ":" + (c.email ?? "")}>
                  <Badge variant="secondary">
                    {PROVIDER_LABEL[c.provider] ?? c.provider}
                    {c.email ? " - " + c.email : ""}
                  </Badge>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section aria-label="Connection options" className="grid gap-4 md:grid-cols-3">
          <GmailConnectCard />
          <OutlookConnectCard />
          <SmtpConnectCard />
        </section>
      </div>
    </div>
  );
}
