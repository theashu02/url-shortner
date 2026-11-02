import { cn } from "@/lib/utils";
import { asString } from "./blockUtils";
import type { BlockProps } from "./rowTypes";

export function HeaderBlock({ props, text, subtle, compact, hidden }: BlockProps) {
  return (
    <div className="flex w-full flex-col items-center gap-1 text-center" aria-hidden={hidden}>
      <span
        className={cn("font-bold", compact ? "text-base" : "text-lg")}
        style={{ color: text }}
      >
        {asString(props["title"])}
      </span>
      {asString(props["subtitle"]).length > 0 && (
        <span
          className={cn(compact ? "text-xs" : "text-sm")}
          style={{ color: subtle }}
        >
          {asString(props["subtitle"])}
        </span>
      )}
    </div>
  );
}
