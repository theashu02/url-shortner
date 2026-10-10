"use client";

import {
  ArrowDown,
  ArrowDownWideNarrow,
  ArrowUp,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  fetchLinks,
  setSortBy,
  toggleSortOrder,
} from "@/store/my-links-slice";
import { SORT_OPTIONS, getActiveSortLabel, type SortBy } from "./sortOptions";

export function SortDropdown() {
  const dispatch = useAppDispatch();
  const sortBy = useAppSelector((state) => state.myLinks.sortBy);
  const sortOrder = useAppSelector((state) => state.myLinks.sortOrder);

  const handleSortChange = (by: SortBy) => {
    if (sortBy === by) {
      dispatch(toggleSortOrder());
    } else {
      dispatch(setSortBy(by));
    }
    setTimeout(
      () => dispatch(fetchLinks({ page: 1, append: false, force: true })),
      0,
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className="h-9 shrink-0 gap-1.5 rounded-none text-xs"
          >
            <ArrowDownWideNarrow className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">Sort:</span>
            <span className="font-semibold text-foreground">
              {getActiveSortLabel(sortBy)}
            </span>
            {sortOrder === "desc" ? (
              <ArrowDown className="h-3.5 w-3.5 text-muted-foreground" />
            ) : (
              <ArrowUp className="h-3.5 w-3.5 text-muted-foreground" />
            )}
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-48 rounded-none">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-[11px] tracking-widest uppercase">
            Sort by
          </DropdownMenuLabel>
          {SORT_OPTIONS.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => handleSortChange(option.value)}
              className="text-xs"
            >
              <option.icon className="h-3.5 w-3.5 text-muted-foreground" />
              <span>{option.label}</span>
              {sortBy === option.value && (
                <Check className="ml-auto h-3.5 w-3.5" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={() => handleSortChange(sortBy)}
            className="text-xs"
          >
            {sortOrder === "desc" ? (
              <>
                <ArrowUp className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Ascending</span>
              </>
            ) : (
              <>
                <ArrowDown className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Descending</span>
              </>
            )}
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
