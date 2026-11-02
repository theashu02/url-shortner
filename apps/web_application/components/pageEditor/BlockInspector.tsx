"use client";

import type { UsePageDraft } from "./usePageDraft";
import { AppearanceSection } from "./inspector/AppearanceSection";
import { BlockDetailsSection } from "./inspector/BlockDetailsSection";

export function BlockInspector({ draft }: { draft: UsePageDraft }) {
  return (
    <div className="flex flex-col gap-5">
      <AppearanceSection draft={draft} />
      <BlockDetailsSection draft={draft} />
    </div>
  );
}

