import { cn } from "@/lib/utils";
import { asItems, asString, isHttpUrl } from "./blockUtils";
import type { BlockProps } from "./rowTypes";
import { LinkShell } from "./LinkShell";

export function ProductBlock({ props, blockKey, text, row, shape, accent, compact, interactive, hidden, onLinkClick }: BlockProps) {
  return (
    <div className="w-full space-y-1.5" aria-hidden={hidden}>
      {asItems(props["items"]).map((item, index) => {
        const href = isHttpUrl(item["url"]) ? item["url"] : null;
        return (
          <LinkShell
            key={index}
            href={href}
            interactive={interactive}
            label={asString(item["name"])}
            onPress={(target) => onLinkClick?.(blockKey, target)}
            className={cn(
              "flex w-full items-center justify-between gap-2.5",
              shape,
              compact ? "px-3 py-2" : "px-4 py-2.5",
              interactive && href && "transition-opacity hover:opacity-80"
            )}
            style={{ backgroundColor: row }}
          >
            <span
              className={cn(
                "truncate font-medium",
                compact ? "text-xs" : "text-sm"
              )}
              style={{ color: text }}
            >
              {asString(item["name"])}
            </span>
            {asString(item["price"]).length > 0 && (
              <span
                className={cn(
                  "shrink-0 font-semibold",
                  compact ? "text-xs" : "text-sm"
                )}
                style={{ color: accent }}
              >
                {asString(item["price"])}
              </span>
            )}
          </LinkShell>
        );
      })}
    </div>
  );
}
