import { Hero } from "@/components/LandingPage/hero";
import { Features } from "@/components/LandingPage/features";
import { SpeedMatrix } from "@/components/LandingPage/speed-matrix";
import { Pricing } from "@/components/LandingPage/pricing";
import { FAQ } from "@/components/LandingPage/faq";

export default function Page() {
  return (
    <>
      <Hero />
      <Features />
      <SpeedMatrix />
      <Pricing />
      <FAQ />
    </>
  );
}
