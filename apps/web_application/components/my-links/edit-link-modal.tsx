"use client";

import { useState, useMemo } from "react";
import { Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useAppSelector, useAppDispatch } from "@/store";
import { setEditingLink, updateLink } from "@/store/my-links-slice";

export function EditLinkModal() {
  const dispatch = useAppDispatch();
  const link = useAppSelector((s) => s.myLinks.editingLink)!;

  const origin = useMemo(
    () => (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"),
    [],
  );

  const [url, setUrl] = useState(link.url);
  const [slug, setSlug] = useState(link.shortCode);
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
      await dispatch(updateLink({ id: link._id, url: formatted, slug: slug.trim() })).unwrap();
      // On success, the thunk sets editingLink to null automatically
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <Card className="w-full max-w-lg rounded-none border-border bg-card shadow-lg p-0">
        <CardHeader className="p-5 border-b border-border/60">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold text-foreground">Edit Link</CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Update destination URL and custom slug.
              </CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={handleClose} className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-none">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Destination URL */}
          <div className="space-y-1.5">
            <Label htmlFor="editUrl" className="text-xs font-semibold text-foreground">
              Destination URL <span className="text-destructive">*</span>
            </Label>
            <Input
              id="editUrl"
              type="url"
              required
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="h-10 text-sm bg-background border-input rounded-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          {/* Custom Slug */}
          <div className="space-y-1.5">
            <Label htmlFor="editSlug" className="text-xs font-semibold text-foreground">
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

          {error && (
            <p className="text-xs text-destructive bg-destructive/10 border border-destructive/20 p-2.5 font-medium">
              {error}
            </p>
          )}

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/60">
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading} className="h-9 px-4 text-xs rounded-none">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !url.trim()}
              className="h-9 px-5 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-none gap-1.5"
            >
              {loading ? (
                <><Loader2 className="h-3.5 w-3.5 animate-spin" /><span>Saving...</span></>
              ) : (
                <span>Save Changes</span>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
