import Image from "next/image";
import Link from "next/link";

import { ROUTES } from "@/constants/routes";
import { BrandSplitHero } from "@/features/brand/components/landing/BrandSplitHero";

const POINTS = [
  {
    title: "Visit-linked invoices",
    body: "Every charge stays attached to the patient visit that created it—while the work is still in front of you.",
  },
  {
    title: "Patient and insurer balances",
    body: "See what the patient owes and what the scheme should cover, without rebuilding the bill from notes.",
  },
  {
    title: "A readable history",
    body: "Keep what has been billed, adjusted, and collected in one trail the front desk and finance can both trust.",
  },
] as const;

export function BrandBillingSolutionPage() {
  return (
    <>
      <BrandSplitHero
        eyebrow="Solutions · Billing"
        title="Bill the visit while the work is still in front of you."
        description="Sigma creates a financial record as care is delivered, so invoices are not rebuilt from memory at the end of the day."
        src="/landing/hero-clinic-billing.jpg"
        alt="A clinic finance officer reviewing billing activity"
        imageClassName="object-[center_20%]"
        actions={
          <>
            <Link
              href={ROUTES.signup}
              className="landing-focus landing-btn-primary inline-flex min-h-11 items-center justify-center rounded-full px-7 py-3 text-sm font-semibold"
            >
              Start for free
            </Link>
            <Link
              href={ROUTES.solutionsClaims}
              className="landing-focus landing-btn-secondary inline-flex min-h-11 items-center justify-center rounded-full border px-7 py-3 text-sm font-semibold"
            >
              Next: claims
            </Link>
          </>
        }
      />

      <section className="border-t border-[color:var(--landing-border)] bg-white py-20 sm:py-28">
        <div className="mx-auto grid max-w-6xl gap-14 px-6 sm:px-10 md:grid-cols-2 md:items-start lg:px-12">
          <div>
            <h2 className="landing-display max-w-[14ch] text-[clamp(1.8rem,3.2vw,2.6rem)] font-semibold tracking-[-0.04em] text-[color:var(--landing-ink)]">
              What billing looks like in Sigma
            </h2>
            <p className="landing-body mt-4 max-w-[34rem] text-base leading-[1.7] text-[color:var(--landing-ledger-ink)]">
              Care already happened. Billing should finish the job—not start a
              second shift of reconstruction.
            </p>
          </div>
          <ol className="border-t border-[color:var(--landing-border)]">
            {POINTS.map((point, index) => (
              <li
                key={point.title}
                className="border-b border-[color:var(--landing-border)] py-7"
              >
                <p className="landing-display text-sm font-semibold tabular-nums text-[color:var(--landing-teal)]">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="landing-display mt-2 text-xl font-semibold tracking-[-0.02em] text-[color:var(--landing-ink)]">
                  {point.title}
                </h3>
                <p className="landing-body mt-2 text-base leading-[1.7] text-[color:var(--landing-ledger-ink)]">
                  {point.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-[color:var(--landing-warm)] py-20 sm:py-28">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 sm:px-10 md:grid-cols-2 lg:px-12">
          <Image
            src="/landing/hero-clinic-corridor.png"
            alt="Clinician walking through a busy clinic corridor"
            width={1400}
            height={1750}
            className="aspect-[4/5] w-full object-cover object-[center_30%]"
            sizes="(min-width: 768px) 42vw, 100vw"
          />
          <blockquote className="max-w-[30rem]">
            <span
              aria-hidden="true"
              className="mb-7 block h-0.5 w-12 bg-[color:var(--landing-teal)]"
            />
            <p className="landing-display text-[clamp(1.6rem,3vw,2.4rem)] font-medium italic leading-[1.2] tracking-[-0.035em] text-[color:var(--landing-ink)]">
              If billing waits until the evening, the visit is already gone.
            </p>
            <p className="landing-body mt-5 text-base leading-[1.7] text-[color:var(--landing-ledger-ink)]">
              Sigma keeps the bill beside the encounter so charges, schemes, and
              patient balances stay attached to the work that created them.
            </p>
          </blockquote>
        </div>
      </section>
    </>
  );
}
