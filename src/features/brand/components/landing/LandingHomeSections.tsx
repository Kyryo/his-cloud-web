"use client";

import { ChevronDown } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { useState } from "react";

import { LandingComparisonSplit } from "@/features/brand/components/landing/LandingComparisonSplit";
import { LandingProblemFeatureCards } from "@/features/brand/components/landing/LandingProblemFeatureCards";
import { LandingRevenueStandings } from "@/features/brand/components/landing/LandingRevenueStandings";
import { LandingSection } from "@/features/brand/components/landing/LandingSection";
import { LandingSectionHeader } from "@/features/brand/components/landing/LandingSectionHeader";
import { LandingSolutionJourney } from "@/features/brand/components/landing/LandingSolutionJourney";
import { LandingWhyFeatureCards } from "@/features/brand/components/landing/LandingWhyFeatureCards";
import {
  LANDING_COMPARISON,
  LANDING_FAQ,
  LANDING_FINAL_CTA,
  LANDING_PROBLEM,
  LANDING_REVENUE,
  LANDING_SOLUTION,
} from "@/features/brand/constants/landing-home-content";
import { useLandingReveal } from "@/features/brand/hooks/useLandingReveal";
import { cn } from "@/lib/utils";

function LandingReveal({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const { ref, isVisible } = useLandingReveal();

  return (
    <div
      ref={ref}
      className={cn("landing-reveal", isVisible && "is-visible", className)}
    >
      {children}
    </div>
  );
}

function LandingFaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="divide-y divide-[color:var(--landing-border)]">
      {LANDING_FAQ.items.map((item, index) => {
        const isOpen = openIndex === index;
        const panelId = `landing-faq-panel-${index}`;

        return (
          <div key={item.question}>
            <h3 className="m-0">
              <button
                type="button"
                id={`landing-faq-trigger-${index}`}
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="landing-focus flex min-h-14 w-full items-center justify-between gap-4 py-5 text-left transition-colors hover:text-[color:var(--landing-teal)]"
                aria-expanded={isOpen}
                aria-controls={panelId}
              >
                <span className="landing-text-ink text-base font-semibold sm:text-lg">
                  {item.question}
                </span>
                <ChevronDown
                  className={cn(
                    "size-5 shrink-0 text-[color:var(--landing-ledger-ink)]/50 transition-transform duration-300",
                    isOpen && "rotate-180",
                  )}
                  aria-hidden="true"
                />
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={`landing-faq-trigger-${index}`}
              hidden={!isOpen}
            >
              <div className="max-w-[65ch] pb-6">
                {item.answerTitle ? (
                  <p className="landing-body text-base font-semibold leading-[1.7] text-[color:var(--landing-ink)]">
                    {item.answerTitle}
                  </p>
                ) : null}

                {item.answer ? (
                  <p className="landing-body text-base leading-[1.7] text-[color:var(--landing-ledger-ink)]">
                    {item.answer}
                  </p>
                ) : null}

                {item.answerParagraphs?.map((paragraph) => (
                  <p
                    key={paragraph}
                    className="landing-body mt-4 text-base leading-[1.7] text-[color:var(--landing-ledger-ink)]"
                  >
                    {paragraph}
                  </p>
                ))}

                {item.answerBullets?.length ? (
                  <ul className="mt-4 space-y-2 pl-5 text-base leading-[1.7] text-[color:var(--landing-ledger-ink)] marker:text-[color:var(--landing-teal)]">
                    {item.answerBullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function LandingHomeSections() {
  return (
    <>
      <LandingSection variant="white">
        <LandingSectionHeader
          title={LANDING_PROBLEM.title}
          description={LANDING_PROBLEM.description}
          align="center"
          className="max-w-4xl"
        />
        <LandingProblemFeatureCards />
      </LandingSection>

      <LandingSection variant="muted">
        <LandingReveal>
          <LandingSectionHeader
            title={LANDING_SOLUTION.title}
            description={LANDING_SOLUTION.description}
          />
          <LandingSolutionJourney />
        </LandingReveal>
      </LandingSection>

      <LandingSection variant="white">
        <LandingReveal>
          <LandingSectionHeader title={LANDING_COMPARISON.title} />
          <LandingComparisonSplit />
        </LandingReveal>
      </LandingSection>

      <LandingSection variant="muted">
        <LandingReveal>
          <LandingSectionHeader
            title={LANDING_REVENUE.title}
            description={LANDING_REVENUE.description}
          />
          <LandingRevenueStandings />
        </LandingReveal>
      </LandingSection>

      <LandingSection variant="white">
        <LandingReveal>
          <LandingWhyFeatureCards />
        </LandingReveal>
      </LandingSection>

      <LandingSection variant="muted">
        <LandingReveal>
          <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16">
            <LandingSectionHeader title={LANDING_FAQ.title} />
            <LandingFaqAccordion />
          </div>
        </LandingReveal>
      </LandingSection>

      <section className="bg-[color:var(--landing-ink)]">
        <LandingReveal>
          <div className="mx-auto max-w-6xl px-6 py-20 sm:px-10 sm:py-24 lg:px-12 lg:py-28">
            <h2 className="max-w-[28ch] whitespace-pre-line font-[family-name:var(--font-display)] text-[clamp(1.75rem,3.2vw,2.65rem)] font-semibold tracking-[-0.018em] text-white text-balance">
              {LANDING_FINAL_CTA.title}
            </h2>
            <p className="landing-body mt-5 max-w-[42ch] text-[1.05rem] leading-[1.7] text-white/75">
              {LANDING_FINAL_CTA.description}
            </p>
            <div className="mt-10 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
              <Link
                href={LANDING_FINAL_CTA.primaryCta.href}
                className="landing-focus landing-btn-primary inline-flex min-h-12 items-center justify-center rounded-full px-7 py-3 text-[15px] font-semibold"
              >
                {LANDING_FINAL_CTA.primaryCta.label}
              </Link>
              <Link
                href={LANDING_FINAL_CTA.secondaryCta.href}
                className="landing-focus inline-flex min-h-12 items-center justify-center rounded-full border border-white/25 px-7 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-white/10"
              >
                {LANDING_FINAL_CTA.secondaryCta.label}
              </Link>
            </div>
          </div>
        </LandingReveal>
      </section>
    </>
  );
}
