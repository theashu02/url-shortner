"use client";

import { MAX_BLOCK_ITEMS } from "@/server/lib/pages";
import { SocialLinkCard } from "./SocialLinkCard";
import { SocialQuickAdd } from "./SocialQuickAdd";

interface SocialItemsEditorProps {
  blockKey: string;
  items: Record<string, unknown>[];
  onPatchItems: (items: Record<string, unknown>[]) => void;
}

export function SocialItemsEditor({ blockKey, items, onPatchItems }: SocialItemsEditorProps) {
  const atLimit = items.length >= MAX_BLOCK_ITEMS;

  const patchOne = (index: number, patch: Record<string, unknown>) =>
    onPatchItems(items.map((entry, i) => (i === index ? { ...entry, ...patch } : entry)));

  const removeItem = (index: number) =>
    onPatchItems(items.filter((_, i) => i !== index));

  const addNetwork = (label: string, url = "") =>
    onPatchItems([...items, { network: label, url }]);

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <SocialLinkCard
          key={index}
          blockKey={blockKey}
          index={index}
          item={item}
          onPatch={(patch) => patchOne(index, patch)}
          onRemove={() => removeItem(index)}
        />
      ))}

      <SocialQuickAdd disabled={atLimit} onAddNetwork={addNetwork} />
    </div>
  );
}
