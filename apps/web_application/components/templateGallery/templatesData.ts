import type { PageTemplate, TemplateCategory } from "./templateTypes";

export const TEMPLATE_CATEGORIES: TemplateCategory[] = [
  { value: "all", label: "All templates" },
  { value: "link-in-bio", label: "Link-in-bio" },
  { value: "products", label: "Products and services" },
  { value: "business-card", label: "Digital business card" },
  { value: "promotions", label: "Promotions" },
];

const MOCK_TEMPLATES: PageTemplate[] = [
  {
    id: "hearth-home",
    name: "Hearth and Home",
    useCase: "business-card",
    theme: { header: "#E8D9C4", card: "#FAF6EF", accent: "#E4572E", dark: false },
  },
  {
    id: "grand-hotel",
    name: "The Grand Hotel",
    useCase: "business-card",
    theme: { header: "#1B7F7A", card: "#FFFFFF", accent: "#1B7F7A", dark: false },
  },
  {
    id: "the-brew",
    name: "The Brew Coffee",
    useCase: "products",
    theme: { header: "#2B2B2B", card: "#232326", accent: "#E4572E", dark: true },
  },
  {
    id: "oasis-wellness",
    name: "Oasis Wellness",
    useCase: "business-card",
    theme: { header: "#1B7F7A", card: "#E9E4D8", accent: "#101418", dark: false },
  },
  {
    id: "creator-links",
    name: "Creator Links",
    useCase: "link-in-bio",
    theme: { header: "#E4572E", card: "#FAF6EF", accent: "#E4572E", dark: false },
  },
  {
    id: "launch-drop",
    name: "Launch Drop",
    useCase: "promotions",
    theme: { header: "#101418", card: "#FFFFFF", accent: "#F5C518", dark: false },
  },
  {
    id: "event-night",
    name: "Event Night",
    useCase: "promotions",
    theme: { header: "#3D0E2E", card: "#2A0A20", accent: "#F5C518", dark: true },
  },
  {
    id: "shop-shelf",
    name: "Shop Shelf",
    useCase: "products",
    theme: { header: "#F5C518", card: "#FAF6EF", accent: "#101418", dark: false },
  },
];

function matchesCategory(template: PageTemplate, category: string): boolean {
  return category === "all" || template.useCase === category;
}

// Backend seam: replace the mock body with a fetch to the templates API.
// The route already consumes this as an async source with loading state.
export async function listTemplates(category = "all"): Promise<PageTemplate[]> {
  await new Promise((resolve) => setTimeout(resolve, 250));
  return MOCK_TEMPLATES.filter((template) =>
    matchesCategory(template, category),
  );
}
