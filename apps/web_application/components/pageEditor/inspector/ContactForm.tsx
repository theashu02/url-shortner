import { Input } from "@/components/ui/input";
import { Field } from "./Field";
import { asString } from "./fieldUtils";

export function ContactForm({
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
      <Field id={blockKey + "-name"} label="Name">
        <Input
          id={blockKey + "-name"}
          value={asString(props["name"])}
          maxLength={120}
          onChange={(e) => onPatch({ name: e.target.value })}
        />
      </Field>
      <div className="grid grid-cols-2 gap-2">
        <Field id={blockKey + "-ctitle"} label="Title">
          <Input
            id={blockKey + "-ctitle"}
            value={asString(props["title"])}
            maxLength={120}
            onChange={(e) => onPatch({ title: e.target.value })}
          />
        </Field>
        <Field id={blockKey + "-company"} label="Company">
          <Input
            id={blockKey + "-company"}
            value={asString(props["company"])}
            maxLength={120}
            onChange={(e) => onPatch({ company: e.target.value })}
          />
        </Field>
      </div>
      <Field id={blockKey + "-email"} label="Email">
        <Input
          id={blockKey + "-email"}
          value={asString(props["email"])}
          maxLength={160}
          placeholder="you@example.com"
          onChange={(e) => onPatch({ email: e.target.value })}
        />
      </Field>
      <div className="grid grid-cols-2 gap-2">
        <Field id={blockKey + "-phone"} label="Phone">
          <Input
            id={blockKey + "-phone"}
            value={asString(props["phone"])}
            maxLength={40}
            onChange={(e) => onPatch({ phone: e.target.value })}
          />
        </Field>
        <Field id={blockKey + "-website"} label="Website">
          <Input
            id={blockKey + "-website"}
            value={asString(props["website"])}
            placeholder="https://..."
            onChange={(e) => onPatch({ website: e.target.value })}
          />
        </Field>
      </div>
      <Field id={blockKey + "-btn"} label="Button label">
        <Input
          id={blockKey + "-btn"}
          value={asString(props["buttonLabel"])}
          maxLength={40}
          placeholder="Save contact"
          onChange={(e) => onPatch({ buttonLabel: e.target.value })}
        />
      </Field>
    </>
  );
}
