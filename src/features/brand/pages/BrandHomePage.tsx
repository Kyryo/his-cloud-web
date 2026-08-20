import { HeroSection } from "@/features/brand/components/HeroSection";
import { LandingHomeSections } from "@/features/brand/components/landing/LandingHomeSections";

export function BrandHomePage() {
  return (
    <>
      <HeroSection />
      {/* Trusted-by strip hidden for now — logos live on the hero.
      <LandingProofStrip /> */}
      <LandingHomeSections />
    </>
  );
}
