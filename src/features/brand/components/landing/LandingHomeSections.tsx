"use client";

import {
  AlertTriangle,
  BarChart3,
  CalendarClock,
  ChevronDown,
  ClipboardList,
  FileText,
  Package,
  ShieldCheck,
  Stethoscope,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { ROUTES } from "@/constants/routes";
import {
  LANDING_FAQ,
  LANDING_FEATURES,
  LANDING_FINAL_CTA,
  LANDING_HOW_IT_WORKS,
  LANDING_PRICING,
  LANDING_PROBLEM,
  LANDING_TESTIMONIALS,
} from "@/features/brand/constants/landing-home-content";
import { LandingSectionHeader } from "@/features/brand/components/landing/LandingSectionHeader";
import { cn } from "@/lib/utils";

const PROBLEM_ICONS = [
  FileText,
  AlertTriangle,
  Wallet,
  Package,
  ClipboardList,
  BarChart3,
] as const;

const FEATURE_ICONS = [
  Stethoscope,
  Wallet,
  Package,
  CalendarClock,
  FileText,
  ShieldCheck,
] as const;

function LandingFaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="mx-auto max-w-3xl space-y-3">
      {LANDING_FAQ.items.map((item, index) => {
        const isOpen = openIndex === index;

        return (
          <div
            key={item.question}
            className="overflow-hidden rounded-2xl border border-brand-border bg-white"
          >
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : index)}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
            >
              <span className="text-base font-semibold text-brand-navy">
                {item.question}
              </span>
              <ChevronDown
                className={cn(
                  "size-5 shrink-0 text-brand-muted transition-transform",
                  isOpen && "rotate-180",
                )}
              />
            </button>
            {isOpen ? (
              <div className="border-t border-brand-border px-5 py-4 text-sm leading-7 text-brand-muted">
                {item.answer}
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
      <section className="border-t border-brand-border bg-[#fafbfc] py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 sm:px-12">
          <LandingSectionHeader
            eyebrow={LANDING_PROBLEM.eyebrow}
            title={LANDING_PROBLEM.title}
            description={LANDING_PROBLEM.description}
          />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {LANDING_PROBLEM.items.map((item, index) => {
              const Icon = PROBLEM_ICONS[index] ?? AlertTriangle;

              return (
                <article
                  key={item.title}
                  className="rounded-2xl border border-brand-border bg-white p-6 shadow-[0_8px_30px_rgba(30,45,64,0.04)]"
                >
                  <div className="flex size-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
                    <Icon className="size-5" aria-hidden="true" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-brand-navy">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-brand-muted">
                    {item.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 sm:px-12">
          <LandingSectionHeader
            eyebrow={LANDING_FEATURES.eyebrow}
            title={LANDING_FEATURES.title}
            description={LANDING_FEATURES.description}
          />
          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {LANDING_FEATURES.items.map((item, index) => {
              const Icon = FEATURE_ICONS[index] ?? Stethoscope;

              return (
                <article
                  key={item.title}
                  className="group rounded-2xl border border-brand-border bg-white p-6 transition-shadow hover:shadow-[0_12px_40px_rgba(21,101,216,0.08)]"
                >
                  <div className="flex size-11 items-center justify-center rounded-xl bg-brand-tint text-brand-primary transition-colors group-hover:bg-brand-primary group-hover:text-white">
                    <Icon className="size-5" aria-hidden="true" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-brand-navy">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-brand-muted">
                    {item.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-y border-brand-border bg-brand-tint/40 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 sm:px-12">
          <LandingSectionHeader
            eyebrow={LANDING_HOW_IT_WORKS.eyebrow}
            title={LANDING_HOW_IT_WORKS.title}
            description={LANDING_HOW_IT_WORKS.description}
          />
          <ol className="mt-12 grid gap-6 lg:grid-cols-2">
            {LANDING_HOW_IT_WORKS.steps.map((step, index) => (
              <li
                key={step.title}
                className="flex gap-5 rounded-2xl border border-brand-border bg-white p-6"
              >
                <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand-primary text-sm font-bold text-white">
                  {index + 1}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-brand-navy">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-brand-muted">
                    {step.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 sm:px-12">
          <LandingSectionHeader
            eyebrow={LANDING_TESTIMONIALS.eyebrow}
            title={LANDING_TESTIMONIALS.title}
            description={LANDING_TESTIMONIALS.description}
            align="center"
            className="mx-auto"
          />
          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {LANDING_TESTIMONIALS.items.map((item) => (
              <figure
                key={item.name}
                className="flex h-full flex-col rounded-2xl border border-brand-border bg-[#fafbfc] p-6"
              >
                <blockquote className="flex-1 text-base leading-7 text-brand-slate">
                  &ldquo;{item.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3 border-t border-brand-border pt-5">
                  <div className="flex size-11 items-center justify-center rounded-full bg-brand-primary/10 text-sm font-semibold text-brand-primary">
                    {item.initials}
                  </div>
                  <div>
                    <p className="font-semibold text-brand-navy">{item.name}</p>
                    <p className="text-sm text-brand-muted">{item.role}</p>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#fafbfc] py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 sm:px-12">
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
                  "relative flex flex-col rounded-2xl border bg-white p-6 sm:p-8",
                  plan.highlighted
                    ? "border-brand-primary shadow-[0_16px_48px_rgba(21,101,216,0.12)] lg:-translate-y-1"
                    : "border-brand-border",
                )}
              >
                {"badge" in plan && plan.badge ? (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-primary px-3 py-1 text-xs font-semibold text-white">
                    {plan.badge}
                  </span>
                ) : null}
                <h3 className="text-lg font-semibold text-brand-navy">{plan.name}</h3>
                <p className="mt-4 font-[family-name:var(--font-bricolage)] text-4xl font-extrabold text-brand-navy">
                  {plan.price}
                </p>
                <p className="mt-1 text-sm text-brand-muted">{plan.period}</p>
                <ul className="mt-6 flex-1 space-y-3">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2 text-sm text-brand-slate"
                    >
                      <span className="mt-1 size-1.5 shrink-0 rounded-full bg-brand-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.href}
                  className={cn(
                    "mt-8 inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition-colors",
                    plan.highlighted
                      ? "bg-brand-primary text-white hover:bg-[#1254b8]"
                      : "border border-brand-navy text-brand-navy hover:bg-brand-tint",
                  )}
                >
                  {plan.cta}
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 sm:px-12">
          <LandingSectionHeader
            eyebrow={LANDING_FAQ.eyebrow}
            title={LANDING_FAQ.title}
            align="center"
            className="mx-auto"
          />
          <div className="mt-12">
            <LandingFaqAccordion />
          </div>
        </div>
      </section>

      <section className="bg-brand-navy py-20 text-white sm:py-24">
        <div className="mx-auto max-w-4xl px-6 text-center sm:px-12">
          <h2 className="font-[family-name:var(--font-bricolage)] text-3xl font-extrabold tracking-[-0.03em] sm:text-4xl">
            {LANDING_FINAL_CTA.title}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-white/75 sm:text-lg">
            {LANDING_FINAL_CTA.description}
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href={LANDING_FINAL_CTA.primaryCta.href}
              className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-brand-navy transition-colors hover:bg-brand-tint"
            >
              {LANDING_FINAL_CTA.primaryCta.label}
            </Link>
            <Link
              href={LANDING_FINAL_CTA.secondaryCta.href}
              className="inline-flex items-center justify-center rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              {LANDING_FINAL_CTA.secondaryCta.label}
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-brand-border bg-white py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 sm:flex-row sm:px-12">
          <p className="font-[family-name:var(--font-bricolage)] text-lg font-extrabold text-brand-navy">
            Sigma Health
          </p>
          <div className="flex flex-wrap items-center justify-center gap-5 text-sm text-brand-muted">
            <Link href="/privacy" className="hover:text-brand-navy">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-brand-navy">
              Terms
            </Link>
            <Link href={ROUTES.contacts} className="hover:text-brand-navy">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </>
  );
}
