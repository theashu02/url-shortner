import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "./Field";
import { asString } from "./fieldUtils";

interface SimpleFormProps {
  blockKey: string;
  props: Record<string, unknown>;
  onPatch: (patch: Record<string, unknown>) => void;
}

export function ImageForm({ blockKey, props, onPatch }: SimpleFormProps) {
  return (
    <>
      <Field id={blockKey + "-src"} label="Image URL or path">
        <Input
          id={blockKey + "-src"}
          value={asString(props["src"])}
          placeholder="https://… or /cover.png"
          onChange={(e) => onPatch({ src: e.target.value })}
        />
      </Field>
      <Field id={blockKey + "-alt"} label="Alt text">
        <Input
          id={blockKey + "-alt"}
          value={asString(props["alt"])}
          maxLength={160}
          onChange={(e) => onPatch({ alt: e.target.value })}
        />
      </Field>
      <Field id={blockKey + "-caption"} label="Caption">
        <Input
          id={blockKey + "-caption"}
          value={asString(props["caption"])}
          maxLength={200}
          onChange={(e) => onPatch({ caption: e.target.value })}
        />
      </Field>
    </>
  );
}

export function VideoForm({ blockKey, props, onPatch }: SimpleFormProps) {
  return (
    <>
      <Field id={blockKey + "-url"} label="YouTube URL">
        <Input
          id={blockKey + "-url"}
          value={asString(props["url"])}
          placeholder="https://www.youtube.com/watch?v=..."
          onChange={(e) => onPatch({ url: e.target.value })}
        />
      </Field>
      <Field id={blockKey + "-vtitle"} label="Title (optional)">
        <Input
          id={blockKey + "-vtitle"}
          value={asString(props["title"])}
          maxLength={120}
          onChange={(e) => onPatch({ title: e.target.value })}
        />
      </Field>
      <p className="text-[11px] text-muted-foreground">
        Only YouTube videos are supported. The video plays inside your page.
      </p>
    </>
  );
}

export function SpacerForm({ blockKey, props, onPatch }: SimpleFormProps) {
  const height = typeof props["height"] === "number" ? props["height"] : 32;
  return (
    <Field id={blockKey + "-height"} label="Height (8-160 px)">
      <Input
        id={blockKey + "-height"}
        type="number"
        min={8}
        max={160}
        value={String(height)}
        onChange={(e) => {
          const next = parseInt(e.target.value, 10);
          onPatch({ height: Number.isFinite(next) ? Math.min(160, Math.max(8, Math.round(next))) : 32 });
        }}
      />
    </Field>
  );
}

export function DividerForm({ blockKey, props, onPatch }: SimpleFormProps) {
  const style = props["style"] === "dots" ? "dots" : "line";
  return (
    <Field id={blockKey + "-dstyle"} label="Style">
      <div className="flex gap-1.5">
        {(
          [
            { value: "line", label: "Line" },
            { value: "dots", label: "Dots" },
          ] as const
        ).map((option) => (
          <Button
            key={option.value}
            type="button"
            variant={style === option.value ? "default" : "outline"}
            size="sm"
            onClick={() => onPatch({ style: option.value })}
            className="flex-1"
          >
            {option.label}
          </Button>
        ))}
      </div>
    </Field>
  );
}
