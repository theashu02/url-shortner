import type { PageTemplateSeedBlock } from "@/server/lib/pageTemplates";

export interface PageTemplate {
  id: string;
  name: string;
  useCase: string;
  theme: {
    header: string;
    card: string;
    accent: string;
    dark: boolean;
  };
}

export interface GalleryTemplate extends PageTemplate {
  blockCount: number;
  blocks: PageTemplateSeedBlock[];
}

export interface TemplateCategory {
  value: string;
  label: string;
}
