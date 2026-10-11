import { PagesHero, InspireSection } from "@/components/pages";

export default function PagesPage() {
  return (
    <div className="flex h-full w-full flex-col justify-center overflow-hidden px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <PagesHero />
        <hr className="border-border" />
        <InspireSection />
      </div>
    </div>
  );
}
