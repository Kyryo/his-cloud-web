import Image from "next/image";
import Link from "next/link";

import { ROUTES } from "@/constants/routes";

const MODULES = [
  {
    title: "Billing",
    body: "Visit-linked invoices and patient balances.",
    image: "/landing/hero-clinic-billing.jpg",
    position: "object-[center_20%]",
  },
  {
    title: "Claims",
    body: "Prepare, submit, and follow insurance claims.",
    image: "/landing/solution-submit-claims.jpg",
    position: "object-[center_24%]",
  },
  {
    title: "Payments",
    body: "Match remittances to the visits that earned them.",
    image: "/landing/solution-match-payments.jpg",
    position: "object-center",
  },
  {
    title: "Reporting",
    body: "See outstanding balances without spreadsheet rebuilds.",
    image: "/landing/revenue-money-stands.jpg",
    position: "object-center",
  },
] as const;

export function BrandProductsPage() {
  return (
    <>
      <section className="pt-28 pb-12 sm:pt-36 sm:pb-16">
        <div className="mx-auto max-w-6xl px-6 sm:px-10 lg:px-12">
          <p className="landing-body text-sm font-semibold text-[color:var(--landing-teal)]">
            Platform
          </p>
          <h1 className="landing-display mt-4 max-w-[18ch] text-[clamp(2.2rem,4.5vw,3.75rem)] font-semibold leading-[1.08] tracking-[-0.045em] text-[color:var(--landing-ink)]">
            The revenue system clinics run every day.
          </h1>
          <p className="landing-body mt-6 max-w-[36rem] text-base leading-[1.7] text-[color:var(--landing-ledger-ink)] sm:text-lg">
            Billing, claims, payments, and reporting stay connected—so finance
            is not rebuilding the story after every visit.
          </p>
        </div>
      </section>

      <section className="pb-20 sm:pb-28">
        <div className="mx-auto grid max-w-6xl gap-5 px-6 sm:grid-cols-2 sm:px-10 lg:px-12">
          {MODULES.map((module) => (
            <article key={module.title} className="group">
              <div className="overflow-hidden">
                <Image
                  src={module.image}
                  alt=""
                  width={1200}
                  height={800}
                  quality={88}
                  className={`aspect-[5/3] w-full object-cover transition-transform duration-500 group-hover:scale-[1.02] ${module.position}`}
                  sizes="(min-width: 640px) 42vw, 100vw"
                />
              </div>
              <h2 className="landing-display mt-5 text-xl font-semibold tracking-[-0.02em] text-[color:var(--landing-ink)]">
                {module.title}
              </h2>
              <p className="landing-body mt-2 text-sm leading-[1.65] text-[color:var(--landing-ledger-ink)] sm:text-base">
                {module.body}
              </p>
            </article>
          ))}
        </div>
        <div className="mx-auto mt-14 flex max-w-6xl flex-col gap-3 px-6 sm:flex-row sm:px-10 lg:px-12">
          <Link
            href={ROUTES.features}
            className="landing-focus landing-btn-primary inline-flex min-h-12 items-center justify-center rounded-full px-7 py-3 text-[15px] font-semibold"
          >
            See features
          </Link>
          <Link
            href={ROUTES.pricing}
            className="landing-focus landing-btn-secondary inline-flex min-h-12 items-center justify-center rounded-full border px-7 py-3 text-[15px] font-semibold"
          >
            Talk to sales
          </Link>
        </div>
      </section>
    </>
  );
}
