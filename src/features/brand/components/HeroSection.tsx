"use client";

import Link from "next/link";
import { TbCircleCheck } from "react-icons/tb";

import { LedgerSplitHero } from "@/features/brand/components/landing/LedgerSplitHero";
import { LandingStatRow } from "@/features/brand/components/landing/LandingStatRow";
import { useLandingReveal } from "@/features/brand/hooks/useLandingReveal";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

const TRUST_NOTES = [
  "No card required",
  "Free setup call included",
  "Cancel anytime",
] as const;

export function HeroSection() {
  const { ref, isVisible } = useLandingReveal<HTMLElement>({ threshold: 0.08 });

  return (
    <section
      ref={ref}
      className={cn(
        "landing-hero-ground relative flex min-h-[auto] flex-col pt-[4.5rem] lg:min-h-[85vh]",
        "landing-reveal",
        isVisible && "is-visible",
      )}
    >
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-6 pb-16 pt-10 sm:px-12 sm:pb-20 sm:pt-14 lg:pb-24">
        <div className="grid flex-1 grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-14">
          <div className="flex flex-col justify-center text-left">
            <h1 className="landing-display max-w-[18ch] text-[clamp(2rem,5vw,3.25rem)] font-extrabold leading-[1.08] text-balance">
              Turn paper clinics into digital ones, without the cost of heavy IT.
            </h1>

            <p className="landing-body mt-5 max-w-xl text-base leading-relaxed text-[color:var(--landing-ledger-ink)] sm:text-lg sm:leading-[1.65]">
            Sigma gives clinics a complete digital operating system for patient care and operations, 
            without expensive hardware, large ICT teams, or complex implementations.
            </p>

            <div className="mt-8 flex flex-col gap-5 sm:mt-10">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                <Link
                  href={ROUTES.signup}
                  className="landing-focus landing-btn-primary inline-flex min-h-11 items-center justify-center rounded-full px-7 py-3.5 text-sm font-semibold transition-colors sm:text-base"
                >
                  Start for free
                </Link>
                <Link
                  href={ROUTES.contacts}
                  className="landing-focus landing-btn-secondary inline-flex min-h-11 items-center justify-center rounded-full border-[1.5px] bg-transparent px-7 py-3.5 text-sm font-semibold transition-colors sm:text-base"
                >
                  Book a demo
                </Link>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[color:var(--landing-ledger-ink)] sm:text-sm">
                {TRUST_NOTES.map((note) => (
                  <span key={note} className="inline-flex items-center gap-1.5">
                    <TbCircleCheck
                      className="landing-text-teal size-3.5 shrink-0"
                      aria-hidden="true"
                    />
                    {note}
                  </span>
                ))}
              </div>

              <LandingStatRow compact className="mt-2 border-t border-[color:var(--landing-ink)]/10 pt-6" />
            </div>
          </div>

          <div className="w-full lg:max-w-none">
            <LedgerSplitHero />
          </div>
        </div>
      </div>
    </section>
  );
}
