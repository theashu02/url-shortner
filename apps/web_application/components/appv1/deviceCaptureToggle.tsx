"use client";

import { useState, useCallback } from "react";
import { MonitorSmartphone } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface DeviceCaptureToggleProps {
  onChange?: (enabled: boolean) => void;
}

export function DeviceCaptureToggle({ onChange }: DeviceCaptureToggleProps) {
  const [enabled, setEnabled] = useState(false);

  const toggle = useCallback(
    (checked: boolean) => {
      setEnabled(checked);
      onChange?.(checked);
    },
    [onChange],
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MonitorSmartphone className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-semibold">
            Device information capture
          </span>
        </div>
        <Switch
          id="device-capture-toggle"
          checked={enabled}
          onCheckedChange={toggle}
        />
      </div>

      <p className="text-xs text-muted-foreground">
        Visitors see a preview page before continuing to the destination.
        Basic device and browser details are recorded for this link&apos;s
        analytics.
      </p>
    </div>
  );
}
