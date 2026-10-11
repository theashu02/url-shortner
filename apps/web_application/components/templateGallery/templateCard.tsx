import type { PageTemplate } from "./templateTypes";

function MockPreview({ template }: { template: PageTemplate }) {
  const { theme } = template;
  const text = theme.dark ? "#FAF6EF" : "#101418";
  const subtle = theme.dark ? "#FAF6EF66" : "#10141866";
  const row = theme.dark ? "#FAF6EF1A" : "#1014180D";

  return (
    <div
      className="flex h-80 flex-col overflow-hidden rounded-2xl border border-border"
      style={{ backgroundColor: theme.card }}
      aria-hidden="true"
    >
      <div
        className="flex h-28 shrink-0 items-center justify-center"
        style={{ backgroundColor: theme.header }}
      >
        <span
          className="flex h-16 w-16 items-center justify-center rounded-full text-xl font-extrabold"
          style={{ backgroundColor: theme.accent, color: theme.card }}
        >
          {template.name.charAt(0)}
        </span>
      </div>
      <div className="flex flex-1 flex-col items-center gap-2 px-5 pt-4">
        <span
          className="h-3.5 w-2/3 rounded-full"
          style={{ backgroundColor: text }}
        />
        <span
          className="h-2.5 w-1/2 rounded-full"
          style={{ backgroundColor: subtle }}
        />
        <div className="mt-2 w-full space-y-2">
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className="flex items-center gap-2 rounded-lg px-2.5 py-2"
              style={{ backgroundColor: row }}
            >
              <span
                className="h-5 w-5 shrink-0 rounded-full"
                style={{ backgroundColor: subtle }}
              />
              <span
                className="h-2 w-3/4 rounded-full"
                style={{ backgroundColor: subtle }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function TemplateCard({ template }: { template: PageTemplate }) {
  return (
    <button
      type="button"
      title="Template editor is coming soon"
      aria-label={`Use the ${template.name} template`}
      className="group cursor-pointer space-y-2.5 text-left"
    >
      <span className="block transition-shadow group-hover:shadow-md group-hover:ring-2 group-hover:ring-ember rounded-2xl">
        <MockPreview template={template} />
      </span>
      <span className="block px-1 text-sm font-bold text-foreground group-hover:text-ember">
        {template.name}
      </span>
    </button>
  );
}
