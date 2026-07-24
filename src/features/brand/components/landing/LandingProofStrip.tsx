"use client";

import { LandingStatRow } from "@/features/brand/components/landing/LandingStatRow";
import { useLandingReveal } from "@/features/brand/hooks/useLandingReveal";
import { cn } from "@/lib/utils";

export function LandingProofStrip() {
  const { ref, isVisible } = useLandingReveal<HTMLElement>();

  return (
    <section
      ref={ref}
      aria-label="Clinic proof points"
      className={cn(
        "bg-[color:var(--landing-warm)]",
        "landing-reveal",
        isVisible && "is-visible",
      )}
    >
      <div className="mx-auto max-w-6xl px-6 py-12 sm:px-10 sm:py-14 lg:px-12">
        <LandingStatRow align="center" className="gap-x-12 gap-y-8 sm:gap-x-16" />
      </div>
    </section>
  );
}
