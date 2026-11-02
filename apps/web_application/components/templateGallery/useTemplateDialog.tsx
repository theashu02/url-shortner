"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toast-manager";
import { useAppDispatch } from "@/store";
import { createPageFromTemplate } from "@/store/pages-slice";
import { useSlugAvailability } from "@/hooks/useSlugAvailability";
import type { GalleryTemplate } from "./templateTypes";

const GOAL_OPTIONS: { value: string; label: string; hint: string }[] = [
  { value: "grow-audience", label: "Grow an audience", hint: "Collect followers and subscribers" },
  { value: "drive-sales", label: "Drive sales", hint: "Send visitors to products and offers" },
  { value: "share-content", label: "Share content", hint: "Videos, music, posts and links" },
  { value: "collect-contacts", label: "Collect contacts", hint: "Emails, bookings and vCards" },
];

export function UseTemplateDialog({
  template,
  onClose,
}: {
  template: GalleryTemplate;
  onClose: () => void;
}) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [step, setStep] = useState<1 | 2>(1);
  const [destinationUrl, setDestinationUrl] = useState("");
  const [urlError, setUrlError] = useState<string | null>(null);
  const [goal, setGoal] = useState<string | null>(null);
  const [title, setTitle] = useState(template.name);
  const [slugInput, setSlugInput] = useState(template.id);
  const slugState = useSlugAvailability(slugInput);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trimmedUrl = destinationUrl.trim();
  const urlValid =
    trimmedUrl.length === 0 || /^https?:\/\/\S+$/i.test(trimmedUrl);
  const canContinue = urlValid && !creating;
  const slugReady = slugState.status === "ok" ? slugState.slug : null;
  const canSubmit =
    title.trim().length > 0 && slugReady !== null && !creating;

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canContinue) {
      setUrlError(
        urlValid ? null : "Enter a full URL starting with http:// or https://."
      );
      return;
    }
    setUrlError(null);
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || !slugReady) return;
    setCreating(true);
    setError(null);
    try {
      const createdTitle = title.trim();
      await dispatch(
        createPageFromTemplate({
          templateId: template.id,
          title: createdTitle,
          slug: slugReady,
          ...(goal ? { goal } : {}),
          ...(trimmedUrl.length > 0 ? { initialUrl: trimmedUrl } : {}),
        })
      ).unwrap();
      toast.add({
        title: "Page created",
        description: `"${createdTitle}" is ready as a draft.`,
        type: "success",
      });
      onClose();
      router.push("/appv1/pages");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create the page. Try again.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="gap-0 rounded-none p-0 sm:max-w-lg">
        <DialogHeader className="border-b border-border/60 p-5 text-left">
          <DialogTitle className="text-lg font-bold">
            {step === 1 ? "What is this page for?" : `Create page from ${template.name}`}
          </DialogTitle>
          <DialogDescription>
            {step === 1
              ? "Add your main link and goal — your template blocks will be prefilled."
              : "This clones the template blocks into your own draft page."}
          </DialogDescription>
        </DialogHeader>
        {step === 1 ? (
          <form onSubmit={handleContinue} className="space-y-4 p-5">
            <div className="space-y-1.5">
              <Label htmlFor="pageUrl" className="text-xs font-semibold">
                Destination URL <span className="font-normal text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="pageUrl"
                value={destinationUrl}
                onChange={(e) => setDestinationUrl(e.target.value)}
                placeholder="https://your-link.com"
                inputMode="url"
              />
              {(urlError || (!urlValid && trimmedUrl.length > 0)) && (
                <p className="text-xs text-destructive">
                  {urlError ?? "Enter a full URL starting with http:// or https://."}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <span className="text-xs font-semibold">
                Goal <span className="font-normal text-muted-foreground">(optional)</span>
              </span>
              <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                {GOAL_OPTIONS.map((option) => {
                  const active = goal === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setGoal(active ? null : option.value)}
                      aria-pressed={active}
                      className={
                        active
                          ? "rounded-none border border-ember bg-ember/5 p-3 text-left"
                          : "rounded-none border border-border bg-card p-3 text-left hover:border-muted-foreground/40"
                      }
                    >
                      <span className="block text-xs font-bold text-foreground">
                        {option.label}
                      </span>
                      <span className="block text-[11px] text-muted-foreground">
                        {option.hint}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
            <DialogFooter className="p-0">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!canContinue}
                className="bg-ember text-on-ember hover:bg-ember/90"
              >
                Continue
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 p-5">
            <div className="space-y-1.5">
              <Label htmlFor="pageTitle" className="text-xs font-semibold">
                Page title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="pageTitle"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={120}
                placeholder="My awesome page"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pageSlug" className="text-xs font-semibold">
                Page URL <span className="text-destructive">*</span>
              </Label>
              <div className="flex items-center gap-1.5">
                <span className="shrink-0 text-sm text-muted-foreground">
                  {typeof window !== "undefined"
                    ? `${window.location.origin}/p/`
                    : "/p/"}
                </span>
                <div className="relative flex-1">
                  <Input
                    id="pageSlug"
                    value={slugInput}
                    onChange={(e) => setSlugInput(e.target.value)}
                    maxLength={50}
                    className="pr-9"
                    placeholder="my-page"
                  />
                  <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2">
                    {slugState.status === "checking" && (
                      <Loader2
                        className="h-4 w-4 animate-spin text-muted-foreground"
                        aria-hidden="true"
                      />
                    )}
                    {slugState.status === "ok" && (
                      <Check
                        className="h-4 w-4 text-ember"
                        aria-hidden="true"
                      />
                    )}
                    {slugState.status === "error" && (
                      <X className="h-4 w-4 text-destructive" aria-hidden="true" />
                    )}
                  </span>
                </div>
              </div>
              {slugState.status === "error" && (
                <p className="text-xs text-destructive">{slugState.message}</p>
              )}
              {slugState.status === "ok" && (
                <p className="text-xs text-muted-foreground">
                  This URL is available.
                </p>
              )}
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <DialogFooter className="p-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(1)}
                disabled={creating}
              >
                Back
              </Button>
              <Button
                type="submit"
                disabled={!canSubmit}
                className="bg-ember text-on-ember hover:bg-ember/90"
              >
                {creating && (
                  <Loader2
                    className="h-4 w-4 animate-spin"
                    aria-hidden="true"
                  />
                )}
                Create page
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}


