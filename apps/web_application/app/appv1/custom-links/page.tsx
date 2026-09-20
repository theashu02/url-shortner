"use client";

import { useState, useCallback } from "react";
import { api } from "@/lib/eden";
import { useFetchApi } from "@/hooks/useFetchApi";
import {
  UrlCreateForm,
  type CreateMode,
} from "@/components/appv1/url-create-form";
import { UrlResultCard } from "@/components/appv1/url-result-card";
import { CreateModeTabs } from "@/components/appv1/create-mode-tabs";

type UrlCreated = { shortCode: string; originalUrl: string };
type UrlError = { message: string };

export default function CustomLinksPage() {
  const [mode, setMode] = useState<CreateMode>("link");

  const { data, error, loading, execute, reset } = useFetchApi<
    UrlCreated,
    UrlError
  >();

  const handleModeChange = useCallback(
    (newMode: CreateMode) => {
      setMode(newMode);
      reset();
    },
    [reset],
  );

  const handleCreate = useCallback(
    async (url: string, slug: string) => {
      await execute(() =>
        api.url.create.post({
          url,
          ...(slug ? { customSlug: slug } : {}),
        }),
      );
    },
    [execute],
  );

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const shortUrl = data ? `${origin}/${data.shortCode}` : "";

  return (
    <div className="flex-1 w-full overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <div className="w-full max-w-7xl mx-auto space-y-6">
        <CreateModeTabs mode={mode} onModeChange={handleModeChange} />

        {/* Main Content Area */}
        {data ? (
          <UrlResultCard
            mode={mode}
            shortUrl={shortUrl}
            shortCode={data.shortCode}
            originalUrl={data.originalUrl}
            onReset={reset}
          />
        ) : (
          <UrlCreateForm
            mode={mode}
            onSubmit={handleCreate}
            error={error}
            loading={loading}
          />
        )}

        <p className="text-center text-sm text-muted-foreground pt-2">
          Links and QR codes are active immediately after creation.
        </p>
      </div>
    </div>
  );
}
