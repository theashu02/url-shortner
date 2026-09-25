"use client";

import { useState, useCallback, useRef } from "react";
import { api } from "@/lib/eden";
import { useFetchApi } from "@/hooks/useFetchApi";
import {
  UrlCreateForm,
  type CreateMode,
} from "@/components/appv1/url-create-form";
import { UrlResultCard } from "@/components/appv1/url-result-card";
import { CreateModeTabs } from "@/components/appv1/create-mode-tabs";
import { UtmParameters, type UtmParams } from "@/components/appv1/utmParameters";
import { LinkExpiration } from "@/components/appv1/linkExpiration";

type UrlCreated = { shortCode: string; originalUrl: string };
type UrlError = { message: string };

export default function CustomLinksPage() {
  const [mode, setMode] = useState<CreateMode>("link");

  const { data, error, loading, execute, reset } = useFetchApi<
    UrlCreated,
    UrlError
  >();

  const utmRef = useRef<UtmParams | null>(null);
  const expiresAtRef = useRef<string | null>(null);

  const [destinationUrl, setDestinationUrl] = useState("");

  const handleModeChange = useCallback(
    (newMode: CreateMode) => {
      setMode(newMode);
      reset();
    },
    [reset],
  );

  const handleCreate = useCallback(
    async (url: string, slug: string) => {
      setDestinationUrl(url);
      await execute(() =>
        api.url.create.post({
          url,
          ...(slug ? { customSlug: slug } : {}),
          ...(utmRef.current ? { utmParams: utmRef.current } : {}),
          ...(expiresAtRef.current ? { expiresAt: expiresAtRef.current } : {}),
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

        {!data && (
          <div className="w-full border border-border/60 bg-card divide-y divide-border/40">
            {/* Section header */}
            <div className="px-5 py-3 bg-muted/30">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Advanced Options
              </p>
            </div>

            {/* UTM Parameters */}
            <div className="px-5 py-4">
              <UtmParameters
                destinationUrl={destinationUrl}
                onChange={(p) => { utmRef.current = p; }}
              />
            </div>

            {/* Link Expiration */}
            <div className="px-5 py-4">
              <LinkExpiration
                onChange={(d) => { expiresAtRef.current = d; }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
