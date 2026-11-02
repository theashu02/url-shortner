import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { headerCopy } from "./templateCardContent";
import { TemplatePreview } from "./templatePreview";
import type { GalleryTemplate } from "./templateTypes";

interface TemplateCardProps {
  template: GalleryTemplate;
  onUse: (template: GalleryTemplate) => void;
}

export function TemplateCard({ template, onUse }: TemplateCardProps) {
  const { title, subtitle } = headerCopy(template);

  return (
    <article className="group relative overflow-hidden rounded-xl bg-muted shadow-sm">
      <div aria-hidden="true" className="pointer-events-none h-80 w-full">
        <TemplatePreview template={template} compact />
      </div>

      {/* Hover overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-end gap-2 bg-linear-to-t from-black/80 via-black/30 to-transparent p-4 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        <div className="w-full text-center">
          <p className="truncate text-sm font-semibold text-white">{title}</p>
          {subtitle && (
            <p className="mt-0.5 line-clamp-1 text-xs text-white/70">{subtitle}</p>
          )}
        </div>
        <Button
          size="sm"
          onClick={() => onUse(template)}
          aria-label={`Use the ${template.name} template`}
          className="w-full gap-1.5"
        >
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
          Use template
        </Button>
      </div>
    </article>
  );
}
