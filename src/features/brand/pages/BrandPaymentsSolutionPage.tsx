import Link from "next/link";

import { ROUTES } from "@/constants/routes";
import { BrandParallaxPhoto } from "@/features/brand/components/landing/BrandParallaxPhoto";

const POINTS = [
  {
    title: "Remittance matching",
    body: "Connect bank deposits and insurer files to the claims they settle, instead of matching by memory.",
  },
  {
    title: "Outstanding balances",
    body: "See what is still owed by patient and by scheme without rebuilding aging reports by hand.",
  },
  {
    title: "One trail to cash",
    body: "Finance and front desk share the same path from visit to payment. A deposit is not closed until it has a source.",
  },
] as const;

export function BrandPaymentsSolutionPage() {
  return (
    <>
      <section className="pt-28 sm:pt-32">
        <div className="mx-auto max-w-3xl px-6 text-center sm:px-10">
          <p className="text-sm font-semibold text-[color:var(--landing-teal)]">
            Solutions · Payments
          </p>
          <h1 className="landing-display mt-4 text-[clamp(2.2rem,4.8vw,3.9rem)] font-semibold leading-[1.06] tracking-[-0.045em] text-[color:var(--landing-ink)] text-balance">
            A deposit is not a payment until it has a source.
          </h1>
          <p className="landing-body mx-auto mt-6 max-w-[36rem] text-base leading-[1.7] text-[color:var(--landing-ledger-ink)] sm:text-lg">
            Sigma matches insurer remittances and patient payments back to the
            claims and visits they belong to.
          </p>
        </div>
        <div className="mt-12">
          <BrandParallaxPhoto
            src="/landing/solution-match-payments.jpg"
            alt="Clinic finance staff reconciling payments"
            className="h-[48vh] w-full sm:h-[56vh] lg:h-[70vh]"
            priority
            sizes="100vw"
          />
        </div>
      </section>

      <section className="bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-3xl px-6 sm:px-10">
          <h2 className="landing-display text-[clamp(1.7rem,3vw,2.4rem)] font-semibold tracking-[-0.04em] text-[color:var(--landing-ink)]">
            Money that arrives still has to find its visit
          </h2>
          <ol className="mt-12 border-t border-[color:var(--landing-border)]">
            {POINTS.map((item, index) => (
              <li
                key={item.title}
                className="border-b border-[color:var(--landing-border)] py-8"
              >
                <p className="landing-display text-sm font-semibold tabular-nums text-[color:var(--landing-teal)]">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="landing-display mt-2 text-xl font-semibold tracking-[-0.02em] text-[color:var(--landing-ink)]">
                  {item.title}
                </h3>
                <p className="landing-body mt-2 text-base leading-[1.7] text-[color:var(--landing-ledger-ink)]">
                  {item.body}
                </p>
              </li>
            ))}
          </ol>
          <div className="mt-12 flex flex-col gap-3 sm:flex-row">
            <Link
              href={ROUTES.pricing}
              className="landing-focus landing-btn-primary inline-flex min-h-12 items-center justify-center rounded-full px-7 py-3 text-[15px] font-semibold"
            >
              Talk to sales
            </Link>
            <Link
              href={ROUTES.solutions}
              className="landing-focus landing-btn-secondary inline-flex min-h-12 items-center justify-center rounded-full border px-7 py-3 text-[15px] font-semibold"
            >
              All solutions
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
