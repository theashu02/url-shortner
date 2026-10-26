"use client";

import { ChevronDown } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SOCIAL_NETWORK_OPTIONS } from "@/lib/socialNetworks";
import { BrandMark } from "./SocialBrandMark";
import { OTHER_VALUE } from "./socialConstants";

interface NetworkSelectProps {
  id: string;
  value: string;
  onValueChange: (next: string) => void;
}

export function NetworkSelect({ id, value, onValueChange }: NetworkSelectProps) {
  const selectedOption = SOCIAL_NETWORK_OPTIONS.find((o) => o.value === value);
  const triggerLabel =
    value === OTHER_VALUE ? "Other (custom)" : (selectedOption?.label ?? "Select network");

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs">
        Network
      </Label>
      <DropdownMenu>
        <DropdownMenuTrigger
          id={id}
          className="inline-flex h-9 w-full items-center justify-between gap-2 rounded-none border border-input bg-background px-2 text-xs font-normal text-foreground outline-none hover:bg-muted focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
        >
          <span className="flex items-center gap-2">
            {value !== OTHER_VALUE && <BrandMark network={value} size="sm" />}
            <span>{triggerLabel}</span>
          </span>
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuRadioGroup value={value} onValueChange={onValueChange}>
            {SOCIAL_NETWORK_OPTIONS.map((option) => (
              <DropdownMenuRadioItem key={option.value} value={option.value}>
                <BrandMark network={option.value} size="sm" />
                {option.label}
              </DropdownMenuRadioItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuRadioItem value={OTHER_VALUE}>
              Other (custom)
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
