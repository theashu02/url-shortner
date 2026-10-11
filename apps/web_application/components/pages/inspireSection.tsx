import { Sparkles } from "lucide-react";
import { InspireCard } from "./inspireCard";
import { SecondBannerLogo, ThirdBannerLogo } from "@/lib/socialLogos";

export function InspireSection() {
  return (
    <section className="space-y-3" aria-label="Get inspired">
      <h2 className="flex items-center gap-2 text-base font-extrabold tracking-tight text-foreground">
        Get inspired
        <Sparkles className="h-4 w-4 text-ember" aria-hidden="true" />
      </h2>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <InspireCard
          title="Share your contact info with ease"
          text="Connect wherever you go with a digital business card"
          image={SecondBannerLogo}
          imageAlt="Digital business card page preview"
        />
        <InspireCard
          title="Increase traffic to your content"
          text="Drive visitors to your social media, links, and more"
          image={ThirdBannerLogo}
          imageAlt="Creator content page preview"
        />
      </div>
    </section>
  );
}
