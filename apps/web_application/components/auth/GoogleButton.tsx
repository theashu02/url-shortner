"use client";

import { signIn } from "next-auth/react";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { GOOGLE_LOGO } from "@/utils/constant";

export function GoogleButton() {
  const [pending, start] = useTransition();

  return (
    <Button
      variant="outline"
      className="h-12 w-full px-6 rounded-none font-semibold uppercase tracking-wider text-xs border border-border"
      disabled={pending}
      onClick={() => start(() => { void signIn("google", { callbackUrl: "/dashboard" }); })}
    >
      <span className="grid min-w-60 grid-cols-[1.5rem_auto] items-center justify-center gap-3">
        <span className="flex size-6 items-center justify-center justify-self-center">
          <Image src={GOOGLE_LOGO} width={20} height={20} alt="Google logo" />
        </span>
        <span className="text-left text-sm sm:text-[13px]">
          {pending ? "Redirecting..." : "Continue with Google"}
        </span>
      </span>
    </Button>
  );
}
