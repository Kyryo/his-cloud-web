import Image from "next/image";
import Link from "next/link";

import { ROUTES } from "@/constants/routes";

const FEATURES = [
  {
    title: "Patient billing",
    body: "Create a clear financial record while care is delivered, so every charge stays attached to the visit that created it.",
  },
  {
    title: "Claim preparation",
    body: "Prepare insurance claims with the clinical and billing context needed to reduce avoidable rejections.",
  },
  {
    title: "Live claim status",
    body: "See which claims are ready, submitted, rejected, or paid—and know exactly where follow-up is required.",
  },
  {
    title: "Payment matching",
    body: "Match remittances and patient payments back to the claims and visits they belong to.",
  },
  {
    title: "Outstanding balances",
    body: "Keep insurer and patient balances visible so finance is not rebuilding the picture from spreadsheets.",
  },
  {
    title: "Revenue reporting",
    body: "Understand aging balances, collections, and insurer exposure without another manual merge.",
  },
] as const;

export function BrandFeaturesPage() {
  return (
    <>
      <section className="relative isolate min-h-[72vh] overflow-hidden pt-24 sm:min-h-[78vh] sm:pt-28">
        <Image
          src="/landing/solution-track-claims.jpg"
          alt="Clinic staff tracking claim and payment status"
          fill
          priority
          quality={90}
          className="object-cover object-[center_28%]"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[color:var(--landing-ink)] via-[color:var(--landing-ink)]/70 to-[color:var(--landing-ink)]/35" />
        <div className="relative z-10 mx-auto flex max-w-6xl flex-col justify-end px-6 pb-16 pt-40 sm:px-10 sm:pb-20 sm:pt-52 lg:px-12">
          <p className="landing-body text-sm font-semibold text-white/70">
            Features
          </p>
          <h1 className="landing-display mt-4 max-w-[16ch] text-[clamp(2.4rem,5.5vw,4.5rem)] font-semibold leading-[1.05] tracking-[-0.045em] text-white">
            Know what is owed before the day ends.
          </h1>
          <p className="landing-body mt-6 max-w-[34rem] text-base leading-[1.7] text-white/75 sm:text-lg">
            One continuous view of billing, claims, and payments—so clinical
            and finance teams share the same source of truth.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href={ROUTES.signup}
              className="landing-focus landing-btn-primary inline-flex min-h-12 items-center justify-center rounded-full px-7 py-3 text-[15px] font-semibold"
            >
              Start for free
            </Link>
            <Link
              href={ROUTES.pricing}
              className="landing-focus inline-flex min-h-12 items-center justify-center rounded-full border border-white/30 px-7 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-white/10"
            >
              Talk to sales
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-3xl px-6 sm:px-10 lg:px-12">
          <h2 className="landing-display text-[clamp(1.8rem,3.2vw,2.6rem)] font-semibold tracking-[-0.04em] text-[color:var(--landing-ink)]">
            What your team can see and do
          </h2>
          <ol className="mt-12 border-t border-[color:var(--landing-border)]">
            {FEATURES.map((feature, index) => (
              <li
                key={feature.title}
                className="grid gap-3 border-b border-[color:var(--landing-border)] py-8 sm:grid-cols-[4rem_1fr] sm:gap-8"
              >
                <span className="landing-display text-sm font-semibold tabular-nums text-[color:var(--landing-teal)]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="landing-display text-xl font-semibold tracking-[-0.02em] text-[color:var(--landing-ink)] sm:text-2xl">
                    {feature.title}
                  </h3>
                  <p className="landing-body mt-3 max-w-[40rem] text-base leading-[1.7] text-[color:var(--landing-ledger-ink)]">
                    {feature.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-t border-[color:var(--landing-border)] bg-[color:var(--landing-warm)] py-16 sm:py-20">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-6 sm:flex-row sm:items-center sm:px-10 lg:px-12">
          <p className="landing-display max-w-[22ch] text-2xl font-semibold tracking-[-0.03em] text-[color:var(--landing-ink)] sm:text-3xl">
            Prefer a walkthrough with your workflow?
          </p>
          <Link
            href={ROUTES.contacts}
            className="landing-focus landing-btn-primary inline-flex min-h-12 shrink-0 items-center justify-center rounded-full px-7 py-3 text-[15px] font-semibold"
          >
            Book a demo
          </Link>
        </div>
      </section>
    </>
  );
}
