"use client";

import { BarChart3, Clock, MonitorSmartphone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { UtmParameters, type UtmParams } from "@/components/appv1/utmParameters";
import { LinkExpiration } from "@/components/appv1/linkExpiration";
import { DeviceCaptureToggle } from "@/components/appv1/deviceCaptureToggle";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  selectActiveOptionCount,
  setDeviceCapture,
  setExpiresAt,
  setUtmParams,
} from "@/store/customLinksSlice";
import { cn } from "@/lib/utils";

function OptionTrigger({
  icon: Icon,
  label,
  swatch,
  active,
  children,
}: {
  icon: typeof Clock;
  label: string;
  swatch: string;
  active?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <AccordionTrigger className="flex items-center gap-3 px-5 py-4 hover:no-underline">
      <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center", swatch)}>
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
      <span className="text-sm font-semibold text-foreground">{label}</span>
      {children}
      <span
        className={cn(
          "ml-auto mr-2 h-2 w-2 shrink-0",
          active ? "bg-ember" : "bg-border",
        )}
        aria-hidden="true"
      />
    </AccordionTrigger>
  );
}

export function AdvancedOptions() {
  const dispatch = useAppDispatch();
  const destinationUrl = useAppSelector((state) => state.customLinks.destinationUrl);
  const deviceCapture = useAppSelector((state) => state.customLinks.deviceCapture);
  const utmActive = useAppSelector((state) =>
    state.customLinks.utmParams
      ? Object.values(state.customLinks.utmParams).some((value) => value.trim())
      : false,
  );
  const expiryActive = useAppSelector((state) => state.customLinks.expiresAt !== null);
  const activeCount = useAppSelector(selectActiveOptionCount);

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

      <Accordion className="divide-y divide-border/40">
        <AccordionItem value="utm">
          <OptionTrigger icon={BarChart3} label="UTM parameters" swatch="bg-lake/10 text-lake" active={utmActive}>
            <Badge variant="outline" className="rounded-none border-amber-400/50 bg-amber-50 px-1.5 py-0 text-[10px] text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">
              Pro
            </Badge>
          </OptionTrigger>
          <AccordionContent className="px-5 pb-5">
            <UtmParameters
              destinationUrl={destinationUrl}
              onChange={(params: UtmParams | null) => dispatch(setUtmParams(params))}
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="expiry">
          <OptionTrigger icon={Clock} label="Link expiration" swatch="bg-ember/10 text-ember" active={expiryActive}>
            <Badge variant="outline" className="rounded-none border-amber-400/50 bg-amber-50 px-1.5 py-0 text-[10px] text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">
              Pro
            </Badge>
          </OptionTrigger>
          <AccordionContent className="px-5 pb-5">
            <LinkExpiration onChange={(value) => dispatch(setExpiresAt(value))} />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="device">
          <OptionTrigger
            icon={MonitorSmartphone}
            label="Device capture"
            swatch="bg-lime-soft/40 text-foreground"
            active={deviceCapture}
          />
          <AccordionContent className="px-5 pb-5">
            <DeviceCaptureToggle onChange={(value) => dispatch(setDeviceCapture(value))} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </section>
  );
}
