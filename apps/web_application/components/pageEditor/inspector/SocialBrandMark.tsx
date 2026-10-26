"use client";

import Image from "next/image";
import { useState } from "react";
import { getSocialLogo } from "@/lib/socialNetworks";
import { GUEST_LOGO } from "@/utils/constant";

export function BrandMark({ network, size = "md" }: { network: string; size?: "sm" | "md" }) {
  const [failed, setFailed] = useState(false);
  const src = failed ? GUEST_LOGO : getSocialLogo(network);
  const dimension = size === "sm" ? 16 : 24;
  return (
    <Image
      src={src}
      alt="brand-logo"
      width={dimension}
      height={dimension}
      className="shrink-0 rounded object-contain"
      onError={() => setFailed(true)}
    />
  );
}
