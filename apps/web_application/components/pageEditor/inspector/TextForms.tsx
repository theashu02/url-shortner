import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "./Field";
import { asString } from "./fieldUtils";

export function HeaderForm({
  blockKey,
  props,
  onPatch,
}: {
  blockKey: string;
  props: Record<string, unknown>;
  onPatch: (patch: Record<string, unknown>) => void;
}) {
  return (
    <>
      <Field id={blockKey + "-title"} label="Title">
        <Input
          id={blockKey + "-title"}
          value={asString(props["title"])}
          maxLength={120}
          onChange={(e) => onPatch({ title: e.target.value })}
        />
      </Field>
      <Field id={blockKey + "-subtitle"} label="Subtitle">
        <Input
          id={blockKey + "-subtitle"}
          value={asString(props["subtitle"])}
          maxLength={160}
          onChange={(e) => onPatch({ subtitle: e.target.value })}
        />
      </Field>
      <Field id={blockKey + "-avatar"} label="Avatar URL (optional)">
        <Input
          id={blockKey + "-avatar"}
          value={asString(props["avatarUrl"])}
          placeholder="https://… or /avatar.png"
          onChange={(e) => onPatch({ avatarUrl: e.target.value })}
        />
      </Field>
    </>
  );
}

export function TextForm({
  blockKey,
  props,
  onPatch,
}: {
  blockKey: string;
  props: Record<string, unknown>;
  onPatch: (patch: Record<string, unknown>) => void;
}) {
  return (
    <>
      <Field id={blockKey + "-heading"} label="Heading">
        <Input
          id={blockKey + "-heading"}
          value={asString(props["heading"])}
          maxLength={120}
          onChange={(e) => onPatch({ heading: e.target.value })}
        />
      </Field>
      <Field id={blockKey + "-body"} label="Body">
        <Textarea
          id={blockKey + "-body"}
          value={asString(props["body"])}
          maxLength={2000}
          rows={4}
          onChange={(e) => onPatch({ body: e.target.value })}
        />
      </Field>
    </>
  );
}
