"use client";

import { useState, useCallback } from "react";
import { Link2, QrCode, Sparkles } from "lucide-react";
import { api } from "@/lib/eden";
import { useFetchApi } from "@/hooks/useFetchApi";
import {
  UrlCreateForm,
  type CreateMode,
} from "@/components/appv1/url-create-form";
import { UrlResultCard } from "@/components/appv1/url-result-card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

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
        <Tabs
          value={mode}
          onValueChange={(v) => handleModeChange(v as CreateMode)}
        >
          <TabsList style={{ height: "3rem" }} className="gap-3">
            <TabsTrigger value="link" className="text-md gap-2 data-active:bg-primary data-active:text-primary-foreground data-active:shadow-sm hover:data-active:text-primary-foreground px-3">
              <Link2 />
              Short link
            </TabsTrigger>
            <TabsTrigger value="qr" className="text-md gap-2 data-active:bg-primary data-active:text-primary-foreground data-active:shadow-sm hover:data-active:text-primary-foreground px-3">
              <QrCode />
              QR Code
            </TabsTrigger>
            <TabsTrigger value="both" className="text-md gap-2 data-active:bg-primary data-active:text-primary-foreground data-active:shadow-sm hover:data-active:text-primary-foreground px-3">
              <Sparkles />
              Link + QR Code
            </TabsTrigger>
          </TabsList>
        </Tabs>

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
