import Image from "next/image";
import Link from "next/link";

import { ROUTES } from "@/constants/routes";
import { BrandParallaxPhoto } from "@/features/brand/components/landing/BrandParallaxPhoto";

const SOLUTIONS = [
  {
    number: "01",
    name: "Billing",
    href: ROUTES.solutionsBilling,
    title: "Every visit leaves a clear bill.",
    body: "Attach charges to the patient visit while care is delivered, so finance is not reconstructing invoices later.",
    image: "/landing/hero-clinic-billing.jpg",
    position: "object-[center_22%]",
    alt: "A clinic finance officer reviewing billing at a desk",
  },
  {
    number: "02",
    name: "Claims",
    href: ROUTES.solutionsClaims,
    title: "Know where every claim stands.",
    body: "Prepare, submit, and follow insurance claims with the context that reduces avoidable rejections.",
    image: "/landing/solution-submit-claims.jpg",
    position: "object-[center_24%]",
    alt: "A clinic officer checking a claim before it is submitted",
  },
  {
    number: "03",
    name: "Payments",
    href: ROUTES.solutionsPayments,
    title: "Match money back to the visit.",
    body: "Link remittances and patient payments to the claims they belong to, without a spreadsheet hunt.",
    image: "/landing/solution-match-payments.jpg",
    position: "object-center",
    alt: "Matching a payment back to the patient visit it belongs to",
  },
] as const;

export function BrandSolutionsIndexPage() {
  return (
    <>
      <section className="pt-28 pb-10 sm:pt-36 sm:pb-14">
        <div className="mx-auto max-w-6xl px-6 sm:px-10 lg:px-12">
          <p className="landing-body text-sm font-semibold text-[color:var(--landing-teal)]">
            Solutions
          </p>
          <h1 className="landing-display mt-4 max-w-[16ch] text-[clamp(2.3rem,5vw,4.25rem)] font-semibold leading-[1.06] tracking-[-0.045em] text-[color:var(--landing-ink)]">
            Follow revenue from the visit to the payment.
          </h1>
          <p className="landing-body mt-6 max-w-[36rem] text-base leading-[1.7] text-[color:var(--landing-ledger-ink)] sm:text-lg">
            Sigma is built around three connected jobs: bill what was delivered,
            submit what the insurer owes, and match what actually arrives.
          </p>
        </div>
      </section>

      <section className="pb-24 sm:pb-32">
        <div className="mx-auto max-w-6xl px-6 sm:px-10 lg:px-12">
          <ul className="space-y-20 sm:space-y-28">
            {SOLUTIONS.map((solution, index) => (
              <li
                key={solution.href}
                className="grid items-stretch gap-8 md:grid-cols-2 md:gap-14 lg:gap-20"
              >
                <BrandParallaxPhoto
                  src={solution.image}
                  alt={solution.alt}
                  className={`h-[42vh] w-full min-h-[18rem] md:h-auto md:min-h-[28rem] ${
                    index % 2 === 1 ? "md:order-2" : ""
                  }`}
                  imageClassName={solution.position}
                  sizes="(min-width: 768px) 46vw, 100vw"
                />
                <div
                  className={`flex flex-col justify-center ${
                    index % 2 === 1 ? "md:order-1" : ""
                  }`}
                >
                  <p className="landing-display text-sm font-semibold tabular-nums text-[color:var(--landing-teal)]">
                    {solution.number} · {solution.name}
                  </p>
                  <h2 className="landing-display mt-3 max-w-[14ch] text-[clamp(1.75rem,3vw,2.6rem)] font-semibold tracking-[-0.04em] text-[color:var(--landing-ink)]">
                    {solution.title}
                  </h2>
                  <p className="landing-body mt-4 max-w-[34rem] text-base leading-[1.7] text-[color:var(--landing-ledger-ink)]">
                    {solution.body}
                  </p>
                  <Link
                    href={solution.href}
                    className="landing-focus mt-6 inline-flex text-sm font-semibold text-[color:var(--landing-teal)] transition-colors hover:text-[color:var(--landing-teal-hover)]"
                  >
                    See {solution.name.toLowerCase()}
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-t border-[color:var(--landing-border)] bg-[color:var(--landing-warm)] py-20 sm:py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 sm:px-10 md:grid-cols-2 lg:px-12">
          <div>
            <h2 className="landing-display max-w-[14ch] text-[clamp(1.8rem,3.2vw,2.75rem)] font-semibold tracking-[-0.04em] text-[color:var(--landing-ink)]">
              One trail. Three jobs. No mystery queue.
            </h2>
            <p className="landing-body mt-4 max-w-[34rem] text-base leading-[1.7] text-[color:var(--landing-ledger-ink)]">
              Billing, claims, and payments stay on the same trail after the
              patient leaves—so nothing important disappears into a spreadsheet.
            </p>
          </div>
          <Image
            src="/landing/comparison-stop-chasing.jpg"
            alt="Healthcare team reviewing clinic operations"
            width={1400}
            height={1000}
            className="aspect-[5/4] w-full object-cover"
            sizes="(min-width: 768px) 42vw, 100vw"
          />
        </div>
      </section>
    </>
  );
}
