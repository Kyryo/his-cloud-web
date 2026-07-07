import { LandingDottedArcDecor } from "@/features/brand/components/landing/LandingDottedArcDecor";
import { LandingProductScreenshot } from "@/features/brand/components/landing/LandingProductScreenshot";
import { LANDING_CLINIC_COVER } from "@/features/brand/constants/landing-home-content";

const CLIENT_DETAILS_SCREENSHOT = "/landing/product-screenshots/client-details.png";

export function LandingClinicQuoteSection() {
  return (
    <section
      className="relative overflow-hidden bg-white py-14 lg:py-24"
      aria-label="Sigma in practice"
    >
      <LandingDottedArcDecor />

      <div className="relative z-10 mx-auto flex max-w-7xl flex-col items-center gap-10 px-6 text-center sm:px-12 lg:gap-12">
        <LandingProductScreenshot
          src={CLIENT_DETAILS_SCREENSHOT}
          alt={LANDING_CLINIC_COVER.imageAlt}
          elevated
          className="w-full max-w-4xl sm:max-w-5xl lg:max-w-6xl"
        />
        <blockquote className="landing-display max-w-4xl text-[clamp(1.5rem,3vw,2.25rem)] font-extrabold leading-snug text-[color:var(--landing-ink)]">
          {LANDING_CLINIC_COVER.quote}
        </blockquote>
      </div>
    </section>
  );
}
