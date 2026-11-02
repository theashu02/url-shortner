import { api } from "@/lib/eden";
import type { GalleryTemplate, TemplateCategory } from "./templateTypes";

export const TEMPLATE_CATEGORIES: TemplateCategory[] = [
  { value: "all", label: "All templates" },
  { value: "link-in-bio", label: "Link-in-bio" },
  { value: "products", label: "Products and services" },
  { value: "business-card", label: "Digital business card" },
  { value: "promotions", label: "Promotions" },
];

export function getUseCaseLabel(value: string): string {
  return (
    TEMPLATE_CATEGORIES.find((category) => category.value === value)?.label ??
    value
  );
}

function matchesCategory(template: GalleryTemplate, category: string): boolean {
  return category === "all" || template.useCase === category;
}

export async function listTemplates(
  category = "all"
): Promise<GalleryTemplate[]> {
  const res = await api.pages.templates.get();
  if (
    res.data &&
    "templates" in res.data &&
    Array.isArray(res.data.templates)
  ) {
    const templates = res.data.templates as GalleryTemplate[];
    return templates.filter((template) => matchesCategory(template, category));
  }
  if (res.data && "message" in res.data) {
    throw new Error(String(res.data.message));
  }
  throw new Error("Failed to load templates");
}
