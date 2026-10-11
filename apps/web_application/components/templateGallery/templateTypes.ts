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

export interface TemplateCategory {
  value: string;
  label: string;
}
