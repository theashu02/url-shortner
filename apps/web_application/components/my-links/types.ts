export type LinkItem = {
  _id: string;
  shortCode: string;
  url: string;
  clicks: number;
  createdAt: string;
  updatedAt: string;
  __v?: number;
};

export interface LinksSearchBarProps {
  search: string;
  sortBy: "createdAt" | "clicks";
  sortOrder: "asc" | "desc";
  onSearchChange: (value: string) => void;
  onSortChange: (by: "createdAt" | "clicks") => void;
  onSortOrderToggle: () => void;
}

export interface LinksTableProps {
  links: LinkItem[];
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  totalCount: number;
  debouncedSearch: string;
  copiedId: string | null;
  deletingId: string | null;
  origin: string;
  onCopy: (id: string, text: string) => void;
  onEdit: (link: LinkItem) => void;
  onQr: (link: LinkItem) => void;
  onDelete: (id: string) => void;
}