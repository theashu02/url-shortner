import { cn } from "@/lib/utils";
import { asString } from "./blockUtils";
import type { BlockProps } from "./rowTypes";

export function TextBlock({ props, text, subtle, compact, hidden }: BlockProps) {
  return (
    <div className="flex w-full flex-col gap-0.5 px-1" aria-hidden={hidden}>
      {asString(props["heading"]).length > 0 && (
        <span
          className={cn("font-semibold", compact ? "text-xs" : "text-sm")}
          style={{ color: text }}
        >
          {asString(props["heading"])}
        </span>
      )}
      <span
        className={cn(compact ? "text-xs line-clamp-2" : "text-sm")}
        style={{ color: subtle }}
      >
        {asString(props["body"])}
      </span>
    </div>
  );
}
