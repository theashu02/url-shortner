"use client";

import { Check, ChevronDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
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
import { TEMPLATE_CATEGORIES } from "./templatesData";

interface FilterSidebarProps {
  active: string;
  onSelect: (value: string) => void;
}

export function FilterSidebar({ active, onSelect }: FilterSidebarProps) {
  const [all, ...byUseCase] = TEMPLATE_CATEGORIES;
  const selected =
    TEMPLATE_CATEGORIES.find((category) => category.value === active) ?? all;

  return (
    <aside className="w-full shrink-0 lg:w-56" aria-label="Template filters">
      <Button
        variant="outline"
        className="w-full gap-1.5 border-ember text-ember hover:bg-mist hover:text-ember lg:w-auto"
        title="Blank canvas editor is coming soon"
        disabled
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
        Start from scratch
      </Button>

      <div className="mt-4 lg:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger
            className="flex w-full items-center justify-between rounded-lg border border-border bg-card px-3 py-2.5 text-sm font-semibold text-foreground outline-none hover:bg-mist focus-visible:ring-1 focus-visible:ring-ember"
            aria-label="Filter templates by use case"
          >
            {selected.label}
            <ChevronDown className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64 rounded-lg">
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={() => onSelect(all.value)}
                className={cn(active === all.value && "font-bold text-ember")}
              >
                {all.label}
                {active === all.value && (
                  <Check className="ml-auto h-4 w-4" aria-hidden="true" />
                )}
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-[11px] tracking-widest uppercase">
                By use case
              </DropdownMenuLabel>
              {byUseCase.map((category) => (
                <DropdownMenuItem
                  key={category.value}
                  onClick={() => onSelect(category.value)}
                  className={cn(
                    active === category.value && "font-bold text-ember",
                  )}
                >
                  {category.label}
                  {active === category.value && (
                    <Check className="ml-auto h-4 w-4" aria-hidden="true" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-6 hidden flex-col gap-2 lg:flex">
        <FilterDesktopButton
          value={all.value}
          label={all.label}
          active={active === all.value}
          onSelect={onSelect}
        />
        <p className="px-3 pt-2 text-sm font-bold text-foreground">By use case</p>
        {byUseCase.map((category) => (
          <FilterDesktopButton
            key={category.value}
            value={category.value}
            label={category.label}
            active={active === category.value}
            onSelect={onSelect}
          />
        ))}
      </div>
    </aside>
  );
}

function FilterDesktopButton({
  value,
  label,
  active,
  onSelect,
}: {
  value: string;
  label: string;
  active: boolean;
  onSelect: (value: string) => void;
}) {
  return (
    <Button
      variant="ghost"
      onClick={() => onSelect(value)}
      aria-pressed={active}
      className={cn(
        "relative justify-start rounded-none px-3 py-5 text-md font-normal",
        active
          ? "bg-inkband font-bold text-on-inkband hover:bg-inkband hover:text-on-inkband"
          : "text-muted-foreground hover:bg-mist hover:text-foreground",
      )}
    >
      <span
        className={cn(
          "absolute top-1/2 left-0 h-5 w-1 -translate-y-1/2 bg-ember transition-opacity",
          active ? "opacity-100" : "opacity-0",
        )}
        aria-hidden="true"
      />
      {label}
    </Button>
  );
}
