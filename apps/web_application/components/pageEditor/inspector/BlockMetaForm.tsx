import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  PINNABLE_BLOCK_TYPES,
  SCHEDULABLE_BLOCK_TYPES,
  isPageBlockType,
} from "@/server/lib/pages";
import type { PageBlockInput } from "@/server/lib/pages";
import type { UsePageDraft } from "../usePageDraft";
import { Field } from "./Field";
import { fromLocalInput, toLocalInput } from "./fieldUtils";

export function BlockMetaForm({ block, draft }: { block: PageBlockInput; draft: UsePageDraft }) {
  const canPin =
    isPageBlockType(block.type) && (PINNABLE_BLOCK_TYPES as string[]).includes(block.type);
  const canSchedule =
    isPageBlockType(block.type) && (SCHEDULABLE_BLOCK_TYPES as string[]).includes(block.type);
  if (!canPin && !canSchedule) return null;

  return (
    <div className="space-y-3 rounded-none border border-border/70 p-3">
      <p className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
        Visibility
      </p>
      {canPin && (
        <div className="flex items-center justify-between gap-2">
          <Label htmlFor={block.key + "-pinned"} className="text-xs">
            Pin to top
          </Label>
          <Switch
            id={block.key + "-pinned"}
            checked={block.pinned === true}
            onCheckedChange={(checked) => draft.patchBlock(block.key, { pinned: checked })}
          />
        </div>
      )}
      {canSchedule && (
        <>
          <Field id={block.key + "-startsAt"} label="Show from (optional)">
            <Input
              id={block.key + "-startsAt"}
              type="datetime-local"
              value={toLocalInput(block.startsAt)}
              onChange={(e) =>
                draft.patchBlock(block.key, { startsAt: fromLocalInput(e.target.value) })
              }
            />
          </Field>
          <Field id={block.key + "-endsAt"} label="Hide at (optional)">
            <Input
              id={block.key + "-endsAt"}
              type="datetime-local"
              value={toLocalInput(block.endsAt)}
              onChange={(e) =>
                draft.patchBlock(block.key, { endsAt: fromLocalInput(e.target.value) })
              }
            />
          </Field>
          <p className="text-[11px] text-muted-foreground">
            Times use your device timezone. Hidden blocks stay saved in the draft.
          </p>
        </>
      )}
    </div>
  );
}
