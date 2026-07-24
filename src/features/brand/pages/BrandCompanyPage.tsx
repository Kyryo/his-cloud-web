"use client";

import {
  Building2,
  CheckCircle2,
  ClipboardList,
  Database,
  FileCheck,
  HeartHandshake,
  Layers,
  LayoutGrid,
  Pill,
  Receipt,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";

import { ROUTES } from "@/constants/routes";
import { LandingFooter } from "@/features/brand/components/landing/LandingFooter";
import { LandingProductScreenshot } from "@/features/brand/components/landing/LandingProductScreenshot";
import { Navigation } from "@/features/brand/components/Navigation";

const HERO_SCREENSHOT = "/landing/product-screenshots/client-details.png";

const BELIEFS = [
  {
    title: "Software should disappear into the workflow.",
    description:
      "Clinicians should spend their day caring for patients, not fighting with multi-step software forms.",
    icon: Stethoscope,
  },
  {
    title: "Every clinic deserves modern tools.",
    description:
      "Fast, reliable software shouldn&apos;t be restricted to massive hospital chains with million-dollar IT budgets.",
    icon: HeartHandshake,
  },
  {
    title: "Revenue shouldn&apos;t be lost after patient care.",
    description:
      "Billing, claims, and payments must work together in real-time so clinics stay financially sustainable.",
    icon: Receipt,
  },
  {
    title: "Simplicity wins.",
    description:
      "Bloated software doesn&apos;t improve healthcare. We focus on clarity, speed, and eliminating unnecessary steps.",
    icon: Zap,
  },
  {
    title: "Good software earns trust.",
    description:
      "Reliable uptime and accurate records let clinic teams operate with total confidence every single day.",
    icon: ShieldCheck,
  },
  {
    title: "Data belongs to the clinic.",
    description:
      "Your clinical data is 100% your property. We provide data sovereignty, strict isolation, and unrestricted export.",
    icon: Database,
  },
] as const;

const SYSTEM_MODULES = [
  { title: "Patient Records", desc: "Master patient index, demographics, & encounter history", icon: Users },
  { title: "Billing & Revenue", desc: "Integrated point-of-sale, receipts, & payment tracking", icon: Receipt },
  { title: "Insurance Claims", desc: "Coverage verification & e-claims submission rules", icon: FileCheck },
  { title: "Pharmacy Dispensation", desc: "Prescription fulfillment & automatic batch tracking", icon: Pill },
  { title: "Laboratory Orders", desc: "Test requests, status tracking, & result logging", icon: ClipboardList },
  { title: "Inventory Control", desc: "Stock management, reorder alerts, & supplier tracking", icon: Layers },
  { title: "Real-time Reporting", desc: "Operational metrics, daily revenue, & audit logs", icon: LayoutGrid },
  { title: "Financial Visibility", desc: "End-to-end reconciliation from visit to payment", icon: Zap },
] as const;

const TARGET_CLINICS = [
  {
    title: "Private Clinics & Practices",
    desc: "Single or multi-doctor practices seeking fast patient check-ins and clean billing.",
  },
  {
    title: "Mission & Faith-Based Hospitals",
    desc: "High-volume healthcare centers needing reliable inventory and insurance handling.",
  },
  {
    title: "NGO-Supported Facilities",
    desc: "Community health organizations requiring transparent reporting and audit readiness.",
  },
  {
    title: "Multi-Site Care Networks",
    desc: "Healthcare groups operating across multiple clinic locations under one system.",
  },
] as const;

const PRINCIPLES = [
  {
    number: "01",
    title: "Build for the people doing the work.",
    desc: "We design directly for doctors, nurses, cashiers, and pharmacists using the software on busy shifts.",
  },
  {
    number: "02",
    title: "Keep healthcare data secure.",
    desc: "AES-256 encryption at rest, TLS 1.3 in transit, and strict multi-tenant access controls on every request.",
  },
  {
    number: "03",
    title: "Reduce clicks, not features.",
    desc: "We optimize every interaction to save time without compromising clinical accuracy or operational depth.",
  },
  {
    number: "04",
    title: "Ship improvements continuously.",
    desc: "We release regular updates based on direct feedback from frontline clinic teams.",
  },
  {
    number: "05",
    title: "Earn customer trust every day.",
    desc: "We prioritize 99.9% uptime, responsive technical support, and transparent communication.",
  },
] as const;

const FUTURE_INITIATIVES = [
  {
    title: "Deeper System Interoperability",
    desc: "Connecting regional insurance clearinghouses, lab devices, and public health reporting networks.",
  },
  {
    title: "AI-Assisted Workflow Support",
    desc: "Smart documentation drafting and automated coding suggestions to reduce paperwork time.",
  },
  {
    title: "Automated Claims Intelligence",
    desc: "Real-time pre-validation checks to eliminate claim rejections before submission.",
  },
  {
    title: "Expanded Digital Access",
    desc: "Bringing modern, resilient clinic software to healthcare providers across Africa and emerging markets.",
  },
] as const;

export function BrandCompanyPage() {
  return (
    <div className="min-h-dvh bg-white text-[color:var(--landing-ledger-ink)]">
      <a href="#main-content" className="landing-skip-link">
        Skip to main content
      </a>
      <Navigation />

      <main id="main-content" className="pb-20 sm:pb-28">
        {/* Hero Section */}
        <header className="border-b border-[color:var(--landing-border)] bg-[color:var(--landing-warm)]/60 pt-24 pb-16 sm:pt-32 sm:pb-24">
          <div className="mx-auto max-w-4xl px-6 text-center sm:px-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-[color:var(--landing-border)] bg-white px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-[color:var(--landing-teal)] shadow-xs">
              <Building2 className="size-3.5" aria-hidden="true" />
              <span>About Sigma Health</span>
            </div>

            <h1 className="landing-display mt-6 text-3xl font-extrabold tracking-tight text-[color:var(--landing-ink)] sm:text-5xl lg:text-6xl text-balance">
              We&apos;re building software clinics actually enjoy using.
            </h1>

            <p className="landing-body mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-[color:var(--landing-ledger-ink)] sm:text-xl">
              Sigma exists to help clinics spend less time on administration and more time caring for patients. We connect patient care, billing, inventory, and claims in one intuitive platform.
            </p>

            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
              <Link
                href={ROUTES.signup}
                className="landing-focus landing-btn-primary inline-flex min-h-11 items-center justify-center rounded-full px-7 py-3 text-sm font-semibold"
              >
                Request a Demo
              </Link>
              <Link
                href={ROUTES.contacts}
                className="landing-focus landing-btn-secondary inline-flex min-h-11 items-center justify-center rounded-full border px-7 py-3 text-sm font-semibold"
              >
                Contact Sales
              </Link>
            </div>

            <div className="mt-14 mx-auto max-w-4xl">
              <LandingProductScreenshot
                src={HERO_SCREENSHOT}
                alt="Sigma HMIS clinic management dashboard"
                elevated
                priority
              />
            </div>
          </div>
        </header>

        {/* Our Mission Section */}
        <section className="py-16 sm:py-24 border-b border-[color:var(--landing-border)]">
          <div className="mx-auto max-w-3xl px-6 text-center sm:px-8">
            <p className="text-xs font-semibold uppercase tracking-wider text-[color:var(--landing-teal)]">
              Our Mission
            </p>
            <h2 className="landing-display mt-3 text-2xl font-bold tracking-tight text-[color:var(--landing-ink)] sm:text-4xl">
              Making healthcare operations effortless for every clinic.
            </h2>
            <p className="landing-body mt-6 text-base leading-relaxed text-[color:var(--landing-ledger-ink)] sm:text-lg">
              We believe healthcare technology should empower providers, not slow them down. Our mission is to eliminate paper friction, streamline daily operations, and improve financial sustainability for healthcare clinics—without requiring expensive server infrastructure or complex training.
            </p>
          </div>
        </section>

        {/* Why We Started Section */}
        <section className="py-16 sm:py-24 border-b border-[color:var(--landing-border)] bg-[color:var(--landing-warm)]/30">
          <div className="mx-auto max-w-4xl px-6 sm:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-semibold uppercase tracking-wider text-[color:var(--landing-teal)]">
                Why We Started
              </p>
              <h2 className="landing-display mt-3 text-2xl font-bold tracking-tight text-[color:var(--landing-ink)] sm:text-4xl">
                Built to solve the everyday struggles of clinic teams.
              </h2>
              <p className="landing-body mt-4 text-base text-[color:var(--landing-ledger-ink)]">
                Healthcare providers in growing markets face systemic administrative challenges every day. We built Sigma to change that.
              </p>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-2xl border border-[color:var(--landing-border)] bg-white p-6 shadow-xs">
                <div className="flex size-10 items-center justify-center rounded-xl bg-[color:var(--landing-warm)] text-[color:var(--landing-teal)] font-bold text-sm">
                  01
                </div>
                <h3 className="landing-text-ink mt-4 text-base font-semibold">Paper Registers</h3>
                <p className="landing-body mt-2 text-sm leading-relaxed text-[color:var(--landing-ledger-ink)]">
                  Lost patient charts, misplaced medical histories, and slow manual lookups during busy clinic shifts.
                </p>
              </div>

              <div className="rounded-2xl border border-[color:var(--landing-border)] bg-white p-6 shadow-xs">
                <div className="flex size-10 items-center justify-center rounded-xl bg-[color:var(--landing-warm)] text-[color:var(--landing-teal)] font-bold text-sm">
                  02
                </div>
                <h3 className="landing-text-ink mt-4 text-base font-semibold">Disconnected Systems</h3>
                <p className="landing-body mt-2 text-sm leading-relaxed text-[color:var(--landing-ledger-ink)]">
                  Separate software for billing, pharmacy, and records leading to double entry and constant errors.
                </p>
              </div>

              <div className="rounded-2xl border border-[color:var(--landing-border)] bg-white p-6 shadow-xs">
                <div className="flex size-10 items-center justify-center rounded-xl bg-[color:var(--landing-warm)] text-[color:var(--landing-teal)] font-bold text-sm">
                  03
                </div>
                <h3 className="landing-text-ink mt-4 text-base font-semibold">Claim Rejections</h3>
                <p className="landing-body mt-2 text-sm leading-relaxed text-[color:var(--landing-ledger-ink)]">
                  Insurance claims delayed or rejected due to tariff misalignments and missing documentation.
                </p>
              </div>

              <div className="rounded-2xl border border-[color:var(--landing-border)] bg-white p-6 shadow-xs">
                <div className="flex size-10 items-center justify-center rounded-xl bg-[color:var(--landing-warm)] text-[color:var(--landing-teal)] font-bold text-sm">
                  04
                </div>
                <h3 className="landing-text-ink mt-4 text-base font-semibold">Manual Reporting</h3>
                <p className="landing-body mt-2 text-sm leading-relaxed text-[color:var(--landing-ledger-ink)]">
                  Hours spent compiling monthly health returns and revenue spreadsheets at the end of every month.
                </p>
              </div>

              <div className="rounded-2xl border border-[color:var(--landing-border)] bg-white p-6 shadow-xs">
                <div className="flex size-10 items-center justify-center rounded-xl bg-[color:var(--landing-warm)] text-[color:var(--landing-teal)] font-bold text-sm">
                  05
                </div>
                <h3 className="landing-text-ink mt-4 text-base font-semibold">Stock Leakage</h3>
                <p className="landing-body mt-2 text-sm leading-relaxed text-[color:var(--landing-ledger-ink)]">
                  Untracked medication stock and expired drug batches draining pharmacy revenue.
                </p>
              </div>

              <div className="rounded-2xl border border-[color:var(--landing-border)] bg-white p-6 shadow-xs">
                <div className="flex size-10 items-center justify-center rounded-xl bg-[color:var(--landing-warm)] text-[color:var(--landing-teal)] font-bold text-sm">
                  06
                </div>
                <h3 className="landing-text-ink mt-4 text-base font-semibold">Expensive Legacy IT</h3>
                <p className="landing-body mt-2 text-sm leading-relaxed text-[color:var(--landing-ledger-ink)]">
                  Complex software that costs thousands upfront and requires full-time IT personnel to maintain.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* What We Believe Section */}
        <section className="py-16 sm:py-24 border-b border-[color:var(--landing-border)]">
          <div className="mx-auto max-w-4xl px-6 sm:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-semibold uppercase tracking-wider text-[color:var(--landing-teal)]">
                What We Believe
              </p>
              <h2 className="landing-display mt-3 text-2xl font-bold tracking-tight text-[color:var(--landing-ink)] sm:text-4xl">
                Core convictions guiding how we design.
              </h2>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {BELIEFS.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-[color:var(--landing-border)] bg-white p-6 shadow-xs transition-shadow hover:shadow-md"
                  >
                    <div className="flex size-10 items-center justify-center rounded-xl bg-[color:var(--landing-teal-tint)] text-[color:var(--landing-teal)]">
                      <Icon className="size-5" aria-hidden="true" />
                    </div>
                    <h3 className="landing-text-ink mt-4 text-base font-bold leading-snug">
                      {item.title}
                    </h3>
                    <p className="landing-body mt-2 text-sm leading-relaxed text-[color:var(--landing-ledger-ink)]">
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* What We're Building Section */}
        <section className="py-16 sm:py-24 border-b border-[color:var(--landing-border)] bg-[color:var(--landing-warm)]/30">
          <div className="mx-auto max-w-4xl px-6 sm:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-semibold uppercase tracking-wider text-[color:var(--landing-teal)]">
                What We&apos;re Building
              </p>
              <h2 className="landing-display mt-3 text-2xl font-bold tracking-tight text-[color:var(--landing-ink)] sm:text-4xl">
                An operating system for modern clinics.
              </h2>
              <p className="landing-body mt-4 text-base text-[color:var(--landing-ledger-ink)]">
                Sigma is more than an electronic medical record. It is a complete workflow engine connecting every operational department.
              </p>
            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {SYSTEM_MODULES.map((mod) => {
                const Icon = mod.icon;
                return (
                  <div
                    key={mod.title}
                    className="rounded-xl border border-[color:var(--landing-border)] bg-white p-5 shadow-xs"
                  >
                    <Icon className="size-5 text-[color:var(--landing-teal)]" aria-hidden="true" />
                    <h3 className="landing-text-ink mt-3 text-sm font-bold">{mod.title}</h3>
                    <p className="landing-body mt-1 text-xs text-[color:var(--landing-ledger-ink)] leading-relaxed">
                      {mod.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Built for Growing Clinics Section */}
        <section className="py-16 sm:py-24 border-b border-[color:var(--landing-border)]">
          <div className="mx-auto max-w-4xl px-6 sm:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-semibold uppercase tracking-wider text-[color:var(--landing-teal)]">
                Built for Growing Clinics
              </p>
              <h2 className="landing-display mt-3 text-2xl font-bold tracking-tight text-[color:var(--landing-ink)] sm:text-4xl">
                Tailored for real-world healthcare providers.
              </h2>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-2">
              {TARGET_CLINICS.map((clinic) => (
                <div
                  key={clinic.title}
                  className="flex items-start gap-4 rounded-2xl border border-[color:var(--landing-border)] bg-[color:var(--landing-warm)]/20 p-6"
                >
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[color:var(--landing-teal-tint)] text-[color:var(--landing-teal)]">
                    <CheckCircle2 className="size-5" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="landing-text-ink text-base font-bold">{clinic.title}</h3>
                    <p className="landing-body mt-1.5 text-sm leading-relaxed text-[color:var(--landing-ledger-ink)]">
                      {clinic.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Our Principles Grid */}
        <section className="py-16 sm:py-24 border-b border-[color:var(--landing-border)] bg-[color:var(--landing-warm)]/30">
          <div className="mx-auto max-w-4xl px-6 sm:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-semibold uppercase tracking-wider text-[color:var(--landing-teal)]">
                Our Principles
              </p>
              <h2 className="landing-display mt-3 text-2xl font-bold tracking-tight text-[color:var(--landing-ink)] sm:text-4xl">
                How we make decisions.
              </h2>
            </div>

            <div className="mt-12 space-y-4">
              {PRINCIPLES.map((p) => (
                <div
                  key={p.number}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-[color:var(--landing-border)] bg-white p-6 shadow-xs"
                >
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-sm font-bold text-[color:var(--landing-teal)]">
                      {p.number}
                    </span>
                    <h3 className="landing-text-ink text-base font-bold">{p.title}</h3>
                  </div>
                  <p className="landing-body text-sm text-[color:var(--landing-ledger-ink)] max-w-md sm:text-right">
                    {p.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Looking Ahead Section */}
        <section className="py-16 sm:py-24 border-b border-[color:var(--landing-border)]">
          <div className="mx-auto max-w-4xl px-6 sm:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-semibold uppercase tracking-wider text-[color:var(--landing-teal)]">
                Looking Ahead
              </p>
              <h2 className="landing-display mt-3 text-2xl font-bold tracking-tight text-[color:var(--landing-ink)] sm:text-4xl">
                Building the future of healthcare software.
              </h2>
              <p className="landing-body mt-4 text-base text-[color:var(--landing-ledger-ink)]">
                We are committed to long-term innovation that simplifies clinical work and expands access to modern healthcare technology.
              </p>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-2">
              {FUTURE_INITIATIVES.map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-[color:var(--landing-border)] bg-white p-6 shadow-xs"
                >
                  <div className="flex items-center gap-2 text-[color:var(--landing-teal)]">
                    <Sparkles className="size-4" aria-hidden="true" />
                    <h3 className="landing-text-ink text-base font-bold">{item.title}</h3>
                  </div>
                  <p className="landing-body mt-2 text-sm leading-relaxed text-[color:var(--landing-ledger-ink)]">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final Call To Action */}
        <section className="py-20 sm:py-28 bg-[color:var(--landing-warm)]/60">
          <div className="mx-auto max-w-3xl px-6 text-center sm:px-8">
            <h2 className="landing-display text-3xl font-extrabold tracking-tight text-[color:var(--landing-ink)] sm:text-4xl lg:text-5xl">
              Ready to modernize your clinic?
            </h2>
            <p className="landing-body mt-4 text-base leading-relaxed text-[color:var(--landing-ledger-ink)] sm:text-lg">
              See how Sigma can help your clinic run more efficiently, reduce administrative work, and gain complete visibility from patient care to payment.
            </p>

            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
              <Link
                href={ROUTES.signup}
                className="landing-focus landing-btn-primary inline-flex min-h-11 items-center justify-center rounded-full px-8 py-3.5 text-sm font-semibold"
              >
                Book a Demo
              </Link>
              <Link
                href={ROUTES.contacts}
                className="landing-focus landing-btn-secondary inline-flex min-h-11 items-center justify-center rounded-full border px-8 py-3.5 text-sm font-semibold"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
