"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { asString } from "./blockUtils";
import type { BlockProps } from "./rowTypes";

export function ImageBlock({ props, row, subtle, compact, hidden }: BlockProps) {
  const src = asString(props["src"]);
  const alt =
    asString(props["alt"]).length > 0 ? asString(props["alt"]) : "Page image";
  return (
    <div className="flex w-full flex-col gap-1" aria-hidden={hidden}>
      {src.length > 0 && src !== "/" ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          className="aspect-video w-full rounded-lg object-cover"
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      ) : (
        <div
          className="flex aspect-video w-full items-center justify-center rounded-lg px-3 text-center"
          style={{ backgroundColor: row }}
        >
          <span
            className={cn(compact ? "text-xs" : "text-sm")}
            style={{ color: subtle }}
          >
            {alt}
          </span>
        </div>
      )}
      {asString(props["caption"]).length > 0 && (
        <span
          className={cn("text-center", "text-xs")}
          style={{ color: subtle }}
        >
          {asString(props["caption"])}
        </span>
      )}
    </div>
  );
}

export function VideoBlock({
  videoId,
  title,
  compact,
  interactive,
  row,
  subtle,
}: {
  videoId: string;
  title: string;
  compact: boolean;
  interactive: boolean;
  row: string;
  subtle: string;
}) {
  const [playing, setPlaying] = useState(false);
  if (playing && interactive) {
    return (
      <div className="w-full overflow-hidden rounded-lg">
        <iframe
          src={"https://www.youtube-nocookie.com/embed/" + videoId + "?autoplay=1&rel=0"}
          title={title}
          className="aspect-video w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          loading="lazy"
          allowFullScreen
        />
      </div>
    );
  }
  const thumb = "https://i.ytimg.com/vi/" + videoId + "/hqdefault.jpg";
  const shellClass = cn(
    "relative block w-full overflow-hidden rounded-lg",
    interactive && "transition-opacity hover:opacity-90"
  );
  const body = (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={thumb}
        alt={title}
        className="aspect-video w-full object-cover"
        style={{ backgroundColor: row }}
        loading="lazy"
        referrerPolicy="no-referrer"
      />
      <span
        className="absolute inset-0 flex items-center justify-center"
        aria-hidden="true"
      >
        <span
          className={cn(
            "flex items-center justify-center rounded-full bg-black/60 text-white",
            compact ? "h-10 w-10" : "h-14 w-14"
          )}
        >
          <Play className={compact ? "h-5 w-5" : "h-6 w-6"} fill="currentColor" aria-hidden="true" />
        </span>
      </span>
      {title.length > 0 && (
        <span
          className={cn(
            "absolute inset-x-0 bottom-0 truncate px-2 py-1 text-left",
            "text-xs"
          )}
          style={{ color: "#FFFFFF", backgroundColor: "rgba(0,0,0,0.55)" }}
        >
          {title}
        </span>
      )}
    </>
  );
  if (interactive) {
    return (
      <button
        type="button"
        onClick={() => setPlaying(true)}
        className={shellClass}
        aria-label={"Play " + title}
      >
        {body}
      </button>
    );
  }
  return (
    <span className={shellClass} aria-hidden="true">
      {body}
      <span className="sr-only">{title}</span>
      <span style={{ color: subtle }} className="sr-only">
        {title}
      </span>
    </span>
  );
}
