import { AboutSection } from "@/features/brand/components/AboutSection";
import { Footer } from "@/features/brand/components/Footer";
import { Navigation } from "@/features/brand/components/Navigation";

export function BrandFeaturesPage() {
  return (
    <div className="relative min-h-screen bg-white">
      <Navigation />
      <AboutSection />
      <Footer />
    </div>
  );
}
