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
      className="h-14 w-full px-6 rounded-none font-bold uppercase tracking-widest text-sm border-2 border-border bg-card text-foreground hover:bg-ember hover:text-on-ember hover:border-border"
      disabled={pending}
      onClick={() => start(() => { void signIn("google", { callbackUrl: "/appv1/dashboard" }); })}
    >
      <span className="grid min-w-60 grid-cols-[1.5rem_auto] items-center justify-center gap-3">
        <span className="flex size-6 items-center justify-center justify-self-center">
          <Image src={GOOGLE_LOGO} width={20} height={20} alt="Google logo" />
        </span>
        <span className="text-left">
          {pending ? "Redirecting..." : "Continue with Google"}
        </span>
      </span>
    </Button>
  );
}
