import type { GalleryTemplate } from "./templateTypes";
import { TemplateCard } from "./templateCard";

export function TemplatesSkeleton() {
  return (
    <div
      className="grid flex-1 grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
      aria-label="Loading templates"
    >
      {[0, 1, 2, 3].map((index) => (
        <div key={index} className="space-y-2.5">
          <div className="h-80 animate-pulse bg-muted" />
          <div className="h-4 w-1/2 animate-pulse bg-muted" />
        </div>
      ))}
    </div>
  );
}

export function TemplatesEmpty() {
  return (
    <div className="flex flex-1 items-center justify-center border border-dashed border-border px-6 py-20 text-center">
      <p className="max-w-sm text-sm text-muted-foreground">
        No templates in this category yet. Try another use case.
      </p>
    </div>
  );
}

interface TemplatesGridProps {
  templates: GalleryTemplate[];
  onUse: (template: GalleryTemplate) => void;
}

export function TemplatesGrid({ templates, onUse }: TemplatesGridProps) {
  if (templates.length === 0) return <TemplatesEmpty />;

  return (
    <div className="grid flex-1 grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {templates.map((template) => (
        <TemplateCard key={template.id} template={template} onUse={onUse} />
      ))}
    </div>
  );
}
