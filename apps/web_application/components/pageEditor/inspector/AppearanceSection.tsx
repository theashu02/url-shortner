import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { AvatarField } from "../AvatarField";
import { PAGE_BUTTON_SHAPES } from "@/server/lib/pages";
import type { UsePageDraft } from "../usePageDraft";

export function AppearanceSection({ draft }: { draft: UsePageDraft }) {
  return (
    <section className="space-y-3 rounded-none border border-border bg-card p-4">
      <h2 className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
        Appearance
      </h2>
      <div className="grid grid-cols-3 gap-2">
        {(
          [
            { key: "header", label: "Header" },
            { key: "card", label: "Card" },
            { key: "accent", label: "Accent" },
          ] as const
        ).map((field) => (
          <div key={field.key} className="space-y-1">
            <Label htmlFor={"theme-" + field.key} className="text-[11px]">
              {field.label}
            </Label>
            <Input
              id={"theme-" + field.key}
              type="color"
              value={draft.theme[field.key]}
              onChange={(e) => draft.patchTheme({ [field.key]: e.target.value })}
              className="h-9 w-full cursor-pointer p-1"
            />
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor="theme-dark" className="text-xs">
          Dark text mode
        </Label>
        <Switch
          id="theme-dark"
          checked={draft.theme.dark}
          onCheckedChange={(checked) => draft.patchTheme({ dark: checked })}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="theme-description" className="text-xs">
          Description
        </Label>
        <Textarea
          id="theme-description"
          value={draft.theme.description ?? ""}
          maxLength={200}
          rows={2}
          placeholder="A short bio shown under your page header."
          onChange={(e) => draft.patchTheme({ description: e.target.value })}
        />
      </div>
      <div className="space-y-1.5">
        <span className="text-xs font-medium">Avatar</span>
        <AvatarField
          value={draft.theme.avatarUrl ?? ""}
          onChange={(url) => draft.patchTheme({ avatarUrl: url })}
        />
      </div>
      <div className="space-y-1.5">
        <span className="text-xs font-medium">Button shape</span>
        <div className="flex gap-1.5">
          {PAGE_BUTTON_SHAPES.map((option) => (
            <Button
              key={option}
              type="button"
              variant={(draft.theme.buttonShape ?? "rounded") === option ? "default" : "outline"}
              size="sm"
              onClick={() => draft.patchTheme({ buttonShape: option })}
              className="flex-1 capitalize"
            >
              {option}
            </Button>
          ))}
        </div>
      </div>
    </section>
  );
}
