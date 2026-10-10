"use client";

import { SearchInput } from "./searchInput";
import { SortDropdown } from "./sortDropdown";

export function LinksSearchBar() {
  return (
    <div className="flex flex-col items-stretch gap-3 border bg-card p-3 sm:flex-row sm:items-center">
      <SearchInput />
      <SortDropdown />
    </div>
  );
}
