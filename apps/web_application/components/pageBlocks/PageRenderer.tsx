"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { isBlockLiveNow, isPageBlockType } from "@/server/lib/pages";
import { resolveDisplayAvatar } from "@/server/lib/pageAvatar";
import { BlockRow } from "./renderer/BlockRow";
import { initialOf } from "./renderer/blockUtils";

export { buildVCard } from "@/server/lib/vcard";
import type { PageBlockInput, PageTheme } from "@/server/lib/pages";

export interface PageRendererProps {
  title: string;
  theme: PageTheme;
  blocks: PageBlockInput[];
  compact?: boolean;
  interactive?: boolean;
  className?: string;
  onLinkClick?: (blockKey: string, href: string) => void;
}

export function PageRenderer({
  title,
  theme,
  blocks,
  compact = false,
  interactive = false,
  className,
  onLinkClick,
}: PageRendererProps) {
  const [avatarFailed, setAvatarFailed] = useState(false);
  const shape = theme.buttonShape === "pill"
    ? "rounded-full"
    : theme.buttonShape === "square"
      ? "rounded-none"
      : "rounded-lg";
  const description =
    typeof theme.description === "string" ? theme.description.trim() : "";
  const avatar = resolveDisplayAvatar(theme, blocks);
  const showAvatar = avatar.length > 0 && !avatarFailed;
  const text = theme.dark ? "#FAF6EF" : "#101418";
  const subtle = theme.dark ? "#FAF6EF99" : "#10141899";
  const row = theme.dark ? "#FAF6EF1A" : "#1014180D";
  const visible = [...blocks]
    .filter(
      (block) =>
        block.visible !== false &&
        isPageBlockType(block.type) &&
        isBlockLiveNow(block)
    )
    .sort((a, b) => {
      const aPinned = a.pinned === true ? 0 : 1;
      const bPinned = b.pinned === true ? 0 : 1;
      if (aPinned !== bPinned) return aPinned - bPinned;
      return a.position - b.position;
    });

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-2xl border border-border",
        className
      )}
      style={{ backgroundColor: theme.card }}
    >
      <div
        className={cn(
          "flex shrink-0 items-center justify-center",
          compact ? "h-28" : "h-36"
        )}
        style={{ backgroundColor: theme.header }}
      >
        {showAvatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatar}
            alt={title}
            className={cn(
              "object-cover",
              compact ? "h-16 w-16" : "h-20 w-20",
              "rounded-full"
            )}
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setAvatarFailed(true)}
          />
        ) : (
          <span
            className={cn(
              "flex items-center justify-center rounded-full font-bold",
              compact ? "h-16 w-16 text-xl" : "h-20 w-20 text-2xl"
            )}
            style={{ backgroundColor: theme.accent, color: theme.card }}
          >
            {initialOf(title)}
          </span>
        )}
      </div>
      <div
        className={cn(
          "flex flex-1 flex-col items-center px-5",
          compact ? "gap-1.5 pt-3" : "gap-2 pt-4 pb-4"
        )}
      >
        {description.length > 0 && (
          <p
            className={cn(
              "w-full text-center",
              compact ? "text-xs line-clamp-2" : "text-sm"
            )}
            style={{ color: subtle }}
          >
            {description}
          </p>
        )}
        {visible.map((block) => (
          <BlockRow
            key={block.key}
            block={block}
            text={text}
            subtle={subtle}
            row={row}
            shape={shape}
            accent={theme.accent}
            dark={theme.dark}
            compact={compact}
            interactive={interactive}
            onLinkClick={onLinkClick}
          />
        ))}
      </div>
    </div>
  );
}
