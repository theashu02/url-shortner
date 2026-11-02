import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface PagesSearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function PagesSearchBar({ value, onChange }: PagesSearchBarProps) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative w-full sm:max-w-xs">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search pages"
          aria-label="Search pages"
          className="rounded-none pl-9"
        />
      </div>
    </div>
  );
}
