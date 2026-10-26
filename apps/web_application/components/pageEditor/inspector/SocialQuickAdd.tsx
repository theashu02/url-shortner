"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SOCIAL_NETWORK_OPTIONS } from "@/lib/socialNetworks";
import { BrandMark } from "./SocialBrandMark";

interface SocialQuickAddProps {
  disabled: boolean;
  onAddNetwork: (label: string, url?: string) => void;
}

export function SocialQuickAdd({ disabled, onAddNetwork }: SocialQuickAddProps) {
  return (
    <>
      <div className="space-y-1.5">
        <span className="text-xs font-medium text-muted-foreground">Quick add</span>
        <div className="flex flex-wrap gap-1.5">
          {SOCIAL_NETWORK_OPTIONS.map((option) => (
            <Button
              key={option.value}
              variant="outline"
              size="sm"
              type="button"
              disabled={disabled}
              onClick={() => onAddNetwork(option.label)}
              className="h-auto gap-1.5 px-2 py-1.5 text-[11px]"
            >
              <BrandMark network={option.value} size="sm" />
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      <Button
        variant="outline"
        size="sm"
        type="button"
        disabled={disabled}
        onClick={() => onAddNetwork("", "https://example.com")}
        className="w-full gap-1.5"
      >
        <Plus className="h-3.5 w-3.5" aria-hidden="true" />
        Add custom link
      </Button>
    </>
  );
}
