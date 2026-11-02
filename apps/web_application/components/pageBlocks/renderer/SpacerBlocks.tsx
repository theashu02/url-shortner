import type { BlockProps } from "./rowTypes";

export function SpacerBlock({ props }: BlockProps) {
  const rawHeight = props["height"];
  const height =
    typeof rawHeight === "number" &&
    Number.isInteger(rawHeight) &&
    rawHeight >= 8 &&
    rawHeight <= 160
      ? rawHeight
      : 32;
  return <div className="w-full" style={{ height }} aria-hidden="true" />;
}

export function DividerBlock({ props, subtle }: BlockProps) {
  if (props["style"] === "dots") {
    return (
      <div
        className="flex w-full items-center justify-center gap-1.5 py-1"
        aria-hidden="true"
      >
        {[0, 1, 2].map((dot) => (
          <span
            key={dot}
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: subtle }}
          />
        ))}
      </div>
    );
  }
  return (
    <div className="w-full px-2 py-1" aria-hidden="true">
      <div className="h-px w-full" style={{ backgroundColor: subtle }} />
    </div>
  );
}
