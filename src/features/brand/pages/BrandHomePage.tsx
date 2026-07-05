import { HeroSection } from "@/features/brand/components/HeroSection";
import { LandingHomeSections } from "@/features/brand/components/landing/LandingHomeSections";
import { Navigation } from "@/features/brand/components/Navigation";

export function BrandHomePage() {
  return (
    <div className="min-h-dvh bg-[color:var(--landing-clay)]">
      <Navigation />
      <HeroSection />
      <LandingHomeSections />
    </div>
  );
}
