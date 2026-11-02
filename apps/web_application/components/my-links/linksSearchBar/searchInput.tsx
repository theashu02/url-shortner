"use client";

import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppDispatch, useAppSelector } from "@/store";
import { setSearch } from "@/store/my-links-slice";

export function SearchInput() {
  const dispatch = useAppDispatch();
  const search = useAppSelector((state) => state.myLinks.search);

  return (
    <div className="relative flex-1">
      <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder="Search by short code or destination URL..."
        value={search}
        onChange={(event) => dispatch(setSearch(event.target.value))}
        className="h-9 rounded-none bg-background pr-8 pl-9 text-sm"
      />
      {search && (
        <Button
          size="xs"
          variant="ghost"
          aria-label="Clear search"
          onClick={() => dispatch(setSearch(""))}
          className="absolute top-1/2 right-2.5 -translate-y-1/2"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
}
