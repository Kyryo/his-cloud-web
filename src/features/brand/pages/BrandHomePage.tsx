import { HeroSection } from "@/features/brand/components/HeroSection";
import { LandingHomeSections } from "@/features/brand/components/landing/LandingHomeSections";
import { LandingSocialProofSection } from "@/features/brand/components/landing/LandingSocialProofSection";

export function BrandHomePage() {
  return (
    <>
      <HeroSection />
      <LandingSocialProofSection />
      <LandingHomeSections />
    </>
  );
}
