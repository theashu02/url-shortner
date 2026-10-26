import type { PageBlockInput } from "@/server/lib/pages";

export interface RowTheme {
  text: string;
  subtle: string;
  row: string;
  accent: string;
  dark: boolean;
  shape: string;
}

export interface BlockRowProps extends RowTheme {
  block: PageBlockInput;
  compact: boolean;
  interactive: boolean;
  onLinkClick?: (blockKey: string, href: string) => void;
}

export type BlockProps = Omit<BlockRowProps, "block"> & {
  props: Record<string, unknown>;
  blockKey: string;
  hidden: boolean | undefined;
}
