"use client";

import type { ReactElement } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface SidebarTipProps {
  label: string;
  collapsed: boolean;
  children: ReactElement;
}

export function SidebarTip({ label, collapsed, children }: SidebarTipProps) {
  if (!collapsed) return children;
  return (
    <Tooltip>
      <TooltipTrigger render={children} />
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  );
}
