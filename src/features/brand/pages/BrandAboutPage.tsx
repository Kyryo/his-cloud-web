import { AboutSection } from "@/features/brand/components/AboutSection";
import { FaqSection } from "@/features/brand/components/FaqSection";
import { Footer } from "@/features/brand/components/Footer";
import { Navigation } from "@/features/brand/components/Navigation";
import { StatsSection } from "@/features/brand/components/StatsSection";

export function BrandAboutPage() {
  return (
    <div className="relative min-h-screen bg-white">
      <Navigation />
      <section className="pb-10 pt-24">
        <StatsSection />
      </section>
      <AboutSection />
      <FaqSection />
      <Footer />
    </div>
  );
}
