import { useMemo } from "react";
import { validatePageBlocks } from "@/server/lib/pages";
import type { PageBlockInput } from "@/server/lib/pages";
import type { UsePageDraft } from "../usePageDraft";
import { BlockForm } from "./BlockForm";
import { BlockMetaForm } from "./BlockMetaForm";

export function BlockDetailsSection({ draft }: { draft: UsePageDraft }) {
  const { selectedBlock } = draft;

  const blockErrors = useMemo(() => {
    if (!selectedBlock) return [];
    return validatePageBlocks([{ ...selectedBlock, position: 0 }]).map((message) =>
      message.replace(/^blocks\[0\]\./, "")
    );
  }, [selectedBlock]);

  const patchProps = (block: PageBlockInput, patch: Record<string, unknown>) => {
    draft.updateBlockProps(block.key, { ...(block.props ?? {}), ...patch });
  };

  return (
    <section className="space-y-3 rounded-none border border-border bg-card p-4">
      <h2 className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
        Block details
      </h2>
      {!selectedBlock ? (
        <p className="rounded-none border border-dashed border-border px-3 py-6 text-center text-xs text-muted-foreground">
          Select a block on the left to edit its content.
        </p>
      ) : (
        <div className="space-y-3">
          <BlockForm
            block={selectedBlock}
            onPatch={(patch) => patchProps(selectedBlock, patch)}
            onPatchItems={(items) => patchProps(selectedBlock, { items })}
          />
          <BlockMetaForm block={selectedBlock} draft={draft} />
          {blockErrors.length > 0 && (
            <ul className="space-y-1 rounded-none bg-destructive/10 p-3 text-xs text-destructive">
              {blockErrors.map((message) => (
                <li key={message}>{message}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}
