import Image from "next/image";

import { LANDING_CLINIC_COVER } from "@/features/brand/constants/landing-home-content";

export function LandingCoverSection() {
  return (
    <section className="relative w-full" aria-label="Clinic in practice">
      {/* Image is 4958×3306 (3:2) — match aspect ratio so the tablet stays in frame */}
      <div className="relative aspect-[3/2] w-full overflow-hidden">
        <Image
          src="/landing/hospital-girl-cover.jpg"
          alt={LANDING_CLINIC_COVER.imageAlt}
          fill
          sizes="100vw"
          className="object-cover object-center"
          priority={false}
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-[color:var(--landing-ink)]/70 via-[color:var(--landing-ink)]/15 to-transparent"
          aria-hidden="true"
        />
        <div className="absolute inset-x-0 bottom-0">
          <div className="mx-auto max-w-7xl px-6 pb-8 sm:px-12 sm:pb-12">
            <p className="landing-display max-w-2xl text-[clamp(1.25rem,2.8vw,1.875rem)] font-extrabold leading-snug text-white">
              {LANDING_CLINIC_COVER.quote}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
