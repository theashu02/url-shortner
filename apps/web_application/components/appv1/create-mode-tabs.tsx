"use client";

import { Link2, QrCode, Sparkles } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { CreateMode } from "@/components/appv1/url-create-form";

interface CreateModeTabsProps {
  mode: CreateMode;
  onModeChange: (mode: CreateMode) => void;
}

export function CreateModeTabs({ mode, onModeChange }: CreateModeTabsProps) {
  return (
    <Tabs
      value={mode}
      onValueChange={(v) => onModeChange(v as CreateMode)}
      className="w-full flex justify-center"
    >
      <TabsList className="w-full max-w-xl grid grid-cols-3 sm:w-auto sm:inline-flex h-auto sm:h-12 p-1 gap-1 sm:gap-2 bg-muted/60 dark:bg-muted/30 border border-border rounded-none">
        <TabsTrigger
          value="link"
          className="flex-1 inline-flex items-center justify-center gap-1.5 sm:gap-2 h-9 sm:h-10 px-2 sm:px-4 text-xs sm:text-sm font-medium rounded-none text-muted-foreground hover:text-foreground data-active:bg-primary dark:data-active:bg-primary data-active:text-primary-foreground dark:data-active:text-primary-foreground data-active:shadow-sm hover:data-active:text-amber-200 transition-all"
        >
          <Link2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
          <span className="truncate">Short link</span>
        </TabsTrigger>
        <TabsTrigger
          value="qr"
          className="flex-1 inline-flex items-center justify-center gap-1.5 sm:gap-2 h-9 sm:h-10 px-2 sm:px-4 text-xs sm:text-sm font-medium rounded-none text-muted-foreground hover:text-foreground data-active:bg-primary dark:data-active:bg-primary data-active:text-primary-foreground dark:data-active:text-primary-foreground data-active:shadow-sm hover:data-active:text-amber-200 transition-all"
        >
          <QrCode className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
          <span className="truncate">QR Code</span>
        </TabsTrigger>
        <TabsTrigger
          value="both"
          className="flex-1 inline-flex items-center justify-center gap-1.5 sm:gap-2 h-9 sm:h-10 px-2 sm:px-4 text-xs sm:text-sm font-medium rounded-none text-muted-foreground hover:text-foreground data-active:bg-primary dark:data-active:bg-primary data-active:text-primary-foreground dark:data-active:text-primary-foreground data-active:shadow-sm hover:data-active:text-amber-200 transition-all"
        >
          <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
          <span className="truncate">Link + QR Code</span>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
