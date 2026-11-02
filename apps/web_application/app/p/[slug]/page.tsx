import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";
import { UAParser } from "ua-parser-js";
import {
  getPublishedPageBySlug,
  recordPageView,
  resolvePageSlugRedirect,
} from "@/server/services/pages";
import { getClientIp } from "@/server/lib/click-capture/ip";
import { PublicPageTracker } from "@/components/pageBlocks/PublicPageTracker";
import { AppBackdrop } from "@/components/AppBackdrop";
import type { PageBlockType } from "@/server/lib/pages";
import { resolveDisplayAvatar } from "@/server/lib/pageAvatar";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const published = await getPublishedPageBySlug(slug);
  if (!published) return { title: "Page not found" };
  const hdrs = await headers();
  const host = hdrs.get("x-forwarded-host") ?? hdrs.get("host");
  const proto = hdrs.get("x-forwarded-proto") ?? "https";
  const canonical =
    host && /^[a-zA-Z0-9.-]+(?::\d{1,5})?$/.test(host)
      ? `${proto}://${host}/p/${published.slug}`
      : `/p/${published.slug}`;
  const description =
    typeof published.theme.description === "string" &&
    published.theme.description.trim().length > 0
      ? published.theme.description.trim().slice(0, 200)
      : `${published.title} - a SimpLx page`;
  const avatar = resolveDisplayAvatar(published.theme, published.blocks);
  const avatarImage =
    avatar.startsWith("https://") ? [{ url: avatar }] : undefined;
  return {
    title: published.title,
    description,
    alternates: { canonical },
    openGraph: {
      title: published.title,
      description,
      url: canonical,
      type: "profile",
      ...(avatarImage ? { images: avatarImage } : null),
    },
    twitter: {
      card: "summary",
      title: published.title,
      description,
    },
  };
}

export default async function PublicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const published = await getPublishedPageBySlug(slug);
  if (!published) {
    const target = await resolvePageSlugRedirect(slug);
    if (target) redirect(`/p/${target}`);
    notFound();
  }

  const hdrs = await headers();
  const ua = hdrs.get("user-agent") ?? "";
  const deviceType =
    new UAParser(ua).getDevice().type ?? "desktop";
  const referrer = hdrs.get("referer") ?? hdrs.get("referrer");
  const ip = getClientIp(hdrs, {
    behindCloudflare: false,
    trustedProxyCount: 0,
  });
  await recordPageView(published.pageId, published.slug, {
    deviceType,
    referrer,
    userAgent: ua || null,
    ip,
  });

  return (
    <AppBackdrop variant="spotlight" className="flex-col items-center px-4 py-8 sm:py-12">
      <main className="relative z-10 mx-auto flex w-full h-full max-w-md flex-col items-center gap-5">
        <PublicPageTracker
          compact={false}
          pageId={published.pageId}
          title={published.title}
          theme={published.theme}
          blocks={published.blocks.map((block) => ({
            ...block,
            type: block.type as PageBlockType,
          }))}
        />
        <Link
          href="/"
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Made with SimpLx - Create your own page
        </Link>
      </main>
    </AppBackdrop>
  );
}
