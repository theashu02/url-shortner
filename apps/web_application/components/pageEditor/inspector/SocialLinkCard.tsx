"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { normalizeSocialKey, SOCIAL_NETWORK_OPTIONS } from "@/lib/socialNetworks";
import { BrandMark } from "./SocialBrandMark";
import { NetworkSelect } from "./NetworkSelect";
import { OTHER_VALUE } from "./socialConstants";
import { asString } from "./fieldUtils";

interface SocialLinkCardProps {
  blockKey: string;
  index: number;
  item: Record<string, unknown>;
  onPatch: (patch: Record<string, unknown>) => void;
  onRemove: () => void;
}

export function SocialLinkCard({ blockKey, index, item, onPatch, onRemove }: SocialLinkCardProps) {
  const network = asString(item["network"]);
  const brandKey = normalizeSocialKey(network);
  const selectValue = brandKey ?? OTHER_VALUE;

  return (
    <div className="border-border/70 space-y-2 rounded-none border p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-2">
          <BrandMark network={network} size="md" />
          <span className="text-muted-foreground text-[11px] font-semibold">
            Social {index + 1}
          </span>
        </span>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onRemove}
          aria-label={`Remove social link ${index + 1}`}
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
        </Button>
      </div>

      <NetworkSelect
        id={`${blockKey}-network-${index}`}
        value={selectValue}
        onValueChange={(next) => {
          if (next === OTHER_VALUE) {
            onPatch({ network: brandKey ? "" : network });
          } else {
            const option = SOCIAL_NETWORK_OPTIONS.find((o) => o.value === next);
            onPatch({ network: option?.label ?? next });
          }
        }}
      />

      {selectValue === OTHER_VALUE && (
        <div className="space-y-1.5">
          <Label htmlFor={`${blockKey}-custom-${index}`} className="text-xs">
            Custom network name
          </Label>
          <Input
            id={`${blockKey}-custom-${index}`}
            value={network}
            maxLength={40}
            placeholder="e.g. TikTok"
            onChange={(e) => onPatch({ network: e.target.value })}
          />
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor={`${blockKey}-url-${index}`} className="text-xs">
          URL
        </Label>
        <Input
          id={`${blockKey}-url-${index}`}
          value={asString(item["url"])}
          placeholder="https://…"
          onChange={(e) => onPatch({ url: e.target.value })}
        />
      </div>
    </div>
  );
}
