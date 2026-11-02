import { PageRenderer } from "@/components/pageBlocks";
import type { GalleryTemplate } from "./templateTypes";

export function TemplatePreview({
  template,
  compact = false,
  className,
}: {
  template: GalleryTemplate;
  compact?: boolean;
  className?: string;
}) {
  return (
    <PageRenderer
      title={template.name}
      theme={template.theme}
      blocks={template.blocks}
      compact={compact}
      className={className}
    />
  );
}
