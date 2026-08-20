import Image from "next/image";
import Link from "next/link";

import { ROUTES } from "@/constants/routes";
import { BrandParallaxPhoto } from "@/features/brand/components/landing/BrandParallaxPhoto";

const STEPS = [
  {
    title: "Prepare with context",
    body: "Build the claim from the visit and the bill, not from a separate spreadsheet of guesses.",
  },
  {
    title: "Catch missing rules",
    body: "Auth numbers, scheme codes, and diagnosis mismatches should surface before the claim leaves the clinic.",
  },
  {
    title: "Submit and keep the record",
    body: "What was sent stays visible, so follow-up is not a reconstruction of last Tuesday.",
  },
  {
    title: "Track every state",
    body: "Submitted, rejected, waiting, paid. The queue is a list of work—not a search.",
  },
] as const;

export function BrandClaimsSolutionPage() {
  return (
    <>
      <section className="relative isolate min-h-[78vh] overflow-hidden pt-24 md:min-h-dvh">
        <Image
          src="/landing/solution-track-claims.jpg"
          alt="Clinic staff tracking insurance claim status"
          fill
          priority
          quality={90}
          className="object-cover object-[center_28%] scale-105"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[color:var(--landing-ink)] via-[color:var(--landing-ink)]/82 to-[color:var(--landing-ink)]/20" />
        <div className="relative z-10 mx-auto flex min-h-[78vh] max-w-6xl items-end px-6 pb-16 pt-40 sm:px-10 sm:pb-20 md:min-h-dvh lg:px-12">
          <div className="max-w-[36rem]">
            <p className="text-sm font-semibold text-white/70">
              Solutions · Claims
            </p>
            <h1 className="landing-display mt-4 text-[clamp(2.3rem,5vw,4.1rem)] font-semibold leading-[1.06] tracking-[-0.045em] text-white">
              Stop losing claims in a mystery queue.
            </h1>
            <p className="landing-body mt-6 text-base leading-[1.7] text-white/75 sm:text-lg">
              Sigma keeps each claim visible from preparation through payment, so
              follow-up is a list of work—not a search.
            </p>
            <Link
              href={ROUTES.solutionsPayments}
              className="landing-focus mt-8 inline-flex min-h-11 items-center justify-center rounded-full bg-white px-7 py-3 text-sm font-semibold text-[color:var(--landing-ink)]"
            >
              Next: payments
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-white py-20 sm:py-28">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 sm:px-10 md:grid-cols-2 md:items-start lg:px-12">
          <h2 className="landing-display max-w-[12ch] text-[clamp(1.8rem,3.2vw,2.6rem)] font-semibold tracking-[-0.04em] text-[color:var(--landing-ink)]">
            The claim stays in view
          </h2>
          <ol className="border-t border-[color:var(--landing-border)]">
            {STEPS.map((step, index) => (
              <li
                key={step.title}
                className="border-b border-[color:var(--landing-border)] py-7"
              >
                <p className="landing-display text-sm font-semibold tabular-nums text-[color:var(--landing-teal)]">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="landing-display mt-2 text-xl font-semibold tracking-[-0.02em] text-[color:var(--landing-ink)]">
                  {step.title}
                </h3>
                <p className="landing-body mt-2 text-base leading-[1.7] text-[color:var(--landing-ledger-ink)]">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-t border-[color:var(--landing-border)] bg-white pb-24 sm:pb-32">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 pt-4 sm:px-10 md:grid-cols-2 lg:px-12">
          <BrandParallaxPhoto
            src="/landing/solution-submit-claims.jpg"
            alt="A clinic officer checking a claim before it is submitted"
            className="h-[42vh] w-full min-h-[18rem] md:h-[28rem]"
            imageClassName="object-[center_22%]"
            sizes="(min-width: 768px) 46vw, 100vw"
          />
          <div>
            <p className="landing-display text-[clamp(1.6rem,3vw,2.3rem)] font-medium italic leading-[1.25] tracking-[-0.03em] text-[color:var(--landing-ink)]">
              A rejected claim is revenue you already earned and still cannot
              collect.
            </p>
            <p className="landing-body mt-5 text-base leading-[1.7] text-[color:var(--landing-ledger-ink)]">
              Claims is not a portal for the insurer. It is the clinic&apos;s
              record of what left the building—and what still needs a person.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
