import { HeroSection } from "@/features/brand/components/HeroSection";
import { Navigation } from "@/features/brand/components/Navigation";

export function BrandHomePage() {
  return (
    <div className="min-h-dvh bg-white">
      <Navigation />
      <HeroSection />
    </div>
  );
}
