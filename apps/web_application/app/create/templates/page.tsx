"use client";

import { useCallback, useEffect, useState } from "react";
import {
  FilterSidebar,
  TemplatesGrid,
  TemplatesHeader,
  TemplatesSkeleton,
  listTemplates,
  type PageTemplate,
} from "@/components/templateGallery";

export default function TemplatesPage() {
  const [active, setActive] = useState("all");
  const [templates, setTemplates] = useState<PageTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (category: string) => {
    setLoading(true);
    try {
      setTemplates(await listTemplates(category));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load(active);
  }, [active, load]);

  return (
    <div className="min-h-screen w-full bg-background px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto w-full max-w-7xl space-y-8">
        <TemplatesHeader />
        <div className="flex flex-col gap-8 lg:flex-row">
          <FilterSidebar active={active} onSelect={setActive} />
          {loading ? (
            <TemplatesSkeleton />
          ) : (
            <TemplatesGrid templates={templates} />
          )}
        </div>
      </div>
    </div>
  );
}
