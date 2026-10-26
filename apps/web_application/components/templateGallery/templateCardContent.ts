import type { GalleryTemplate } from "./templateTypes";

export function headerCopy(template: GalleryTemplate): { title: string; subtitle: string } {
  const header = template.blocks.find((b) => b.type === "header");
  const props = (header?.props ?? {}) as Record<string, unknown>;
  const rawTitle = props["title"];
  const rawSubtitle = props["subtitle"];
  return {
    title:
      typeof rawTitle === "string" && rawTitle.trim().length > 0
        ? rawTitle.trim()
        : template.name,
    subtitle: typeof rawSubtitle === "string" ? rawSubtitle.trim() : "",
  };
}
