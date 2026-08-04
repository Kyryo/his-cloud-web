"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import {
  ArrowUpRight,
  BarChart3,
  MapPinned,
  ShieldCheck,
  Sparkles,
  WifiOff,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef, type ReactNode } from "react";

import { ROUTES } from "@/constants/routes";
import { LandingFooter } from "@/features/brand/components/landing/LandingFooter";
import { LandingProductMockupFrame } from "@/features/brand/components/landing/LandingProductMockupFrame";
import { LandingProductScreenshot } from "@/features/brand/components/landing/LandingProductScreenshot";
import { Navigation } from "@/features/brand/components/Navigation";
import { useLandingReveal } from "@/features/brand/hooks/useLandingReveal";
import { cn } from "@/lib/utils";

const PHOTO = {
  collab: "/landing/company/company-clinicians-collab.png",
  pharmacy: "/landing/company/company-pharmacy-work.png",
  consult: "/landing/company/company-consultation.png",
  cover: "/landing/hospital-girl-cover.jpg",
  clinic: "/landing/sigma-health-landing-img.jpg",
  field: "/landing/case-study-masm-mw.jpg",
} as const;

const SCREEN = {
  patients: "/landing/product-screenshots/client-details.png",
  claims: "/landing/product-screenshots/insurance-claims.png",
  inventory: "/landing/product-screenshots/inventory.png",
  reports: "/landing/product-screenshots/reports-insights.png",
  invoice: "/landing/product-screenshots/claim-invoice.png",
} as const;

const GAPS = [
  {
    from: "Paper records",
    to: "delayed claims",
  },
  {
    from: "Delayed claims",
    to: "delayed payments",
  },
  {
    from: "Missing stock counts",
    to: "empty shelves",
  },
  {
    from: "Scattered reports",
    to: "blind decisions",
  },
] as const;

const BELIEFS = [
  {
    title: "Software should disappear into the day.",
    body: "If a busy morning needs a training manual, we failed.",
    tone: "bg-[color:var(--landing-teal-tint)]",
  },
  {
    title: "Revenue should survive the visit.",
    body: "Care delivered is value earned. The system should finish the job.",
    tone: "bg-[color:var(--landing-amber-tint)]",
  },
  {
    title: "Every claim stays visible.",
    body: "Submitted, rejected, waiting, paid. No mystery queue.",
    tone: "bg-sky-50",
  },
  {
    title: "Modern tools are not a hospital luxury.",
    body: "A three-person clinic deserves calm software too.",
    tone: "bg-[color:var(--landing-green-tint)]",
  },
] as const;

const FUTURE = [
  {
    title: "AI-assisted documentation",
    body: "Help clinicians finish notes without losing the thread of care.",
    icon: Sparkles,
  },
  {
    title: "Smarter claims",
    body: "Catch missing rules before a claim leaves the clinic.",
    icon: ShieldCheck,
  },
  {
    title: "National integrations",
    body: "Connect schemes, registries, and reporting with less glue work.",
    icon: MapPinned,
  },
  {
    title: "Clearer reporting",
    body: "Answers in minutes. Not after another spreadsheet merge.",
    icon: BarChart3,
  },
  {
    title: "Offline-first workflows",
    body: "Keep the day moving when the connection drops.",
    icon: WifiOff,
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

function ParallaxImage({
  src,
  alt,
  className,
  priority = false,
  sizes = "100vw",
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    reduce ? ["0%", "0%"] : ["-6%", "6%"],
  );

  return (
    <div ref={ref} className={cn("relative overflow-hidden", className)}>
      <motion.div style={{ y }} className="absolute inset-[-12%] h-[124%] w-full">
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          className="object-cover"
          sizes={sizes}
        />
      </motion.div>
    </div>
  );
}

function FloatingWindow({
  src,
  alt,
  title,
  className,
  floatClass = "company-float",
}: {
  src: string;
  alt: string;
  title?: string;
  className?: string;
  floatClass?: string;
}) {
  return (
    <div className={cn("pointer-events-none select-none", floatClass, className)}>
      <LandingProductMockupFrame title={title} compact elevated>
        <Image
          src={src}
          alt={alt}
          width={960}
          height={600}
          className="h-auto w-full object-cover object-top"
          sizes="(max-width: 768px) 70vw, 420px"
        />
      </LandingProductMockupFrame>
    </div>
  );
}

export function BrandCompanyPage() {
  return (
    <div className="min-h-dvh bg-white text-[color:var(--landing-ledger-ink)]">
      <a href="#main-content" className="landing-skip-link">
        Skip to main content
      </a>
      <Navigation />

      <main id="main-content">
        {/* Hero: oversized type + mesh + floating product */}
        <section className="company-grain company-mesh relative overflow-hidden pt-28 pb-10 sm:pt-32 sm:pb-16 lg:pt-36">
          <div className="company-dot-grid absolute inset-0 opacity-40" aria-hidden="true" />
          <div className="relative z-10 mx-auto max-w-6xl px-6 sm:px-10 lg:px-12">
            <Reveal>
              <p className="text-sm font-medium text-[color:var(--landing-teal)]">
                Company
              </p>
              <h1 className="landing-display mt-5 max-w-[11ch] text-[clamp(2.6rem,7vw,5.5rem)] font-semibold tracking-[-0.05em] leading-[0.98]">
                Healthcare software shouldn&apos;t create more work.
              </h1>
              <p className="landing-body mt-7 max-w-[32rem] text-[1.05rem] leading-[1.7] sm:text-lg">
                Clinics lose hours to paperwork, billing gaps, inventory
                surprises, and insurance follow-ups. Sigma exists to close those
                gaps so teams can stay with patients.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
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
              </div>
            </Reveal>

            <Reveal delay={0.12} className="relative mt-14 sm:mt-16 lg:mt-20">
              <div className="relative mx-auto max-w-5xl">
                <div className="overflow-hidden rounded-[28px] shadow-[var(--landing-shadow-hero)]">
                  <ParallaxImage
                    src={PHOTO.collab}
                    alt="Clinicians reviewing patient work together at a clinic desk"
                    className="aspect-[16/9] w-full"
                    priority
                    sizes="(max-width: 1200px) 100vw, 1100px"
                  />
                </div>
                <FloatingWindow
                  src={SCREEN.patients}
                  alt="Sigma patient account overview"
                  title="Patient record"
                  className="absolute -bottom-8 right-3 w-[58%] max-w-md sm:-bottom-10 sm:right-8 lg:-bottom-12 lg:right-12"
                />
              </div>
            </Reveal>
          </div>
        </section>

        {/* Full-bleed statement over photography */}
        <section className="relative mt-20 sm:mt-28">
          <div className="relative h-[min(78vh,720px)] w-full overflow-hidden">
            <ParallaxImage
              src={PHOTO.cover}
              alt="Clinician walking through a busy clinic corridor"
              className="absolute inset-0 h-full w-full"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[color:var(--landing-ink)]/75 via-[color:var(--landing-ink)]/25 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 z-10 px-6 pb-12 sm:px-10 sm:pb-16 lg:px-12">
              <Reveal className="mx-auto max-w-6xl">
                <p className="max-w-[18ch] font-[family-name:var(--font-bricolage)] text-[clamp(1.8rem,4vw,3.25rem)] font-semibold tracking-[-0.04em] leading-[1.08] text-white">
                  Clinics don&apos;t lose money because they lack patients.
                </p>
                <p className="mt-4 max-w-[28rem] text-base leading-[1.65] text-white/85 sm:text-lg">
                  They lose money because information falls through the cracks.
                </p>
              </Reveal>
            </div>
          </div>
        </section>

        {/* Gap cascade editorial */}
        <section className="company-grain relative overflow-hidden bg-white py-20 sm:py-28">
          <div
            className="pointer-events-none absolute -left-24 top-10 size-72 rounded-full bg-[color:var(--landing-teal)]/10 blur-3xl"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -right-16 bottom-8 size-80 rounded-full bg-[color:var(--landing-amber)]/15 blur-3xl"
            aria-hidden="true"
          />
          <div className="relative z-10 mx-auto max-w-6xl px-6 sm:px-10 lg:px-12">
            <Reveal>
              <h2 className="landing-display max-w-[14ch] text-[clamp(2rem,4.5vw,3.5rem)] font-semibold tracking-[-0.045em]">
                Paper becomes delay. Delay becomes unpaid care.
              </h2>
            </Reveal>

            <div className="mt-14 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start lg:gap-16">
              <div className="space-y-5">
                {GAPS.map((gap, index) => (
                  <Reveal key={gap.from} delay={index * 0.05}>
                    <div className="rounded-[22px] border border-[color:var(--landing-border)] bg-[color:var(--landing-warm)]/70 px-6 py-5 shadow-[var(--landing-shadow)] backdrop-blur-sm">
                      <p className="font-[family-name:var(--font-bricolage)] text-xl font-semibold tracking-tight text-[color:var(--landing-ink)] sm:text-2xl">
                        {gap.from}
                      </p>
                      <p className="mt-2 text-sm text-[color:var(--landing-ledger-ink)] sm:text-base">
                        becomes{" "}
                        <span className="font-semibold text-[color:var(--landing-teal)]">
                          {gap.to}
                        </span>
                        .
                      </p>
                    </div>
                  </Reveal>
                ))}
              </div>

              <Reveal delay={0.1} className="relative lg:sticky lg:top-28">
                <div className="overflow-hidden rounded-[28px]">
                  <ParallaxImage
                    src={PHOTO.pharmacy}
                    alt="Pharmacist preparing medication in a clinic pharmacy"
                    className="aspect-[4/5] w-full"
                    sizes="(max-width: 1024px) 100vw, 480px"
                  />
                </div>
                <FloatingWindow
                  src={SCREEN.inventory}
                  alt="Sigma inventory screen"
                  title="Inventory"
                  floatClass="company-float-delayed"
                  className="absolute -left-4 bottom-8 w-[70%] max-w-xs sm:-left-8"
                />
              </Reveal>
            </div>
          </div>
        </section>

        {/* Pull quote */}
        <section className="relative bg-[color:var(--landing-warm)] py-20 sm:py-28">
          <div className="company-dot-grid absolute inset-0 opacity-30" aria-hidden="true" />
          <Reveal className="relative z-10 mx-auto max-w-4xl px-6 text-center sm:px-10">
            <p className="font-[family-name:var(--font-bricolage)] text-[clamp(1.7rem,3.8vw,3rem)] font-semibold tracking-[-0.04em] leading-[1.15] text-[color:var(--landing-ink)]">
              &ldquo;We&apos;re building software that closes those gaps.&rdquo;
            </p>
            <p className="mt-6 text-sm font-medium text-[color:var(--landing-teal)]">
              The Sigma mission, in one sentence
            </p>
          </Reveal>
        </section>

        {/* Collage: photography + product narrative */}
        <section className="company-grain overflow-hidden bg-white py-20 sm:py-28">
          <div className="mx-auto max-w-6xl px-6 sm:px-10 lg:px-12">
            <Reveal>
              <h2 className="landing-display max-w-[16ch] text-[clamp(2rem,4.2vw,3.25rem)] font-semibold tracking-[-0.045em]">
                Built beside the work, not above it.
              </h2>
              <p className="landing-body mt-5 max-w-[34rem] text-base leading-[1.7] sm:text-lg">
                Registration desks. Pharmacy counters. Claims queues. Reporting
                nights. Sigma sits inside those moments.
              </p>
            </Reveal>

            <div className="mt-14 grid gap-5 md:grid-cols-12 md:gap-6">
              <Reveal className="relative md:col-span-7">
                <div className="overflow-hidden rounded-[28px]">
                  <ParallaxImage
                    src={PHOTO.consult}
                    alt="Nurse reviewing charts beside a clinic computer"
                    className="aspect-[4/5] w-full md:aspect-[5/4]"
                    sizes="(max-width: 768px) 100vw, 60vw"
                  />
                </div>
                <FloatingWindow
                  src={SCREEN.claims}
                  alt="Sigma claims list"
                  title="Claims"
                  className="absolute -bottom-6 right-4 w-[62%] max-w-sm sm:right-8"
                />
              </Reveal>

              <div className="flex flex-col gap-5 md:col-span-5 md:pt-16">
                <Reveal delay={0.08}>
                  <div className="overflow-hidden rounded-[24px]">
                    <Image
                      src={PHOTO.clinic}
                      alt="Clinic team working during an active shift"
                      width={900}
                      height={700}
                      className="h-auto w-full object-cover"
                    />
                  </div>
                </Reveal>
                <Reveal delay={0.12}>
                  <div className="rounded-[24px] border border-[color:var(--landing-border)] bg-[color:var(--landing-warm)] p-6 shadow-[var(--landing-shadow)] sm:p-7">
                    <p className="font-[family-name:var(--font-bricolage)] text-2xl font-semibold tracking-tight text-[color:var(--landing-ink)]">
                      47
                    </p>
                    <p className="mt-2 text-sm leading-[1.6]">
                      Clinics running daily operations on Sigma across Africa,
                      Asia, and the Americas.
                    </p>
                  </div>
                </Reveal>
                <Reveal delay={0.16}>
                  <LandingProductScreenshot
                    src={SCREEN.reports}
                    alt="Sigma reporting dashboard"
                    elevated
                  />
                </Reveal>
              </div>
            </div>
          </div>
        </section>

        {/* Beliefs: staggered offset cards */}
        <section className="relative overflow-hidden bg-[color:var(--landing-warm)] py-20 sm:py-28">
          <div
            className="pointer-events-none absolute left-1/2 top-0 size-[28rem] -translate-x-1/2 rounded-full bg-white/70 blur-3xl"
            aria-hidden="true"
          />
          <div className="relative z-10 mx-auto max-w-6xl px-6 sm:px-10 lg:px-12">
            <Reveal>
              <h2 className="landing-display max-w-[12ch] text-[clamp(2rem,4.2vw,3.25rem)] font-semibold tracking-[-0.045em]">
                What we believe
              </h2>
            </Reveal>

            <div className="mt-14 space-y-5">
              {BELIEFS.map((belief, index) => (
                <Reveal
                  key={belief.title}
                  delay={index * 0.04}
                  className={cn(
                    "max-w-3xl",
                    index % 2 === 1 && "ml-auto",
                    index === 1 && "md:mr-8",
                    index === 2 && "md:ml-12",
                  )}
                >
                  <article
                    className={cn(
                      "rounded-[26px] border border-white/70 px-7 py-7 shadow-[var(--landing-shadow)] backdrop-blur-md sm:px-9 sm:py-8",
                      belief.tone,
                    )}
                  >
                    <h3 className="font-[family-name:var(--font-bricolage)] text-2xl font-semibold tracking-tight text-[color:var(--landing-ink)] sm:text-[1.7rem]">
                      {belief.title}
                    </h3>
                    <p className="mt-3 max-w-[36rem] text-base leading-[1.65]">
                      {belief.body}
                    </p>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Product woven into story: split with floating invoice */}
        <section className="bg-white py-20 sm:py-28">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 sm:px-10 lg:grid-cols-2 lg:gap-16 lg:px-12">
            <Reveal>
              <h2 className="landing-display text-[clamp(2rem,4vw,3rem)] font-semibold tracking-[-0.045em]">
                From visit to payment, without the scavenger hunt.
              </h2>
              <p className="landing-body mt-5 max-w-[34rem] text-base leading-[1.7] sm:text-lg">
                Patient care creates a trail of records, bills, claims, and stock
                movements. Sigma keeps that trail intact so nothing important
                disappears after the patient leaves.
              </p>
              <Link
                href={ROUTES.features}
                className="landing-focus mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[color:var(--landing-teal)] transition-colors hover:text-[color:var(--landing-teal-hover)]"
              >
                See the product
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </Link>
            </Reveal>

            <Reveal delay={0.08} className="relative">
              <div className="overflow-hidden rounded-[28px] shadow-[var(--landing-shadow-hero)]">
                <Image
                  src={PHOTO.field}
                  alt="Healthcare team in the field reviewing clinic operations"
                  width={1200}
                  height={900}
                  className="h-auto w-full object-cover"
                />
              </div>
              <FloatingWindow
                src={SCREEN.invoice}
                alt="Sigma invoice detail"
                title="Billing"
                className="absolute -bottom-8 -left-2 w-[72%] max-w-sm sm:-left-6"
              />
            </Reveal>
          </div>
        </section>

        {/* Stats strip with soft lighting */}
        <section className="company-grain relative overflow-hidden border-y border-[color:var(--landing-border)] bg-white py-16 sm:py-20">
          <div
            className="pointer-events-none absolute inset-y-0 left-1/4 w-1/2 bg-[color:var(--landing-teal)]/5 blur-3xl"
            aria-hidden="true"
          />
          <div className="relative z-10 mx-auto grid max-w-6xl gap-10 px-6 sm:grid-cols-3 sm:px-10 lg:px-12">
            {[
              { value: "47", label: "Clinics live on Sigma" },
              { value: "Millions", label: "Patient visits managed" },
              { value: "<8 hrs", label: "Average setup time" },
            ].map((stat, index) => (
              <Reveal key={stat.label} delay={index * 0.06} className="text-center sm:text-left">
                <p className="font-[family-name:var(--font-bricolage)] text-5xl font-semibold tracking-tight text-[color:var(--landing-teal)] sm:text-6xl">
                  {stat.value}
                </p>
                <p className="mt-3 text-sm text-[color:var(--landing-ledger-ink)] sm:text-base">
                  {stat.label}
                </p>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Future timeline */}
        <section className="relative overflow-hidden bg-[color:var(--landing-warm)] py-20 sm:py-28">
          <div className="company-dot-grid absolute inset-0 opacity-25" aria-hidden="true" />
          <div className="relative z-10 mx-auto max-w-6xl px-6 sm:px-10 lg:px-12">
            <Reveal>
              <h2 className="landing-display max-w-[12ch] text-[clamp(2rem,4.2vw,3.25rem)] font-semibold tracking-[-0.045em]">
                Still early. Still ambitious.
              </h2>
              <p className="landing-body mt-5 max-w-[34rem] text-base leading-[1.7] sm:text-lg">
                We are proud of what clinics run on today. We spend more time on
                what is still missing.
              </p>
            </Reveal>

            <ol className="relative mt-14 space-y-0">
              <div
                className="absolute bottom-4 left-[1.35rem] top-4 w-px bg-[color:var(--landing-border)] sm:left-[1.6rem]"
                aria-hidden="true"
              />
              {FUTURE.map((item, index) => {
                const Icon = item.icon;
                return (
                  <Reveal key={item.title} delay={index * 0.04}>
                    <li className="relative grid gap-4 py-6 sm:grid-cols-[3.2rem_1fr] sm:gap-6">
                      <div className="relative z-10 flex size-11 items-center justify-center rounded-full border border-[color:var(--landing-border)] bg-white text-[color:var(--landing-teal)] shadow-[var(--landing-shadow)] sm:size-12">
                        <Icon className="size-5" strokeWidth={1.75} aria-hidden="true" />
                      </div>
                      <div className="rounded-[22px] border border-[color:var(--landing-border)] bg-white/80 px-6 py-5 shadow-[var(--landing-shadow)] backdrop-blur-sm">
                        <h3 className="font-[family-name:var(--font-bricolage)] text-lg font-semibold tracking-tight text-[color:var(--landing-ink)]">
                          {item.title}
                        </h3>
                        <p className="mt-2 max-w-[40rem] text-sm leading-[1.65] sm:text-base">
                          {item.body}
                        </p>
                      </div>
                    </li>
                  </Reveal>
                );
              })}
            </ol>
          </div>
        </section>

        {/* Final CTA */}
        <section className="company-grain relative overflow-hidden bg-white py-20 sm:py-28">
          <div
            className="pointer-events-none absolute -left-10 top-10 size-64 rounded-full bg-[color:var(--landing-teal)]/15 blur-3xl"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -right-8 bottom-6 size-72 rounded-full bg-[color:var(--landing-amber)]/20 blur-3xl"
            aria-hidden="true"
          />
          <Reveal className="relative z-10 mx-auto max-w-4xl px-6 text-center sm:px-10">
            <h2 className="landing-display text-[clamp(2.1rem,4.5vw,3.5rem)] font-semibold tracking-[-0.045em]">
              Every clinic deserves better software.
            </h2>
            <p className="landing-body mx-auto mt-5 max-w-[34rem] text-base leading-[1.7] sm:text-lg">
              If your clinic is ready to spend less time on administration and
              more time caring for patients, we would love to show you Sigma.
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

      <LandingFooter />
    </div>
  );
}
