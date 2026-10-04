import { HeroForm } from "./hero-form";

export function Hero() {
  return (
    <section
      aria-label="Shorten your first link"
      className="relative w-full min-h-screen bg-mist flex flex-col items-center justify-center overflow-hidden pt-24 pb-16"
    >
      <div className="container mx-auto px-4 flex flex-col items-center text-center relative z-10">

        {/* Single H1 — consolidates the previous 3 h1 tags for proper SEO */}
        <div className="flex flex-col items-center justify-center text-foreground mb-12 select-none">
          <h1 className="font-display font-bold leading-[0.8] m-0 p-0 drop-shadow-sm text-[15vw] sm:text-[12vw] md:text-[9vw] lg:text-[140px]">
            <span className="block">SHORT</span>
            <span className="block gap-[2vw] justify-center">
              <span>LINKS</span> <span className="text-ember">BIG</span>
            </span>
            <span className="block text-lake">IMPACT</span>
          </h1>
        </div>

        {/* Interactive form — client component */}
        <HeroForm />
      </div>

      {/* Geometric bottom elements */}
      <div className="absolute bottom-0 left-0 w-full h-30 pointer-events-none overflow-hidden z-0 flex" aria-hidden="true">
        <div className="w-1/3 h-full bg-ember border-t-8 border-r-8 border-line transform translate-y-1/2" />
        <div className="w-1/3 h-full bg-lime-soft border-t-8 border-r-8 border-line transform translate-y-1/4" />
        <div className="w-1/3 h-full bg-lake border-t-8 border-line transform translate-y-1/3" />
      </div>
    </section>
  );
}
