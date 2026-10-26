"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  FilterSidebar,
  TemplatesGrid,
  TemplatesHeader,
  TemplatesSkeleton,
  UseTemplateDialog,
  listTemplates,
  type GalleryTemplate,
} from "@/components/templateGallery";

export default function TemplatesPage() {
  const [active, setActive] = useState("all");
  const [templates, setTemplates] = useState<GalleryTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState<GalleryTemplate | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setTemplates(await listTemplates("all"));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const filtered = useMemo(
    () =>
      active === "all"
        ? templates
        : templates.filter((template) => template.useCase === active),
    [templates, active]
  );

  return (
    <div className="min-h-screen w-full bg-background px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto w-full max-w-7xl space-y-8">
        <TemplatesHeader />
        {error && (
          <div className="flex items-center gap-3 border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span className="flex-1">{error}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={load}
              className="h-8 border-destructive/30 text-xs hover:bg-destructive/10"
            >
              Retry
            </Button>
          </div>
        )}
        <div className="flex flex-col gap-8 lg:flex-row">
          <FilterSidebar active={active} onSelect={setActive} />
          {loading ? (
            <TemplatesSkeleton />
          ) : (
            <TemplatesGrid templates={filtered} onUse={setCreating} />
          )}
        </div>
      </div>

      {creating && (
        <UseTemplateDialog
          key={creating.id}
          template={creating}
          onClose={() => setCreating(null)}
        />
      )}
    </div>
  );
}
