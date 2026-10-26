"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PageSettingsSection } from "./inspector/PageSettingsSection";
import type { UsePageDraft } from "./usePageDraft";

interface PageSettingsDialogProps {
  draft: UsePageDraft;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PageSettingsDialog({
  draft,
  open,
  onOpenChange,
}: PageSettingsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-none p-0 sm:max-w-md">
        <DialogHeader className="border-b border-border p-5 text-left">
          <DialogTitle className="text-base font-bold">
            Page settings
          </DialogTitle>
          <DialogDescription>
            Update the page title and URL. Changes save automatically.
          </DialogDescription>
        </DialogHeader>
        <div className="p-5">
          <PageSettingsSection
            draft={draft}
            className="border-0 bg-transparent p-0"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
