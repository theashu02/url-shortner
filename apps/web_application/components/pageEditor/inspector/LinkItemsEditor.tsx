import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MAX_BLOCK_ITEMS } from "@/server/lib/pages";
import { LinkShortPicker } from "../LinkShortPicker";
import { Field } from "./Field";
import { asString } from "./fieldUtils";

interface LinkItemsEditorProps {
  blockKey: string;
  items: Record<string, unknown>[];
  addLabel: string;
  newItem: Record<string, unknown>;
  onPatchItems: (items: Record<string, unknown>[]) => void;
  enableShortLinks?: boolean;
  renderFirstField: (
    item: Record<string, unknown>,
    index: number,
    patch: (patch: Record<string, unknown>) => void
  ) => React.ReactNode;
}

export function LinkItemsEditor({
  blockKey,
  items,
  addLabel,
  newItem,
  onPatchItems,
  enableShortLinks = false,
  renderFirstField,
}: LinkItemsEditorProps) {
  const patchOne = (index: number, patch: Record<string, unknown>) => {
    onPatchItems(items.map((entry, i) => (i === index ? { ...entry, ...patch } : entry)));
  };

  return (
    <div className="space-y-2.5">
      {items.map((item, index) => (
        <div key={index} className="space-y-2 rounded-none border border-border/70 p-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-muted-foreground">
              Item {index + 1}
            </span>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onPatchItems(items.filter((_, i) => i !== index))}
              aria-label={"Remove item " + (index + 1)}
              className="h-7 w-7 text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            </Button>
          </div>
          {renderFirstField(item, index, (patch) => patchOne(index, patch))}
          <Field id={blockKey + "-url-" + index} label="URL">
            <Input
              id={blockKey + "-url-" + index}
              value={asString(item["url"])}
              placeholder="https://…"
              onChange={(e) => patchOne(index, { url: e.target.value })}
            />
          </Field>
          {enableShortLinks && (
            <div className="space-y-1">
              <span className="text-xs font-medium">Short link</span>
              <LinkShortPicker
                itemKey={blockKey + "-item-" + index}
                itemUrl={asString(item["url"])}
                shortCode={typeof item["shortCode"] === "string" ? (item["shortCode"] as string) : undefined}
                onSelect={(code) =>
                  onPatchItems(
                    items.map((entry, i) => {
                      if (i !== index) return entry;
                      const next = { ...entry };
                      if (code) next["shortCode"] = code;
                      else delete next["shortCode"];
                      return next;
                    })
                  )
                }
              />
            </div>
          )}
        </div>
      ))}
      <AddItemButton
        label={addLabel}
        disabled={items.length >= MAX_BLOCK_ITEMS}
        onClick={() => onPatchItems([...items, { ...newItem }])}
      />
    </div>
  );
}

export function AddItemButton({
  label,
  disabled,
  onClick,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <Button variant="outline" size="sm" onClick={onClick} disabled={disabled} className="w-full gap-1.5">
      <Plus className="h-3.5 w-3.5" aria-hidden="true" />
      {label}
    </Button>
  );
}
