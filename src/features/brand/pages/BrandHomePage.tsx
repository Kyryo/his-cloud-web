import { HeroSection } from "@/features/brand/components/HeroSection";
import { LandingHomeSections } from "@/features/brand/components/landing/LandingHomeSections";
import { LandingProofStrip } from "@/features/brand/components/landing/LandingProofStrip";
import { Navigation } from "@/features/brand/components/Navigation";

export function BrandHomePage() {
  return (
    <div className="min-h-dvh bg-white">
      <a href="#main-content" className="landing-skip-link">
        Skip to main content
      </a>
      <Navigation />
      <main id="main-content">
        <HeroSection />
        <LandingProofStrip />
        <LandingHomeSections />
      </main>
    </div>
  );
}
