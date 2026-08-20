"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { type ReactNode } from "react";

import { ROUTES } from "@/constants/routes";
import { BrandSplitHero } from "@/features/brand/components/landing/BrandSplitHero";
import { useLandingReveal } from "@/features/brand/hooks/useLandingReveal";

const PHOTO = {
  collab: "/landing/hero-clinic-care.png",
  pharmacy: "/landing/hero-clinic-billing.jpg",
  consult: "/landing/hero-clinic-consult.png",
  cover: "/landing/hero-clinic-corridor.png",
  clinic: "/landing/hero-clinic.jpg",
  field: "/landing/comparison-stop-chasing.jpg",
} as const;

const GAPS = [
  { from: "Paper records", to: "delayed claims" },
  { from: "Delayed claims", to: "delayed payments" },
  { from: "Missing stock counts", to: "empty shelves" },
  { from: "Scattered reports", to: "blind decisions" },
] as const;

const BELIEFS = [
  {
    title: "Software should disappear into the day.",
    body: "If a busy morning needs a training manual, we failed.",
  },
  {
    title: "Revenue should survive the visit.",
    body: "Care delivered is value earned. The system should finish the job.",
  },
  {
    title: "Every claim stays visible.",
    body: "Submitted, rejected, waiting, paid. No mystery queue.",
  },
  {
    title: "Modern tools are not a hospital luxury.",
    body: "A three-person clinic deserves calm software too.",
  },
] as const;

const FUTURE = [
  {
    title: "AI-assisted documentation",
    body: "Help clinicians finish notes without losing the thread of care.",
  },
  {
    title: "Smarter claims",
    body: "Catch missing rules before a claim leaves the clinic.",
  },
  {
    title: "National integrations",
    body: "Connect schemes, registries, and reporting with less glue work.",
  },
  {
    title: "Clearer reporting",
    body: "Answers in minutes. Not after another spreadsheet merge.",
  },
  {
    title: "Offline-first workflows",
    body: "Keep the day moving when the connection drops.",
  },
] as const;

function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const { ref, isVisible } = useLandingReveal();
  const reduce = useReducedMotion();

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={reduce ? false : { opacity: 0, y: 18 }}
      animate={
        reduce || isVisible
          ? { opacity: 1, y: 0 }
          : { opacity: 0, y: 18 }
      }
      transition={{
        duration: 0.65,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

export function BrandCompanyPage() {
  return (
    <>
      <main>
        <BrandSplitHero
          eyebrow="Company"
          title="Healthcare software shouldn't create more work."
          description="Clinics lose hours to paperwork, billing gaps, inventory surprises, and insurance follow-ups. Sigma exists to close those gaps so teams can stay with patients."
          src={PHOTO.collab}
          alt="Clinicians reviewing patient work together at a clinic desk"
          imageClassName="object-[center_20%]"
          actions={
            <>
              <Link
                href={ROUTES.contacts}
                className="landing-focus landing-btn-primary inline-flex min-h-11 items-center justify-center rounded-full px-7 py-3 text-sm font-semibold"
              >
                Request a demo
              </Link>
              <Link
                href={ROUTES.signup}
                className="landing-focus landing-btn-secondary inline-flex min-h-11 items-center justify-center rounded-full border px-7 py-3 text-sm font-semibold"
              >
                Start free trial
              </Link>
            </>
          }
        />

        <section className="bg-white py-20 sm:py-28">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 sm:px-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16 lg:px-12">
            <Reveal>
              <Image
                src={PHOTO.cover}
                alt="Clinician walking through a busy clinic corridor"
                width={1600}
                height={2000}
                quality={90}
                className="aspect-[4/5] w-full object-cover object-[center_30%] sm:aspect-[5/4]"
                sizes="(min-width: 1024px) 44vw, 100vw"
              />
            </Reveal>
            <Reveal delay={0.08}>
              <blockquote className="max-w-[28rem]">
                <span
                  aria-hidden="true"
                  className="mb-7 block h-0.5 w-12 bg-[color:var(--landing-teal)]"
                />
                <p className="landing-display text-[clamp(1.7rem,3.4vw,2.75rem)] font-medium italic leading-[1.2] tracking-[-0.035em] text-[color:var(--landing-ink)] text-balance">
                  Clinics don&apos;t lose money because they lack patients.
                </p>
                <p className="landing-body mt-5 text-base leading-[1.7] text-[color:var(--landing-ledger-ink)] sm:text-lg">
                  They lose it when bills, claims, and payments fall out of
                  sync—and nobody can see the trail.
                </p>
              </blockquote>
            </Reveal>
          </div>
        </section>

        <section className="border-y border-[color:var(--landing-border)] bg-white py-20 sm:py-28">
          <div className="mx-auto max-w-6xl px-6 sm:px-10 lg:px-12">
            <div className="grid gap-12 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-start lg:gap-20">
              <Reveal className="lg:sticky lg:top-28">
                <h2 className="landing-display max-w-[14ch] text-[clamp(2rem,4.2vw,3.25rem)] font-semibold tracking-[-0.045em] text-[color:var(--landing-ink)]">
                  Paper becomes delay. Delay becomes unpaid care.
                </h2>
                <div className="mt-8">
                  <Image
                    src={PHOTO.pharmacy}
                    alt="Clinic finance work at a billing desk"
                    width={1200}
                    height={1500}
                    className="aspect-[4/5] w-full object-cover"
                    sizes="(min-width: 1024px) 36vw, 100vw"
                  />
                </div>
              </Reveal>

              <ol className="border-t border-[color:var(--landing-border)]">
                {GAPS.map((gap, index) => (
                  <Reveal key={gap.from} delay={index * 0.04}>
                    <li className="border-b border-[color:var(--landing-border)] py-7 sm:py-8">
                      <p className="landing-display text-sm font-semibold tabular-nums text-[color:var(--landing-teal)]">
                        {String(index + 1).padStart(2, "0")}
                      </p>
                      <p className="landing-display mt-3 text-xl font-semibold tracking-[-0.02em] text-[color:var(--landing-ink)] sm:text-2xl">
                        {gap.from}
                      </p>
                      <p className="landing-body mt-2 text-base text-[color:var(--landing-ledger-ink)]">
                        becomes{" "}
                        <span className="font-semibold text-[color:var(--landing-teal)]">
                          {gap.to}
                        </span>
                        .
                      </p>
                    </li>
                  </Reveal>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <section className="bg-[color:var(--landing-warm)] py-20 sm:py-28">
          <Reveal className="mx-auto max-w-4xl px-6 text-center sm:px-10">
            <span
              aria-hidden="true"
              className="mx-auto mb-7 block h-0.5 w-12 bg-[color:var(--landing-teal)]"
            />
            <p className="landing-display text-[clamp(1.7rem,3.8vw,3rem)] font-medium italic tracking-[-0.04em] leading-[1.15] text-[color:var(--landing-ink)]">
              We&apos;re building software that closes those gaps.
            </p>
          </Reveal>
        </section>

        <section className="bg-white py-20 sm:py-28">
          <div className="mx-auto max-w-6xl px-6 sm:px-10 lg:px-12">
            <Reveal>
              <h2 className="landing-display max-w-[16ch] text-[clamp(2rem,4.2vw,3.25rem)] font-semibold tracking-[-0.045em] text-[color:var(--landing-ink)]">
                Built beside the work, not above it.
              </h2>
              <p className="landing-body mt-5 max-w-[34rem] text-base leading-[1.7] text-[color:var(--landing-ledger-ink)] sm:text-lg">
                Registration desks. Pharmacy counters. Claims queues. Reporting
                nights. Sigma sits inside those moments.
              </p>
            </Reveal>

            <div className="mt-14 grid gap-6 md:grid-cols-12 md:gap-8">
              <Reveal className="md:col-span-7">
                <Image
                  src={PHOTO.consult}
                  alt="Nurse reviewing charts beside a clinic computer"
                  width={1400}
                  height={1100}
                  className="aspect-[5/4] w-full object-cover"
                  sizes="(max-width: 768px) 100vw, 55vw"
                />
              </Reveal>
              <div className="flex flex-col justify-between gap-8 md:col-span-5 md:pt-10">
                <Reveal delay={0.06}>
                  <Image
                    src={PHOTO.clinic}
                    alt="Clinic team working during an active shift"
                    width={900}
                    height={700}
                    className="aspect-[5/4] w-full object-cover"
                    sizes="(max-width: 768px) 100vw, 35vw"
                  />
                </Reveal>
                <Reveal delay={0.1}>
                  <div>
                    <p className="landing-display text-5xl font-semibold tracking-tight text-[color:var(--landing-teal)] sm:text-6xl">
                      47
                    </p>
                    <p className="landing-body mt-3 max-w-[22rem] text-sm leading-[1.65] text-[color:var(--landing-ledger-ink)] sm:text-base">
                      Clinics running daily operations on Sigma across Africa,
                      Asia, and the Americas.
                    </p>
                  </div>
                </Reveal>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-[color:var(--landing-border)] bg-white py-20 sm:py-28">
          <div className="mx-auto max-w-6xl px-6 sm:px-10 lg:px-12">
            <Reveal>
              <h2 className="landing-display max-w-[12ch] text-[clamp(2rem,4.2vw,3.25rem)] font-semibold tracking-[-0.045em] text-[color:var(--landing-ink)]">
                What we believe
              </h2>
            </Reveal>

            <div className="mt-14 space-y-12">
              {BELIEFS.map((belief, index) => (
                <Reveal
                  key={belief.title}
                  delay={index * 0.04}
                  className={
                    index % 2 === 1
                      ? "max-w-2xl border-r-2 border-[color:var(--landing-teal)] pr-6 text-right sm:ml-auto sm:pr-8"
                      : "max-w-2xl border-l-2 border-[color:var(--landing-teal)] pl-6 sm:pl-8"
                  }
                >
                  <h3 className="landing-display text-xl font-semibold tracking-[-0.02em] text-[color:var(--landing-ink)] sm:text-2xl">
                    {belief.title}
                  </h3>
                  <p className="landing-body mt-3 text-base leading-[1.65] text-[color:var(--landing-ledger-ink)]">
                    {belief.body}
                  </p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white py-20 sm:py-28">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 sm:px-10 lg:grid-cols-2 lg:gap-16 lg:px-12">
            <Reveal>
              <h2 className="landing-display text-[clamp(2rem,4vw,3rem)] font-semibold tracking-[-0.045em] text-[color:var(--landing-ink)]">
                From visit to payment, without the scavenger hunt.
              </h2>
              <p className="landing-body mt-5 max-w-[34rem] text-base leading-[1.7] text-[color:var(--landing-ledger-ink)] sm:text-lg">
                Patient care creates a trail of records, bills, claims, and
                stock movements. Sigma keeps that trail intact so nothing
                important disappears after the patient leaves.
              </p>
              <Link
                href={ROUTES.solutions}
                className="landing-focus mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[color:var(--landing-teal)] transition-colors hover:text-[color:var(--landing-teal-hover)]"
              >
                See solutions
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </Link>
            </Reveal>

            <Reveal delay={0.08}>
              <Image
                src={PHOTO.field}
                alt="Healthcare team reviewing clinic operations"
                width={1200}
                height={900}
                className="aspect-[5/4] w-full object-cover"
                sizes="(min-width: 1024px) 42vw, 100vw"
              />
            </Reveal>
          </div>
        </section>

        <section className="border-y border-[color:var(--landing-border)] bg-white py-16 sm:py-20">
          <div className="mx-auto grid max-w-6xl gap-10 px-6 sm:grid-cols-3 sm:px-10 lg:px-12">
            {[
              { value: "47", label: "Clinics live on Sigma" },
              { value: "Millions", label: "Patient visits managed" },
              { value: "<8 hrs", label: "Average setup time" },
            ].map((stat, index) => (
              <Reveal
                key={stat.label}
                delay={index * 0.06}
                className="text-center sm:text-left"
              >
                <p className="landing-display text-5xl font-semibold tracking-tight text-[color:var(--landing-teal)] sm:text-6xl">
                  {stat.value}
                </p>
                <p className="landing-body mt-3 text-sm text-[color:var(--landing-ledger-ink)] sm:text-base">
                  {stat.label}
                </p>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="bg-[color:var(--landing-warm)] py-20 sm:py-28">
          <div className="mx-auto max-w-6xl px-6 sm:px-10 lg:px-12">
            <Reveal>
              <h2 className="landing-display max-w-[12ch] text-[clamp(2rem,4.2vw,3.25rem)] font-semibold tracking-[-0.045em] text-[color:var(--landing-ink)]">
                Still early. Still ambitious.
              </h2>
              <p className="landing-body mt-5 max-w-[34rem] text-base leading-[1.7] text-[color:var(--landing-ledger-ink)] sm:text-lg">
                We are proud of what clinics run on today. We spend more time on
                what is still missing.
              </p>
            </Reveal>

            <ol className="mt-14 border-t border-[color:var(--landing-border)]">
              {FUTURE.map((item, index) => (
                <Reveal key={item.title} delay={index * 0.04}>
                  <li className="grid gap-3 border-b border-[color:var(--landing-border)] py-7 sm:grid-cols-[4rem_1fr] sm:gap-8 sm:py-8">
                    <span className="landing-display text-sm font-semibold tabular-nums text-[color:var(--landing-teal)]">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h3 className="landing-display text-lg font-semibold tracking-[-0.02em] text-[color:var(--landing-ink)] sm:text-xl">
                        {item.title}
                      </h3>
                      <p className="landing-body mt-2 max-w-[40rem] text-sm leading-[1.65] text-[color:var(--landing-ledger-ink)] sm:text-base">
                        {item.body}
                      </p>
                    </div>
                  </li>
                </Reveal>
              ))}
            </ol>
          </div>
        </section>

        <section className="bg-white py-20 sm:py-28">
          <Reveal className="mx-auto max-w-4xl px-6 text-center sm:px-10">
            <h2 className="landing-display text-[clamp(2.1rem,4.5vw,3.5rem)] font-semibold tracking-[-0.045em] text-[color:var(--landing-ink)]">
              Every clinic deserves better software.
            </h2>
            <p className="landing-body mx-auto mt-5 max-w-[34rem] text-base leading-[1.7] text-[color:var(--landing-ledger-ink)] sm:text-lg">
              If your clinic is ready to spend less time on administration and more
              time caring for patients, we would love to show you Sigma.
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href={ROUTES.contacts}
                className="landing-focus landing-btn-primary inline-flex min-h-11 items-center justify-center rounded-full px-7 py-3 text-sm font-semibold"
              >
                Book a Demo
              </Link>
              <Link
                href={ROUTES.signup}
                className="landing-focus landing-btn-secondary inline-flex min-h-11 items-center justify-center rounded-full border px-7 py-3 text-sm font-semibold"
              >
                Start Free Trial
              </Link>
            </div>
          </Reveal>
        </section>
      </main>
    </>
  );
}
