import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FirstBannerLogo } from "@/lib/socialLogos";

export function PagesHero() {
  return (
    <section
      className="grid grid-cols-1 items-center gap-6 lg:grid-cols-2"
      aria-label="Pages intro"
    >
      <div className="space-y-3">
        <h1 className="text-2xl font-extrabold text-foreground sm:text-4xl">
          Pages that turn visits into engagements
        </h1>
        <p className="max-w-xl text-md text-foreground/80 sm:text-md">
          Create a customized landing page that makes it easy for your audience
          to engage. Gain valuable insights and track your performance.
        </p>
        <Button
          nativeButton={false}
          render={<Link href="/create/templates" />}
          className="gap-2 bg-ember px-5 py-4 text-md text-on-ember hover:bg-ember/90"
        >
          Create your first page
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
      <div className="relative w-full overflow-hidden">
        <Image
          src={FirstBannerLogo}
          alt="Preview of a published page with engagement stats, products and social links"
          width={880}
          height={560}
          className="mx-auto h-auto max-h-60 w-full object-contain lg:max-h-72"
          priority
        />
      </div>
    </section>
  );
}
