import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MAX_BLOCK_ITEMS } from "@/server/lib/pages";
import { Field } from "./Field";
import { asString } from "./fieldUtils";

export function ProductForm({
  blockKey,
  items,
  onPatchItems,
}: {
  blockKey: string;
  items: Record<string, unknown>[];
  onPatchItems: (items: Record<string, unknown>[]) => void;
}) {
  return (
    <div className="space-y-2.5">
      {items.map((item, index) => (
        <div key={index} className="space-y-2 rounded-none border border-border/70 p-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-muted-foreground">
              Product {index + 1}
            </span>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onPatchItems(items.filter((_, i) => i !== index))}
              aria-label={"Remove product " + (index + 1)}
              className="h-7 w-7 text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            </Button>
          </div>
          <Field id={blockKey + "-pname-" + index} label="Name">
            <Input
              id={blockKey + "-pname-" + index}
              value={asString(item["name"])}
              maxLength={120}
              onChange={(e) =>
                onPatchItems(items.map((entry, i) => (i === index ? { ...entry, name: e.target.value } : entry)))
              }
            />
          </Field>
          <Field id={blockKey + "-purl-" + index} label="URL">
            <Input
              id={blockKey + "-purl-" + index}
              value={asString(item["url"])}
              placeholder="https://…"
              onChange={(e) =>
                onPatchItems(items.map((entry, i) => (i === index ? { ...entry, url: e.target.value } : entry)))
              }
            />
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <Field id={blockKey + "-pprice-" + index} label="Price">
              <Input
                id={blockKey + "-pprice-" + index}
                value={asString(item["price"])}
                maxLength={40}
                placeholder="$19"
                onChange={(e) =>
                  onPatchItems(items.map((entry, i) => (i === index ? { ...entry, price: e.target.value } : entry)))
                }
              />
            </Field>
            <Field id={blockKey + "-pimg-" + index} label="Image">
              <Input
                id={blockKey + "-pimg-" + index}
                value={asString(item["imageUrl"])}
                placeholder="https://… or /p.png"
                onChange={(e) =>
                  onPatchItems(items.map((entry, i) => (i === index ? { ...entry, imageUrl: e.target.value } : entry)))
                }
              />
            </Field>
          </div>
        </div>
      ))}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPatchItems([...items, { name: "New product", price: "", url: "https://example.com" }])}
        disabled={items.length >= MAX_BLOCK_ITEMS}
        className="w-full gap-1.5"
      >
        <Plus className="h-3.5 w-3.5" aria-hidden="true" />
        Add product
      </Button>
    </div>
  );
}
