import { cn } from "@/lib/utils";
import { SocialIcon } from "../SocialIcon";
import { asItems, asString, isHttpUrl } from "./blockUtils";
import type { BlockProps } from "./rowTypes";
import { LinkShell } from "./LinkShell";

export function SocialBlock({ props, blockKey, text, row, dark, compact, interactive, hidden, onLinkClick }: BlockProps) {
  return (
    <div className="flex w-full flex-wrap items-center justify-center gap-1.5" aria-hidden={hidden}>
      {asItems(props["items"]).map((item, index) => {
        const href = isHttpUrl(item["url"]) ? item["url"] : null;
        const network = asString(item["network"]);
        return (
          <LinkShell
            key={index}
            href={href}
            interactive={interactive}
            label={network}
            onPress={(target) => onLinkClick?.(blockKey, target)}
            className={cn(
              "flex items-center justify-center overflow-hidden rounded-full",
              compact ? "h-9 w-9 text-xs" : "h-10 w-10 text-sm",
              interactive && href && "transition-opacity hover:opacity-80"
            )}
            style={{ backgroundColor: row, color: text }}
          >
            <SocialIcon network={network} dark={dark} className={compact ? "h-5 w-5" : "h-6 w-6"} />
          </LinkShell>
        );
      })}
    </div>
  );
}
