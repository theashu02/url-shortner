"use client";

import { useRef, useState } from "react";
import {
  AtSign,
  ChevronDown,
  ChevronUp,
  Copy,
  Eye,
  EyeOff,
  GripVertical,
  Heading,
  Image,
  Link2,
  Mail,
  Minus,
  MoveVertical,
  Plus,
  ShoppingBag,
  Trash2,
  Type,
  Video,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PAGE_BLOCK_TYPES } from "@/server/lib/pages";
import type { PageBlockInput, PageBlockType } from "@/server/lib/pages";

const BLOCK_META: Record<PageBlockType, { label: string; icon: typeof Type }> = {
  header: { label: "Header", icon: Heading },
  text: { label: "Text", icon: Type },
  links: { label: "Links", icon: Link2 },
  image: { label: "Image", icon: Image },
  social: { label: "Social", icon: AtSign },
  product: { label: "Product", icon: ShoppingBag },
  video: { label: "Video", icon: Video },
  contact: { label: "Contact", icon: Mail },
  spacer: { label: "Spacer", icon: MoveVertical },
  divider: { label: "Divider", icon: Minus },
};

function blockTitle(block: PageBlockInput): string {
  const props = block.props ?? {};
  const first = (value: unknown) =>
    typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
  if (block.type === "header") return first(props["title"]) ?? "Header";
  if (block.type === "text")
    return first(props["heading"]) ?? first(props["body"]) ?? "Text";
  if (block.type === "image") return first(props["alt"]) ?? "Image";
  if (block.type === "video") return first(props["title"]) ?? "Video";
  if (block.type === "contact") return first(props["name"]) ?? "Contact";
  return BLOCK_META[block.type as PageBlockType]?.label ?? block.type;
}

interface BlockListProps {
  blocks: PageBlockInput[];
  selectedKey: string | null;
  onSelect: (key: string) => void;
  onAdd: (type: PageBlockType) => void;
  onRemove: (key: string) => void;
  onDuplicate: (key: string) => void;
  onToggle: (key: string) => void;
  onMove: (key: string, delta: -1 | 1) => void;
  onReorder: (fromKey: string, toKey: string) => void;
}

export function BlockList({
  blocks,
  selectedKey,
  onSelect,
  onAdd,
  onRemove,
  onDuplicate,
  onToggle,
  onMove,
  onReorder,
}: BlockListProps) {
  const dragKey = useRef<string | null>(null);
  const [dropKey, setDropKey] = useState<string | null>(null);
  const ordered = [...blocks].sort((a, b) => a.position - b.position);

  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-1.5">
        <p className="px-1 text-xs font-bold tracking-wider text-muted-foreground uppercase">
          Add block
        </p>
        <div className="grid grid-cols-3 gap-1.5">
          {PAGE_BLOCK_TYPES.map((type) => {
            const meta = BLOCK_META[type];
            const Icon = meta.icon;
            return (
              <Button
                key={type}
                variant="outline"
                size="sm"
                onClick={() => onAdd(type)}
                className="h-auto flex-col gap-1 py-2.5 text-[11px]"
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {meta.label}
              </Button>
            );
          })}
        </div>
      </div>

      <div className="space-y-1.5">
        <p className="px-1 text-xs font-bold tracking-wider text-muted-foreground uppercase">
          Blocks · {blocks.length}
        </p>
        {ordered.length === 0 && (
          <p className="rounded-none border border-dashed border-border px-3 py-6 text-center text-xs text-muted-foreground">
            No blocks yet. Add one above to start building.
          </p>
        )}
        <ul className="space-y-1.5">
          {ordered.map((block, index) => {
            const meta = BLOCK_META[block.type as PageBlockType];
            const Icon = meta?.icon ?? Type;
            const selected = block.key === selectedKey;
            const hidden = block.visible === false;
            return (
              <li key={block.key}>
                <div
                  role="button"
                  tabIndex={0}
                  draggable
                  onClick={() => onSelect(block.key)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSelect(block.key);
                    }
                  }}
                  onDragStart={(e) => {
                    dragKey.current = block.key;
                    e.dataTransfer.effectAllowed = "move";
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    if (block.key !== dragKey.current) setDropKey(block.key);
                  }}
                  onDragLeave={() => {
                    if (dropKey === block.key) setDropKey(null);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (dragKey.current && dragKey.current !== block.key) {
                      onReorder(dragKey.current, block.key);
                    }
                    dragKey.current = null;
                    setDropKey(null);
                  }}
                  onDragEnd={() => {
                    dragKey.current = null;
                    setDropKey(null);
                  }}
                  aria-label={`Select ${blockTitle(block)} block. Drag to reorder.`}
                  className={cn(
                    "flex cursor-pointer items-center gap-2 rounded-none border px-2 py-2 text-left outline-none transition-colors",
                    selected
                      ? "border-ember bg-ember/5"
                      : "border-border bg-card hover:border-muted-foreground/40",
                    dropKey === block.key && "border-ember ring-1 ring-ember",
                    hidden && "opacity-55"
                  )}
                >
                  <GripVertical
                    className="h-4 w-4 shrink-0 cursor-grab text-muted-foreground"
                    aria-hidden="true"
                  />
                  <Icon
                    className="h-4 w-4 shrink-0 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-semibold text-foreground">
                      {blockTitle(block)}
                    </span>
                    <span className="block text-[11px] text-muted-foreground capitalize">
                      {meta?.label ?? block.type}
                      {hidden ? " · hidden" : ""}
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onMove(block.key, -1);
                      }}
                      disabled={index === 0}
                      aria-label={`Move ${blockTitle(block)} up`}
                      className="h-7 w-7"
                    >
                      <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onMove(block.key, 1);
                      }}
                      disabled={index === ordered.length - 1}
                      aria-label={`Move ${blockTitle(block)} down`}
                      className="h-7 w-7"
                    >
                      <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggle(block.key);
                      }}
                      aria-label={hidden ? "Show block" : "Hide block"}
                      className="h-7 w-7"
                    >
                      {hidden ? (
                        <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
                      ) : (
                        <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDuplicate(block.key);
                      }}
                      aria-label={`Duplicate ${blockTitle(block)}`}
                      className="h-7 w-7"
                    >
                      <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemove(block.key);
                      }}
                      aria-label={`Delete ${blockTitle(block)}`}
                      className="h-7 w-7 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    </Button>
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
        {ordered.length > 0 && (
          <p className="flex items-center gap-1.5 px-1 pt-1 text-[11px] text-muted-foreground">
            <Plus className="h-3 w-3" aria-hidden="true" />
            Drag a block to reorder, or use the arrow buttons.
          </p>
        )}
      </div>
    </div>
  );
}

