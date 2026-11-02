import { resolveDisplayAvatar } from "@/server/lib/pageAvatar";
import type { PageDTO } from "@/server/services/pages";

export function PageThumbnail({ page }: { page: PageDTO }) {
  const avatar = resolveDisplayAvatar(page.theme, page.blocks);
  const initial = page.title.trim().charAt(0).toUpperCase() || "?";
  return (
    <div
      aria-hidden="true"
      className="flex h-24 w-20 shrink-0 flex-col overflow-hidden border border-border bg-muted"
    >
      <div
        className="flex h-11 items-center justify-center"
        style={{ backgroundColor: page.theme.header }}
      >
        {avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatar}
            alt=""
            loading="lazy"
            referrerPolicy="no-referrer"
            className="h-7 w-7 rounded-full border border-card object-cover"
          />
        ) : (
          <span
            className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold"
            style={{ backgroundColor: page.theme.accent, color: page.theme.card }}
          >
            {initial}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-1.5" style={{ backgroundColor: page.theme.card }}>
        <span
          className="h-1.5 w-full"
          style={{ backgroundColor: page.theme.accent }}
        />
        <span className="h-1.5 w-2/3 bg-muted-foreground/30" />
        <span className="h-1.5 w-1/2 bg-muted-foreground/20" />
      </div>
    </div>
  );
}
