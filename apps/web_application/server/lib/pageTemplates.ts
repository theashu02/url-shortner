import type { PageBlockType, PageTheme } from "./pages";

export type PageTemplateUseCase =
  | "link-in-bio"
  | "products"
  | "business-card"
  | "promotions";

export interface PageTemplateSeedBlock {
  key: string;
  type: PageBlockType;
  position: number;
  visible: boolean;
  props: Record<string, unknown>;
}

export interface PageTemplateSeed {
  id: string;
  name: string;
  useCase: PageTemplateUseCase;
  theme: PageTheme;
  defaultBlocks: PageTemplateSeedBlock[];
}

export const PAGE_TEMPLATE_SEEDS: PageTemplateSeed[] = [
  {
    id: "creator-links",
    name: "Creator Links",
    useCase: "link-in-bio",
    theme: { header: "#E4572E", card: "#FAF6EF", accent: "#E4572E", dark: false },
    defaultBlocks: [
      {
        key: "creator-links-header",
        type: "header",
        position: 0,
        visible: true,
        props: {
          title: "Maya Creates",
          subtitle: "Short films, photo zines, and monthly drops",
        },
      },
      {
        key: "creator-links-social",
        type: "social",
        position: 1,
        visible: true,
        props: {
          items: [
            { network: "Instagram", url: "https://instagram.com/your-handle" },
            { network: "YouTube", url: "https://youtube.com/@your-handle" },
            { network: "TikTok", url: "https://tiktok.com/@your-handle" },
          ],
        },
      },
      {
        key: "creator-links-links",
        type: "links",
        position: 2,
        visible: true,
        props: {
          style: "stack",
          items: [
            { label: "Watch the latest film", url: "https://example.com/latest-film" },
            { label: "Pre-order the photo zine", url: "https://example.com/photo-zine" },
            { label: "Join the newsletter", url: "https://example.com/newsletter" },
            { label: "Support my work", url: "https://example.com/support" },
          ],
        },
      },
      {
        key: "creator-links-about",
        type: "text",
        position: 3,
        visible: true,
        props: {
          heading: "About",
          body: "I make short films and photo zines about city life. New work lands here first.",
        },
      },
    ],
  },
  {
    id: "shop-shelf",
    name: "Shop Shelf",
    useCase: "products",
    theme: { header: "#F5C518", card: "#FAF6EF", accent: "#101418", dark: false },
    defaultBlocks: [
      {
        key: "shop-shelf-header",
        type: "header",
        position: 0,
        visible: true,
        props: {
          title: "Golden Hour Goods",
          subtitle: "Small-batch candles and ceramics",
        },
      },
      {
        key: "shop-shelf-products",
        type: "product",
        position: 1,
        visible: true,
        props: {
          items: [
            { name: "Ember Candle", price: "$28", url: "https://shop.example.com/ember-candle" },
            { name: "Stoneware Mug", price: "$34", url: "https://shop.example.com/stoneware-mug" },
            { name: "Lavender Bundle", price: "$18", url: "https://shop.example.com/lavender-bundle" },
          ],
        },
      },
      {
        key: "shop-shelf-links",
        type: "links",
        position: 2,
        visible: true,
        props: {
          style: "stack",
          items: [
            { label: "Shop all products", url: "https://shop.example.com" },
            { label: "Shipping and returns", url: "https://shop.example.com/shipping" },
            { label: "Wholesale inquiries", url: "https://shop.example.com/wholesale" },
          ],
        },
      },
      {
        key: "shop-shelf-note",
        type: "text",
        position: 3,
        visible: true,
        props: {
          heading: "Holiday market",
          body: "Find us at the Riverside Holiday Market, December 12-14. Online orders ship in 2 days.",
        },
      },
    ],
  },
  {
    id: "hearth-home",
    name: "Hearth and Home",
    useCase: "business-card",
    theme: { header: "#E8D9C4", card: "#FAF6EF", accent: "#E4572E", dark: false },
    defaultBlocks: [
      {
        key: "hearth-home-header",
        type: "header",
        position: 0,
        visible: true,
        props: {
          title: "Hearth and Home",
          subtitle: "Ava Stone, licensed real estate agent",
        },
      },
      {
        key: "hearth-home-links",
        type: "links",
        position: 1,
        visible: true,
        props: {
          style: "stack",
          items: [
            { label: "Browse listings", url: "https://hearth.example.com/listings" },
            { label: "Book a tour", url: "https://hearth.example.com/book-a-tour" },
            { label: "Our website", url: "https://hearth.example.com" },
          ],
        },
      },
      {
        key: "hearth-home-social",
        type: "social",
        position: 2,
        visible: true,
        props: {
          items: [
            { network: "LinkedIn", url: "https://linkedin.com/in/your-name" },
            { network: "Instagram", url: "https://instagram.com/your-handle" },
          ],
        },
      },
      {
        key: "hearth-home-contact",
        type: "text",
        position: 3,
        visible: true,
        props: {
          heading: "Contact",
          body: "Call or text (555) 123-4567, or write to ava@hearth.example.com. Office hours Monday to Saturday, 9am to 6pm.",
        },
      },
    ],
  },
  {
    id: "launch-drop",
    name: "Launch Drop",
    useCase: "promotions",
    theme: { header: "#101418", card: "#FFFFFF", accent: "#F5C518", dark: false },
    defaultBlocks: [
      {
        key: "launch-drop-header",
        type: "header",
        position: 0,
        visible: true,
        props: {
          title: "Nova Headphones",
          subtitle: "Drop 02 goes live Friday at noon",
        },
      },
      {
        key: "launch-drop-announcement",
        type: "text",
        position: 1,
        visible: true,
        props: {
          heading: "What is new",
          body: "40-hour battery, studio-tuned drivers, and three new colors. The early access list gets 15 percent off.",
        },
      },
      {
        key: "launch-drop-links",
        type: "links",
        position: 2,
        visible: true,
        props: {
          style: "stack",
          items: [
            { label: "Get early access", url: "https://nova.example.com/early-access" },
            { label: "Watch the teaser", url: "https://example.com/nova-teaser" },
            { label: "Compare models", url: "https://nova.example.com/compare" },
          ],
        },
      },
      {
        key: "launch-drop-social",
        type: "social",
        position: 3,
        visible: true,
        props: {
          items: [
            { network: "X", url: "https://x.com/your-handle" },
            { network: "Instagram", url: "https://instagram.com/your-handle" },
            { network: "YouTube", url: "https://youtube.com/@your-handle" },
          ],
        },
      },
    ],
  },
];

export function getPageTemplateSeed(id: string): PageTemplateSeed | undefined {
  return PAGE_TEMPLATE_SEEDS.find((template) => template.id === id);
}

export function buildSeedBlocks(templateId: string): PageTemplateSeedBlock[] {
  const seed = getPageTemplateSeed(templateId);
  if (!seed) return [];
  return JSON.parse(JSON.stringify(seed.defaultBlocks)) as PageTemplateSeedBlock[];
}
