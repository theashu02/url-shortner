import { ArrowUpRight, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { asItems, asString, isHttpUrl } from "./blockUtils";
import type { BlockProps } from "./rowTypes";
import { LinkShell } from "./LinkShell";

export function LinksBlock({ props, blockKey, text, subtle, row, shape, accent, compact, interactive, hidden, onLinkClick }: BlockProps) {
  const items = compact
    ? asItems(props["items"]).slice(0, 3)
    : asItems(props["items"]);
  return (
    <div className="w-full space-y-1.5" aria-hidden={hidden}>
      {items.map((item, index) => {
        const shortCode =
          typeof item["shortCode"] === "string" &&
          /^[A-Za-z0-9-]{3,50}$/.test(item["shortCode"])
            ? (item["shortCode"] as string)
            : null;
        const href = shortCode
          ? "/" + shortCode
          : isHttpUrl(item["url"])
            ? item["url"]
            : null;
        return (
          <LinkShell
            key={index}
            href={href}
            interactive={interactive}
            label={asString(item["label"])}
            onPress={(target) => onLinkClick?.(blockKey, target)}
            className={cn(
              "flex w-full items-center gap-2.5",
              shape,
              compact ? "px-3 py-2" : "px-4 py-2.5",
              interactive && href && "transition-opacity hover:opacity-80"
            )}
            style={{ backgroundColor: row }}
          >
            <Link2
              className={compact ? "h-4 w-4 shrink-0" : "h-5 w-5 shrink-0"}
              style={{ color: accent }}
              aria-hidden="true"
            />
            <span
              className={cn(
                "truncate font-medium",
                compact ? "text-xs" : "text-sm"
              )}
              style={{ color: text }}
            >
              {asString(item["label"])}
            </span>
            {interactive && href && (
              <ArrowUpRight
                className="ml-auto h-4 w-4 shrink-0"
                style={{ color: subtle }}
                aria-hidden="true"
              />
            )}
          </LinkShell>
        );
      })}
    </div>
  );
}
