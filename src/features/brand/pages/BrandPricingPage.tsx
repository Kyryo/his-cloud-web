import Link from "next/link";

import { ROUTES } from "@/constants/routes";

const POINTS = [
  {
    title: "Clinic-sized plans",
    body: "Pricing depends on how your team works—locations, claim volume, and the modules you need day to day.",
  },
  {
    title: "No surprise complexity",
    body: "We will walk through what is included, what optional support looks like, and how onboarding is handled.",
  },
  {
    title: "Start when you are ready",
    body: "Many clinics begin with a free trial. Sales conversations are for teams that want a tailored rollout.",
  },
] as const;

export function BrandPricingPage() {
  return (
    <>
      <section className="pt-32 pb-16 sm:pt-40 sm:pb-24">
        <div className="mx-auto max-w-3xl px-6 text-center sm:px-10">
          <p className="landing-body text-sm font-semibold text-[color:var(--landing-teal)]">
            Pricing
          </p>
          <h1 className="landing-display mt-4 text-[clamp(2.4rem,5.2vw,4.25rem)] font-semibold leading-[1.05] tracking-[-0.05em] text-[color:var(--landing-ink)] text-balance">
            Talk to sales.
          </h1>
          <p className="landing-body mx-auto mt-6 max-w-[34rem] text-base leading-[1.7] text-[color:var(--landing-ledger-ink)] sm:text-lg">
            We do not publish a one-size plan page. Tell us about your clinic and
            we will share pricing that matches how you bill, claim, and collect.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href={ROUTES.contacts}
              className="landing-focus landing-btn-primary inline-flex min-h-12 items-center justify-center rounded-full px-7 py-3 text-[15px] font-semibold"
            >
              Talk to sales
            </Link>
            <Link
              href={ROUTES.signup}
              className="landing-focus landing-btn-secondary inline-flex min-h-12 items-center justify-center rounded-full border px-7 py-3 text-[15px] font-semibold"
            >
              Start for free
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t border-[color:var(--landing-border)] bg-[color:var(--landing-warm)] py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-6 sm:px-10 lg:px-12">
          <div className="grid gap-10 md:grid-cols-3 md:gap-8">
            {POINTS.map((point) => (
              <div key={point.title}>
                <h2 className="landing-display text-xl font-semibold tracking-[-0.02em] text-[color:var(--landing-ink)]">
                  {point.title}
                </h2>
                <p className="landing-body mt-3 text-sm leading-[1.7] text-[color:var(--landing-ledger-ink)] sm:text-base">
                  {point.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-6 text-center sm:px-10">
          <p className="landing-body text-base leading-[1.7] text-[color:var(--landing-ledger-ink)]">
            Prefer email? Reach us at{" "}
            <a
              href="mailto:hello@sigmaconnect.org?subject=Sigma%20pricing"
              className="landing-focus font-semibold text-[color:var(--landing-teal)] underline-offset-4 hover:underline"
            >
              hello@sigmaconnect.org
            </a>
            .
          </p>
        </div>
      </section>
    </>
  );
}
