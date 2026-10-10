"use client";

import { useState, useMemo } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAppSelector, useAppDispatch } from "@/store";
import { setEditingLink, updateLink } from "@/store/my-links-slice";

export function EditLinkModal() {
  const dispatch = useAppDispatch();
  const link = useAppSelector((s) => s.myLinks.editingLink)!;

  const origin = useMemo(
    () => (typeof window !== "undefined" ? window.location.origin : process.env.NEXTAUTH_URL ?? ""),
    [],
  );

  const [url, setUrl] = useState(link.url);
  const [slug, setSlug] = useState(link.shortCode);
  const [deviceCapture, setDeviceCapture] = useState(link.deviceCapture === true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const host = origin.replace(/^https?:\/\//, "");

  const handleClose = () => dispatch(setEditingLink(null));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formatted = /^https?:\/\//i.test(url.trim()) ? url.trim() : `https://${url.trim()}`;

    setLoading(true);
    setError(null);
    try {
      await dispatch(updateLink({ id: link._id, url: formatted, slug: slug.trim(), deviceCapture })).unwrap();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-lg rounded-none p-0 gap-0">
        <DialogHeader className="p-5 border-b border-border/60">
          <DialogTitle className="text-lg font-bold">Edit Link</DialogTitle>
          <DialogDescription>
            Update destination URL, custom slug, and capture settings.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="editUrl" className="text-xs font-semibold">
              Destination URL <span className="text-destructive">*</span>
            </Label>
            <Input
              id="editUrl"
              type="url"
              required
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="h-10 text-sm rounded-none"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="editSlug" className="text-xs font-semibold">
              Custom Alias (Slug)
            </Label>
            <div className="flex h-10 border border-input bg-muted/20 focus-within:ring-1 focus-within:ring-ring">
              <span className="flex items-center px-3 border-r border-border bg-muted/40 text-muted-foreground text-xs font-mono select-none shrink-0">
                {host}/
              </span>
              <Input
                id="editSlug"
                type="text"
                placeholder="custom-alias"
                value={slug}
                onChange={(e) =>
                  setSlug(e.target.value.replace(/[^a-zA-Z0-9-]/g, "").slice(0, 50))
                }
                className="flex-1 h-full border-0 bg-transparent px-3 text-sm shadow-none focus-visible:ring-0 rounded-none font-mono"
              />
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 p-3 bg-muted/20 border border-border/60">
            <div className="space-y-0.5">
              <Label htmlFor="editDeviceCapture" className="text-xs font-semibold">
                Device information capture
              </Label>
              <p className="text-[11px] text-muted-foreground">
                Show visitors a preview page and record device details for analytics.
              </p>
            </div>
            <Switch
              id="editDeviceCapture"
              checked={deviceCapture}
              onCheckedChange={setDeviceCapture}
            />
          </div>

          {error && (
            <p className="text-xs text-destructive bg-destructive/10 border border-destructive/20 p-2.5 font-medium">
              {error}
            </p>
          )}

          <DialogFooter className="gap-2 pt-1">
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading} className="h-9 px-4 text-xs rounded-none">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !url.trim()}
              className="h-9 px-5 text-xs font-semibold rounded-none gap-1.5"
            >
              {loading ? (
                <><Loader2 className="h-3.5 w-3.5 animate-spin" /><span>Saving...</span></>
              ) : (
                <span>Save Changes</span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
