"use client";

import { useState } from "react";
import { BarChart3, Clock, MonitorSmartphone, type LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { UtmParameters } from "@/components/appv1/utmParameters";
import { LinkExpiration } from "@/components/appv1/linkExpiration";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  EMPTY_UTM,
  selectActiveOptionCount,
  setDeviceCapture,
  setExpiresAt,
  setUtmParams,
} from "@/store/customLinksSlice";
import { cn } from "@/lib/utils";

type Section = "utm" | "expiry";

function ProBadge() {
  return (
    <Badge
      variant="outline"
      className="shrink-0 rounded-none border-amber-400/50 bg-amber-50 px-1.5 py-0 text-[10px] text-amber-700 dark:bg-amber-950/30 dark:text-amber-400"
    >
      Pro
    </Badge>
  );
}

function StatusPill({ on }: { on: boolean }) {
  return (
    <span
      className={cn(
        "shrink-0 px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase",
        on ? "bg-ember/10 text-ember" : "bg-muted text-muted-foreground",
      )}
    >
      {on ? "On" : "Off"}
    </span>
  );
}

interface OptionHeaderProps {
  icon: LucideIcon;
  swatch: string;
  title: string;
  subtitle: string;
  on: boolean;
  pro?: boolean;
  switchLabel: string;
  switchChecked: boolean;
  onSwitchChange: (checked: boolean) => void;
}

function ExpandableOption({
  icon: Icon,
  swatch,
  title,
  subtitle,
  on,
  pro = true,
  switchLabel,
  switchChecked,
  onSwitchChange,
}: OptionHeaderProps) {
  return (
    <div className="flex items-center gap-2 pr-5">
      <div className="min-w-0 flex-1">
        <AccordionTrigger className="flex w-full items-center gap-3 py-4 pl-5 hover:no-underline">
        <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center", swatch)}>
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1 text-left">
          <span className="block text-sm font-semibold text-foreground">{title}</span>
          <span className="block truncate text-xs text-muted-foreground">{subtitle}</span>
        </span>
          {pro && <ProBadge />}
          <StatusPill on={on} />
        </AccordionTrigger>
      </div>
      <Switch checked={switchChecked} onCheckedChange={onSwitchChange} aria-label={switchLabel} />
    </div>
  );
}

export function AdvancedOptions() {
  const dispatch = useAppDispatch();
  const destinationUrl = useAppSelector((state) => state.customLinks.destinationUrl);
  const utmParams = useAppSelector((state) => state.customLinks.utmParams);
  const expiresAt = useAppSelector((state) => state.customLinks.expiresAt);
  const deviceCapture = useAppSelector((state) => state.customLinks.deviceCapture);
  const activeCount = useAppSelector(selectActiveOptionCount);

  const [open, setOpen] = useState<Section[]>([]);

  const utmOn = utmParams !== null;
  const expiryOn = expiresAt !== null || open.includes("expiry");

  const toggleUtm = (checked: boolean) => {
    dispatch(setUtmParams(checked ? { ...EMPTY_UTM } : null));
    setOpen((prev) => (checked ? [...prev, "utm"] : prev.filter((s) => s !== "utm")));
  };

  const toggleExpiry = (checked: boolean) => {
    if (!checked) dispatch(setExpiresAt(null));
    setOpen((prev) => (checked ? [...prev, "expiry"] : prev.filter((s) => s !== "expiry")));
  };

  const handleOpenChange = (value: Section[]) => {
    if (value.includes("utm") && !utmOn) dispatch(setUtmParams({ ...EMPTY_UTM }));
    setOpen(value);
  };

  return (
    <section aria-label="Advanced options" className="border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border/60 bg-muted/30 px-5 py-3">
        <p className="text-[11px] font-bold tracking-[0.18em] text-muted-foreground uppercase">
          Advanced options
        </p>
        {activeCount > 0 && (
          <Badge className="rounded-none bg-inkband px-2 py-0.5 text-[11px] font-bold text-on-inkband">
            {activeCount} active
          </Badge>
        )}
      </div>

      <div className="divide-y divide-border/40">
        <Accordion multiple value={open} onValueChange={handleOpenChange}>
          <AccordionItem value="utm">
            <ExpandableOption
              icon={BarChart3}
              swatch="bg-lake/10 text-lake"
              title="UTM parameters"
              subtitle="Tag links for campaign reports"
              on={utmParams !== null && Object.values(utmParams).some((v) => v.trim())}
              switchLabel="Enable UTM parameters"
              switchChecked={utmOn}
              onSwitchChange={toggleUtm}
            />
            <AccordionContent>
              <div className="border-t border-border/40 bg-muted/20 px-5 py-5">
                {utmParams && (
                  <UtmParameters
                    params={utmParams}
                    destinationUrl={destinationUrl}
                    onChange={(params) => dispatch(setUtmParams(params))}
                  />
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="expiry">
            <ExpandableOption
              icon={Clock}
              swatch="bg-ember/10 text-ember"
              title="Link expiration"
              subtitle="Auto-disable after a date"
              on={expiresAt !== null}
              switchLabel="Enable link expiration"
              switchChecked={expiryOn}
              onSwitchChange={toggleExpiry}
            />
            <AccordionContent>
              <div className="border-t border-border/40 bg-muted/20 px-5 py-5">
                <LinkExpiration
                  value={expiresAt}
                  onChange={(value) => dispatch(setExpiresAt(value))}
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="flex items-center gap-3 px-5 py-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center bg-lime-soft/40 text-foreground">
            <MonitorSmartphone className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-foreground">Device capture</span>
            <span className="block truncate text-xs text-muted-foreground">
              Record device and browser details per click
            </span>
          </span>
          <StatusPill on={deviceCapture} />
          <Switch
            checked={deviceCapture}
            onCheckedChange={(checked) => dispatch(setDeviceCapture(checked))}
            aria-label="Enable device capture"
          />
        </div>
      </div>
    </section>
  );
}
