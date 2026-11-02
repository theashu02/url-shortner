import { CalendarDays, MousePointerClick, type LucideIcon } from "lucide-react";

export type SortBy = "createdAt" | "clicks";
export type SortOrder = "asc" | "desc";

export interface SortOption {
  value: SortBy;
  label: string;
  icon: LucideIcon;
}

export const SORT_OPTIONS: SortOption[] = [
  { value: "createdAt", label: "Date created", icon: CalendarDays },
  { value: "clicks", label: "Clicks", icon: MousePointerClick },
];

export function getActiveSortLabel(sortBy: SortBy): string {
  return sortBy === "clicks" ? "Clicks" : "Date";
}
