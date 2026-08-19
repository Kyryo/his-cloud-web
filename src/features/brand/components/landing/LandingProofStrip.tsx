"use client";

import Link from "next/link";

import { ROUTES } from "@/constants/routes";
import { LandingCompanyMarks } from "@/features/brand/components/landing/LandingCompanyMarks";
import { useLandingReveal } from "@/features/brand/hooks/useLandingReveal";
import { cn } from "@/lib/utils";

export function LandingProofStrip() {
  const { ref, isVisible } = useLandingReveal<HTMLElement>();

  return (
    <section
      ref={ref}
      aria-label="Clinics using Sigma"
      className={cn(
        "bg-white",
        "landing-reveal",
        isVisible && "is-visible",
      )}
    >
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-14 sm:px-10 sm:py-16 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)] lg:gap-16 lg:px-12">
        <div>
          <p className="landing-display text-[1.4rem] font-semibold leading-snug tracking-[-0.018em] text-[color:var(--landing-ink)] sm:text-[1.6rem]">
            Trusted by clinic networks across Africa
          </p>
          <Link
            href={ROUTES.company}
            className="landing-focus landing-body mt-3 inline-flex text-sm font-medium text-[color:var(--landing-teal)] underline underline-offset-4"
          >
            Read the case study
          </Link>
        </div>
        <LandingCompanyMarks />
      </div>
    </section>
  );
}
