"use client";

import { memo, useCallback, useState } from "react";
import { getSocialLogo } from "@/lib/socialNetworks";
import { GUEST_LOGO } from "@/utils/constant";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface SocialIconProps {
  network: string;
  dark: boolean;
  className?: string;
}

function SocialIconView({ network, dark, className }: SocialIconProps) {
  const [stage, setStage] = useState(0);
  const src = stage === 0 ? getSocialLogo(network, dark) : GUEST_LOGO;
  const advance = useCallback(() => setStage((current) => current + 1), []);

  if (stage > 1) {
    return (
      <span aria-hidden="true" className={cn("font-bold", className)}>
        {(network.trim().charAt(0) || "?").toUpperCase()}
      </span>
    );
  }

  return (
    <Image
      src={src}
      alt="social-logo"
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={advance}
      draggable={false}
      className={cn("object-contain", className)}
      height={25}
      width={25}
    />
  );
}

export const SocialIcon = memo(SocialIconView);
