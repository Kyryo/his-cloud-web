"use client";

import {
  AlertTriangle,
  BarChart3,
  ChevronDown,
  ClipboardList,
  Clock,
  FileText,
  Headset,
  Monitor,
  Package,
  PieChart,
  Stethoscope,
  TrendingUp,
  Wallet,
  Wifi,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { useState } from "react";

import { LandingBulletCard } from "@/features/brand/components/landing/LandingBulletCard";
import { LandingCoverSection } from "@/features/brand/components/landing/LandingCoverSection";
import { LandingFooter } from "@/features/brand/components/landing/LandingFooter";
import { LandingInteractiveDemo } from "@/features/brand/components/landing/LandingInteractiveDemo";
import { LandingSection } from "@/features/brand/components/landing/LandingSection";
import { LandingSectionHeader } from "@/features/brand/components/landing/LandingSectionHeader";
import { LandingStepCard } from "@/features/brand/components/landing/LandingStepCard";
import {
  LANDING_FAQ,
  LANDING_FEATURES,
  LANDING_FINAL_CTA,
  LANDING_HOW_IT_WORKS,
  LANDING_PRICING,
  LANDING_PROBLEM,
  LANDING_TRUST,
} from "@/features/brand/constants/landing-home-content";
import { useLandingReveal } from "@/features/brand/hooks/useLandingReveal";
import { cn } from "@/lib/utils";

const PROBLEM_ICONS = [Package, Wallet, FileText] as const;
const TRUST_ICONS = [Monitor, Clock, Wifi, Headset] as const;
const FEATURE_ICONS = [
  BarChart3,
  PieChart,
  ClipboardList,
  Stethoscope,
  Package,
  AlertTriangle,
  TrendingUp,
] as const;

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
    <div className="mx-auto max-w-3xl space-y-3">
      {LANDING_FAQ.items.map((item, index) => {
        const isOpen = openIndex === index;

        return (
          <div
            key={item.question}
            className="landing-card overflow-hidden rounded-[14px] bg-white"
          >
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : index)}
              className="landing-focus flex min-h-11 w-full items-center justify-between gap-4 px-5 py-4 text-left"
              aria-expanded={isOpen}
            >
              <span className="landing-text-ink text-base font-semibold">
                {item.question}
              </span>
              <ChevronDown
                className={cn(
                  "size-5 shrink-0 text-brand-muted transition-transform",
                  isOpen && "rotate-180",
                )}
                aria-hidden="true"
              />
            </button>
            {isOpen ? (
              <div className="border-t border-brand-border/60 px-5 py-4">
                <p className="landing-body text-base leading-relaxed text-[color:var(--landing-ledger-ink)]">
                  {item.answer}
                </p>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

export function LandingHomeSections() {
  return (
    <>
      <LandingSection variant="warm">
        <LandingReveal>
          <LandingSectionHeader
            eyebrow={LANDING_PROBLEM.eyebrow}
            title={LANDING_PROBLEM.title}
            description={LANDING_PROBLEM.description}
          />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {LANDING_PROBLEM.items.map((item, index) => {
              const Icon = PROBLEM_ICONS[index] ?? AlertTriangle;
              return (
                <LandingBulletCard
                  key={item.title}
                  title={item.title}
                  description={item.description}
                  icon={Icon}
                  accent="amber"
                />
              );
            })}
          </div>
          <div className="mx-auto mt-12 max-w-3xl space-y-4 text-center">
            <p className="landing-body text-base leading-relaxed text-[color:var(--landing-ledger-ink)] sm:text-lg">
              {LANDING_PROBLEM.summary}
            </p>
            <p className="landing-body landing-text-ink text-base font-semibold leading-relaxed sm:text-lg">
              {LANDING_PROBLEM.closing}
            </p>
          </div>
        </LandingReveal>
      </LandingSection>

      <LandingSection variant="clay">
        <LandingReveal>
          <LandingSectionHeader
            title={LANDING_TRUST.title}
            description={LANDING_TRUST.description}
            accent="teal"
          />
          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {LANDING_TRUST.items.map((item, index) => {
              const Icon = TRUST_ICONS[index] ?? Monitor;
              return (
                <LandingBulletCard
                  key={item.title}
                  title={item.title}
                  description={item.description}
                  icon={Icon}
                  accent="teal"
                />
              );
            })}
          </div>
          <p className="landing-body landing-text-ink mx-auto mt-12 max-w-2xl text-center text-lg font-semibold">
            {LANDING_TRUST.closing}
          </p>
        </LandingReveal>
      </LandingSection>

      <LandingCoverSection />

      <LandingSection variant="warm">
        <LandingReveal>
          <LandingSectionHeader
            title={LANDING_FEATURES.title}
            description={LANDING_FEATURES.description}
          />
          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {LANDING_FEATURES.items.map((item, index) => {
              const Icon = FEATURE_ICONS[index] ?? Stethoscope;
              return (
                <LandingBulletCard
                  key={item.title}
                  title={item.title}
                  description={item.description}
                  icon={Icon}
                  accent="green"
                  className={index === 6 ? "xl:col-span-1" : undefined}
                />
              );
            })}
          </div>
          <p className="landing-body mx-auto mt-12 max-w-3xl text-center text-base leading-relaxed text-[color:var(--landing-ledger-ink)] sm:text-lg">
            {LANDING_FEATURES.closing}
          </p>
        </LandingReveal>
      </LandingSection>

      <LandingSection variant="clay">
        <LandingReveal>
          <LandingSectionHeader title={LANDING_HOW_IT_WORKS.title} />
          <ol className="mt-12 grid gap-6 lg:grid-cols-2">
            {LANDING_HOW_IT_WORKS.steps.map((step, index) => (
              <LandingStepCard
                key={step.title}
                step={index + 1}
                title={step.title}
                description={step.description}
              />
            ))}
          </ol>
        </LandingReveal>
      </LandingSection>

      <LandingSection variant="warm">
        <LandingReveal>
          <LandingSectionHeader
            eyebrow="Try it yourself"
            title="A clinic app your staff can actually use"
            description="No login, no setup — explore a working day at a small clinic. Everything you see is how Sigma looks in the browser."
            align="center"
            className="mx-auto"
          />
          <div className="landing-card mt-12 overflow-hidden rounded-[14px] bg-white p-3 sm:p-4">
            <LandingInteractiveDemo />
          </div>
        </LandingReveal>
      </LandingSection>

      <LandingSection variant="clay">
        <LandingReveal>
          <LandingSectionHeader
            eyebrow={LANDING_PRICING.eyebrow}
            title={LANDING_PRICING.title}
            description={LANDING_PRICING.description}
            align="center"
            className="mx-auto"
          />
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {LANDING_PRICING.plans.map((plan) => (
              <article
                key={plan.name}
                className={cn(
                  "landing-card relative flex flex-col rounded-[14px] bg-white p-6 transition-[transform,box-shadow] duration-200 sm:p-8",
                  plan.highlighted
                    ? "ring-2 ring-[color:var(--landing-teal)] lg:-translate-y-1"
                    : "hover:-translate-y-0.5 hover:shadow-[var(--landing-shadow-hover)]",
                )}
              >
                {"badge" in plan && plan.badge ? (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[color:var(--landing-teal)] px-3 py-1 text-xs font-semibold text-white">
                    {plan.badge}
                  </span>
                ) : null}
                <h3 className="landing-text-ink font-[family-name:var(--font-bricolage)] text-lg font-semibold">
                  {plan.name}
                </h3>
                <p className="landing-text-ink mt-4 font-[family-name:var(--font-bricolage)] text-4xl font-extrabold">
                  {plan.price}
                </p>
                <p className="landing-body mt-1 text-sm text-[color:var(--landing-ledger-ink)]">
                  {plan.period}
                </p>
                <ul className="mt-6 flex-1 space-y-3">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2 text-sm text-brand-slate"
                    >
                      <span
                        className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[color:var(--landing-teal)]"
                        aria-hidden="true"
                      />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.href}
                  className={cn(
                    "landing-focus mt-8 inline-flex min-h-11 items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition-colors",
                    plan.highlighted
                      ? "landing-btn-primary"
                      : "landing-btn-secondary border",
                  )}
                >
                  {plan.cta}
                </Link>
              </article>
            ))}
          </div>
        </LandingReveal>
      </LandingSection>

      <LandingSection variant="warm">
        <LandingReveal>
          <LandingSectionHeader
            eyebrow={LANDING_FAQ.eyebrow}
            title={LANDING_FAQ.title}
            align="center"
            className="mx-auto"
          />
          <div className="mt-12">
            <LandingFaqAccordion />
          </div>
        </LandingReveal>
      </LandingSection>

      <LandingSection variant="ink" className="!py-20 sm:!py-24">
        <LandingReveal className="mx-auto max-w-4xl text-center">
          <LandingSectionHeader
            title={LANDING_FINAL_CTA.title}
            description={LANDING_FINAL_CTA.description}
            align="center"
            inverted
            className="mx-auto"
          />
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href={LANDING_FINAL_CTA.primaryCta.href}
              className="landing-focus landing-text-ink inline-flex min-h-11 items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold transition-colors hover:bg-[color:var(--landing-teal-tint)]"
            >
              {LANDING_FINAL_CTA.primaryCta.label}
            </Link>
            <Link
              href={LANDING_FINAL_CTA.secondaryCta.href}
              className="landing-focus inline-flex min-h-11 items-center justify-center rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              {LANDING_FINAL_CTA.secondaryCta.label}
            </Link>
          </div>
        </LandingReveal>
      </LandingSection>

      <LandingFooter />
    </>
  );
}
