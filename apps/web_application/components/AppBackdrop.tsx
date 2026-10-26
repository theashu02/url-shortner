import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { FloatingSquares, type FloatingSquare } from "@/components/LandingPage/hero-backdrop";

type AppBackdropVariant = "corners" | "spotlight";

interface AppBackdropProps {
  children: ReactNode;
  className?: string;
  variant?: AppBackdropVariant;
}

const PAGE_SQUARES: FloatingSquare[] = [
  { left: "5%", top: "16%", size: 14, className: "bg-ember", duration: 9, delay: 0, drift: 26, spin: 90 },
  { left: "10%", top: "66%", size: 10, className: "border border-lake", duration: 11, delay: 1.2, drift: 22, spin: -90 },
  { left: "17%", top: "40%", size: 8, className: "bg-lake", duration: 8, delay: 0.6, drift: 18, spin: 45 },
  { left: "3%", top: "84%", size: 9, className: "border border-ember", duration: 10, delay: 0.4, drift: 20, spin: 180 },
  { left: "88%", top: "18%", size: 12, className: "border border-ember", duration: 10, delay: 0.3, drift: 26, spin: 90 },
  { left: "93%", top: "60%", size: 16, className: "bg-lime-soft border border-border", duration: 12, delay: 1.6, drift: 20, spin: -45 },
  { left: "83%", top: "82%", size: 9, className: "bg-lake", duration: 9, delay: 2, drift: 24, spin: 180 },
  { left: "50%", top: "6%", size: 8, className: "border border-border", duration: 13, delay: 0.9, drift: 16, spin: 90 },
];

function CornerSquares() {
  return (
    <>
      <div
        className="border-border bg-lime-soft pointer-events-none absolute -top-10 -right-10 h-40 w-40 border-2"
        aria-hidden="true"
      />
      <div
        className="border-border bg-lake/20 pointer-events-none absolute -bottom-12 -left-12 h-48 w-48 border-2"
        aria-hidden="true"
      />
    </>
  );
}

function SpotlightDecor() {
  return (
    <>
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(to right, color-mix(in srgb, var(--line) 7%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in srgb, var(--line) 7%, transparent) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
          maskImage: "radial-gradient(ellipse 80% 70% at 50% 28%, black 30%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 70% at 50% 28%, black 30%, transparent 75%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-120"
        style={{
          background:
            "radial-gradient(ellipse 55% 60% at 50% 0%, color-mix(in srgb, var(--ember) 13%, transparent), transparent 70%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-95"
        style={{
          background:
            "radial-gradient(ellipse 55% 60% at 50% 100%, color-mix(in srgb, var(--lake) 12%, transparent), transparent 70%)",
        }}
      />
      <FloatingSquares items={PAGE_SQUARES} />
    </>
  );
}

export function AppBackdrop({ children, className, variant = "corners" }: AppBackdropProps) {
  return (
    <div
      className={cn(
        "bg-mist font-ubuntu relative flex min-h-screen w-full overflow-hidden",
        className
      )}
    >
      {variant === "spotlight" ? <SpotlightDecor /> : <CornerSquares />}
      {children}
    </div>
  );
}
