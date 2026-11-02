import { Input } from "@/components/ui/input";
import type { PageBlockInput } from "@/server/lib/pages";
import { Field } from "./Field";
import { LinkItemsEditor } from "./LinkItemsEditor";
import { SocialItemsEditor } from "./SocialItemsEditor";
import { ContactForm } from "./ContactForm";
import { ProductForm } from "./ProductForm";
import { DividerForm, ImageForm, SpacerForm, VideoForm } from "./MediaForms";
import { HeaderForm, TextForm } from "./TextForms";
import { asRecord, asString, asItemList } from "./fieldUtils";

interface BlockFormProps {
  block: PageBlockInput;
  onPatch: (patch: Record<string, unknown>) => void;
  onPatchItems: (items: Record<string, unknown>[]) => void;
}

export function BlockForm({ block, onPatch, onPatchItems }: BlockFormProps) {
  const props = asRecord(block.props);

  if (block.type === "header") {
    return <HeaderForm blockKey={block.key} props={props} onPatch={onPatch} />;
  }
  if (block.type === "text") {
    return <TextForm blockKey={block.key} props={props} onPatch={onPatch} />;
  }
  if (block.type === "image") {
    return <ImageForm blockKey={block.key} props={props} onPatch={onPatch} />;
  }
  if (block.type === "links") {
    return (
      <LinkItemsEditor
        blockKey={block.key}
        items={asItemList(props["items"])}
        addLabel="Add link"
        newItem={{ label: "New link", url: "https://example.com" }}
        enableShortLinks
        onPatchItems={onPatchItems}
        renderFirstField={(item, index, patch) => (
          <Field id={block.key + "-label-" + index} label="Label">
            <Input
              id={block.key + "-label-" + index}
              value={asString(item["label"])}
              maxLength={80}
              placeholder="My link"
              onChange={(e) => patch({ label: e.target.value })}
            />
          </Field>
        )}
      />
    );
  }
  if (block.type === "social") {
    return (
      <SocialItemsEditor
        blockKey={block.key}
        items={asItemList(props["items"])}
        onPatchItems={onPatchItems}
      />
    );
  }
  if (block.type === "video") {
    return <VideoForm blockKey={block.key} props={props} onPatch={onPatch} />;
  }
  if (block.type === "contact") {
    return <ContactForm blockKey={block.key} props={props} onPatch={onPatch} />;
  }
  if (block.type === "spacer") {
    return <SpacerForm blockKey={block.key} props={props} onPatch={onPatch} />;
  }
  if (block.type === "divider") {
    return <DividerForm blockKey={block.key} props={props} onPatch={onPatch} />;
  }
  return (
    <ProductForm
      blockKey={block.key}
      items={asItemList(props["items"])}
      onPatchItems={onPatchItems}
    />
  );
}
