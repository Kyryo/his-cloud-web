"use client";

import {
  Ban,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  ClipboardList,
  FileWarning,
  Link2,
  ServerOff,
  Sheet,
  ShieldCheck,
  Sparkles,
  Timer,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { useState } from "react";

import { LandingFooter } from "@/features/brand/components/landing/LandingFooter";
import { LandingProductScreenshot } from "@/features/brand/components/landing/LandingProductScreenshot";
import { LandingSection } from "@/features/brand/components/landing/LandingSection";
import { LandingSectionHeader } from "@/features/brand/components/landing/LandingSectionHeader";
import {
  LANDING_COMPARISON,
  LANDING_FAQ,
  LANDING_FINAL_CTA,
  LANDING_PROBLEM,
  LANDING_REVENUE,
  LANDING_SOLUTION,
  LANDING_WHY,
} from "@/features/brand/constants/landing-home-content";
import { useLandingReveal } from "@/features/brand/hooks/useLandingReveal";
import { cn } from "@/lib/utils";

const PROBLEM_ICONS = [FileWarning, Link2, Sheet, CircleDollarSign] as const;
const SOLUTION_ICONS = [ShieldCheck, ClipboardList, CircleDollarSign] as const;
const WHY_ICONS = [ServerOff, Timer, Sheet, CircleDollarSign] as const;

const CLAIMS_SCREENSHOT = "/landing/product-screenshots/insurance-claims.png";
const REPORTS_SCREENSHOT = "/landing/product-screenshots/reports-insights.png";

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
    <div className="mx-auto max-w-3xl divide-y divide-[color:var(--landing-border)]">
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
        <LandingReveal>
          <LandingSectionHeader
            title={LANDING_PROBLEM.title}
            description={LANDING_PROBLEM.description}
            align="center"
            className="mx-auto"
          />
          <ul className="mx-auto mt-16 grid max-w-5xl gap-5 sm:grid-cols-2">
            {LANDING_PROBLEM.items.map((item, index) => {
              const Icon = PROBLEM_ICONS[index] ?? FileWarning;
              return (
                <li key={item.title} className="landing-card p-7 sm:p-8">
                  <div className="flex size-10 items-center justify-center rounded-[12px] bg-[color:var(--landing-warm)] text-[color:var(--landing-teal)]">
                    <Icon className="size-5" strokeWidth={1.75} aria-hidden="true" />
                  </div>
                  <h3 className="landing-text-ink mt-5 font-[family-name:var(--font-bricolage)] text-lg font-semibold tracking-tight">
                    {item.title}
                  </h3>
                  <p className="landing-body mt-2 text-base leading-[1.7] text-[color:var(--landing-ledger-ink)]">
                    {item.description}
                  </p>
                </li>
              );
            })}
          </ul>
          <p className="landing-body landing-text-ink mx-auto mt-12 max-w-2xl text-center text-base font-medium leading-[1.7] sm:text-lg">
            {LANDING_PROBLEM.closing}
          </p>
        </LandingReveal>
      </LandingSection>

      <LandingSection variant="muted">
        <LandingReveal>
          <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-16">
            <div>
              <LandingSectionHeader
                title={LANDING_SOLUTION.title}
                description={LANDING_SOLUTION.description}
              />
              <ul className="mt-10 space-y-8">
                {LANDING_SOLUTION.items.map((item, index) => {
                  const Icon = SOLUTION_ICONS[index] ?? ShieldCheck;
                  return (
                    <li key={item.title} className="flex gap-4">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-[12px] bg-white text-[color:var(--landing-teal)] shadow-[var(--landing-shadow)]">
                        <Icon
                          className="size-5"
                          strokeWidth={1.75}
                          aria-hidden="true"
                        />
                      </div>
                      <div>
                        <h3 className="landing-text-ink font-[family-name:var(--font-bricolage)] text-lg font-semibold tracking-tight">
                          {item.title}
                        </h3>
                        <p className="landing-body mt-2 max-w-[40ch] text-base leading-[1.7] text-[color:var(--landing-ledger-ink)]">
                          {item.description}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
            <LandingProductScreenshot
              src={CLAIMS_SCREENSHOT}
              alt="Sigma insurance claims list with statuses"
              elevated
            />
          </div>
        </LandingReveal>
      </LandingSection>

      <LandingSection variant="white">
        <LandingReveal>
          <LandingSectionHeader
            title={LANDING_COMPARISON.title}
            align="center"
            className="mx-auto"
          />
          <div className="landing-card mt-14 grid overflow-hidden lg:grid-cols-2">
            <div className="border-b border-[color:var(--landing-border)] p-8 sm:p-10 lg:border-b-0 lg:border-r">
              <h3 className="landing-body text-sm font-medium text-[color:var(--landing-ledger-ink)]">
                {LANDING_COMPARISON.before.label}
              </h3>
              <ul className="mt-7 space-y-5">
                {LANDING_COMPARISON.before.items.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-base leading-[1.65] text-[color:var(--landing-ledger-ink)]"
                  >
                    <Ban
                      className="mt-0.5 size-5 shrink-0 text-[color:var(--landing-ledger-ink)]/40"
                      strokeWidth={1.75}
                      aria-hidden="true"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-[color:var(--landing-warm)] p-8 sm:p-10">
              <h3 className="landing-body text-sm font-medium text-[color:var(--landing-teal)]">
                {LANDING_COMPARISON.after.label}
              </h3>
              <ul className="mt-7 space-y-5">
                {LANDING_COMPARISON.after.items.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-base font-medium leading-[1.65] text-[color:var(--landing-ink)]"
                  >
                    <CheckCircle2
                      className="mt-0.5 size-5 shrink-0 text-[color:var(--landing-teal)]"
                      strokeWidth={1.75}
                      aria-hidden="true"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </LandingReveal>
      </LandingSection>

      <LandingSection variant="muted">
        <LandingReveal>
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <LandingProductScreenshot
              src={REPORTS_SCREENSHOT}
              alt="Sigma reports and revenue insights dashboard"
              elevated
              className="order-2 lg:order-1"
            />
            <div className="order-1 lg:order-2">
              <LandingSectionHeader
                title={LANDING_REVENUE.title}
                description={LANDING_REVENUE.description}
              />
              <ul className="mt-10 grid gap-3 sm:grid-cols-2">
                {LANDING_REVENUE.items.map((item) => (
                  <li
                    key={item}
                    className="rounded-[16px] bg-white px-4 py-4 text-sm font-medium text-[color:var(--landing-ink)] shadow-[var(--landing-shadow)]"
                  >
                    <span className="mr-2 inline-block size-1.5 rounded-full bg-[color:var(--landing-teal)] align-middle" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </LandingReveal>
      </LandingSection>

      <LandingSection variant="white">
        <LandingReveal>
          <LandingSectionHeader
            title={LANDING_WHY.title}
            description={LANDING_WHY.description}
            align="center"
            className="mx-auto"
          />
          <ul className="mx-auto mt-16 grid max-w-5xl gap-5 sm:grid-cols-2">
            {LANDING_WHY.items.map((item, index) => {
              const Icon = WHY_ICONS[index] ?? Sparkles;
              return (
                <li key={item.title} className="landing-card p-7 sm:p-8">
                  <div className="flex size-10 items-center justify-center rounded-[12px] bg-[color:var(--landing-warm)] text-[color:var(--landing-teal)]">
                    <Icon className="size-5" strokeWidth={1.75} aria-hidden="true" />
                  </div>
                  <h3 className="landing-text-ink mt-5 font-[family-name:var(--font-bricolage)] text-lg font-semibold tracking-tight">
                    {item.title}
                  </h3>
                  <p className="landing-body mt-2 text-base leading-[1.7] text-[color:var(--landing-ledger-ink)]">
                    {item.description}
                  </p>
                </li>
              );
            })}
          </ul>
        </LandingReveal>
      </LandingSection>

      <LandingSection variant="white">
        <LandingReveal>
          <LandingSectionHeader
            title={LANDING_FAQ.title}
            align="center"
            className="mx-auto"
          />
          <div className="landing-card mt-12 px-6 sm:px-8">
            <LandingFaqAccordion />
          </div>
        </LandingReveal>
      </LandingSection>

      <LandingSection variant="muted" className="!pt-20 !pb-24 sm:!pt-24 sm:!pb-28">
        <LandingReveal>
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
            <LandingSectionHeader
              title={LANDING_FINAL_CTA.title}
              description={LANDING_FINAL_CTA.description}
              align="center"
              className="mx-auto"
            />
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href={LANDING_FINAL_CTA.primaryCta.href}
                className="landing-focus landing-btn-primary inline-flex min-h-11 items-center justify-center rounded-full px-7 py-3 text-sm font-semibold"
              >
                {LANDING_FINAL_CTA.primaryCta.label}
              </Link>
              <Link
                href={LANDING_FINAL_CTA.secondaryCta.href}
                className="landing-focus landing-btn-secondary inline-flex min-h-11 items-center justify-center rounded-full border px-7 py-3 text-sm font-semibold"
              >
                {LANDING_FINAL_CTA.secondaryCta.label}
              </Link>
            </div>
          </div>
        </LandingReveal>
      </LandingSection>

      <LandingFooter />
    </>
  );
}
