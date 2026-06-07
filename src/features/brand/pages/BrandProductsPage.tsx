import { Footer } from "@/features/brand/components/Footer";
import { Navigation } from "@/features/brand/components/Navigation";
import { ProductsSection } from "@/features/brand/components/ProductsSection";

export function BrandProductsPage() {
  return (
    <div className="relative min-h-screen bg-white">
      <Navigation />
      <ProductsSection />
      <Footer />
    </div>
  );
}
