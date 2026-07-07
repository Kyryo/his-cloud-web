import { HeroSection } from "@/features/brand/components/HeroSection";
import { LandingClinicQuoteSection } from "@/features/brand/components/landing/LandingClinicQuoteSection";
import { LandingHomeSections } from "@/features/brand/components/landing/LandingHomeSections";
import { Navigation } from "@/features/brand/components/Navigation";

export function BrandHomePage() {
  return (
    <div className="min-h-dvh bg-[color:var(--landing-clay)]">
      <a href="#main-content" className="landing-skip-link">
        Skip to main content
      </a>
      <Navigation />
      <main id="main-content">
        <HeroSection />
        <LandingClinicQuoteSection />
        <LandingHomeSections />
      </main>
    </div>
  );
}
