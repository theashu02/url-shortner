"use client";

import { useParams } from "next/navigation";
import { EditorShell } from "@/components/pageEditor";

export default function PageEditorRoute() {
  const params = useParams<{ id: string | string[] }>();
  const raw = params?.id;
  const pageId = Array.isArray(raw) ? raw[0] : raw;

  if (!pageId) {
    return (
      <div className="mx-auto w-full max-w-lg px-4 py-16 text-center">
        <p className="text-sm font-semibold text-foreground">Missing page id</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Go back to Pages and choose a page to edit.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      <EditorShell pageId={pageId} />
    </div>
  );
}