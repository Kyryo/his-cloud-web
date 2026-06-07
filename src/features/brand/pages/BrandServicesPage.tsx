import { Footer } from "@/features/brand/components/Footer";
import { Navigation } from "@/features/brand/components/Navigation";
import { ServicesSection } from "@/features/brand/components/ServicesSection";

export function BrandServicesPage() {
  return (
    <div className="relative min-h-screen bg-white">
      <Navigation />
      <ServicesSection />
      <Footer />
    </div>
  );
}
