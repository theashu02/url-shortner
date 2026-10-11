"use client";

import { Link2, QrCode, Sparkles, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/store";
import { setMode, type ComposerMode } from "@/store/customLinksSlice";
import { cn } from "@/lib/utils";

const MODES: { value: ComposerMode; label: string; hint: string; icon: LucideIcon }[] = [
  { value: "link", label: "Short link", hint: "Trackable URL", icon: Link2 },
  { value: "qr", label: "QR Code", hint: "Print-ready", icon: QrCode },
  { value: "both", label: "Link + QR", hint: "Best of both", icon: Sparkles },
];

export function ModeSelector() {
  const dispatch = useAppDispatch();
  const mode = useAppSelector((state) => state.customLinks.mode);

  return (
    <div
      role="tablist"
      aria-label="Creation mode"
      className="grid grid-cols-3 gap-1 border border-border bg-card p-1 shadow-sm"
    >
      {MODES.map((option) => {
        const active = mode === option.value;
        return (
          <Button
            key={option.value}
            role="tab"
            aria-selected={active}
            type="button"
            variant="ghost"
            onClick={() => dispatch(setMode(option.value))}
            className={cn(
              "group h-auto flex-col gap-1 px-2 py-3 sm:flex-row sm:gap-2.5 sm:py-3.5",
              active
                ? "bg-inkband text-on-inkband hover:bg-inkband hover:text-on-inkband"
                : "text-muted-foreground hover:bg-mist hover:text-foreground",
            )}
          >
            <option.icon
              className={cn("h-4 w-4 shrink-0", active && "text-ember")}
              aria-hidden="true"
            />
            <span className="text-center sm:text-left">
              <span className="block text-xs font-bold sm:text-sm">
                {option.label}
              </span>
              <span
                className={cn(
                  "hidden text-[11px] sm:block",
                  active ? "text-on-inkband/70" : "text-muted-foreground/70",
                )}
              >
                {option.hint}
              </span>
            </span>
          </Button>
        );
      })}
    </div>
  );
}
