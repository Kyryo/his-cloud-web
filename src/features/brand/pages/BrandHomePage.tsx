import { HeroSection } from "@/features/brand/components/HeroSection";
import { LandingHomeSections } from "@/features/brand/components/landing/LandingHomeSections";
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
        {/* Trusted-by strip hidden for now — logos live on the hero.
        <LandingProofStrip /> */}
        <LandingHomeSections />
      </main>
    </div>
  );
}
