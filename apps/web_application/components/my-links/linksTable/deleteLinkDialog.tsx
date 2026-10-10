"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DeleteLinkDialogProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function DeleteLinkDialog({ open, onCancel, onConfirm }: DeleteLinkDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent className="rounded-none sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete short link?</DialogTitle>
          <DialogDescription className="text-sm">
            This action cannot be undone. This will permanently delete your short link and its analytics.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onCancel} className="rounded-none">
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm} className="rounded-none">
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
