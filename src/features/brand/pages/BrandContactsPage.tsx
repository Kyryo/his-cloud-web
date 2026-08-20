import Link from "next/link";

import { ROUTES } from "@/constants/routes";

const TOPICS = [
  "Clinic size and current billing tools",
  "How claims move from visit to remittance",
  "Where payments get unmatched today",
  "What a focused walkthrough should cover",
] as const;

export function BrandContactsPage() {
  return (
    <>
      <section className="pt-28 pb-10 sm:pt-36 sm:pb-14">
        <div className="mx-auto max-w-6xl px-6 sm:px-10 lg:px-12">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16 lg:items-start">
            <div>
              <p className="landing-body text-sm font-semibold text-[color:var(--landing-teal)]">
                Contact
              </p>
              <h1 className="landing-display mt-4 max-w-[14ch] text-[clamp(2.35rem,5vw,4rem)] font-semibold leading-[1.06] tracking-[-0.045em] text-[color:var(--landing-ink)]">
                Let&apos;s find where revenue is getting stuck.
              </h1>
              <p className="landing-body mt-6 max-w-[34rem] text-base leading-[1.7] text-[color:var(--landing-ledger-ink)] sm:text-lg">
                Walk us through your billing, claims, and payment workflow. We
                will show how Sigma can make the trail clearer from the first
                visit onward.
              </p>
            </div>

            <aside className="border-t border-[color:var(--landing-border)] pt-8 lg:border-t-0 lg:border-l lg:pl-10 lg:pt-0">
              <p className="landing-display text-lg font-semibold tracking-[-0.02em] text-[color:var(--landing-ink)]">
                Talk with the team
              </p>
              <p className="landing-body mt-3 text-sm leading-[1.65] text-[color:var(--landing-ledger-ink)]">
                Share a short note about your clinic and the revenue workflow you
                want to improve. We will follow up with a relevant walkthrough.
              </p>
              <a
                href="mailto:hello@sigmaconnect.org?subject=Sigma%20clinic%20demo"
                className="landing-focus landing-btn-primary mt-7 inline-flex min-h-12 w-full items-center justify-center rounded-full px-7 py-3 text-[15px] font-semibold sm:w-auto"
              >
                Email hello@sigmaconnect.org
              </a>
              <Link
                href={ROUTES.pricing}
                className="landing-focus mt-4 inline-flex min-h-11 items-center text-[15px] font-semibold text-[color:var(--landing-teal)] transition-colors hover:text-[color:var(--landing-teal-hover)]"
              >
                Or talk to sales about pricing
              </Link>
            </aside>
          </div>
        </div>
      </section>

      <section className="border-t border-[color:var(--landing-border)] bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-6 sm:px-10 lg:px-12">
          <h2 className="landing-display text-[clamp(1.6rem,2.8vw,2.1rem)] font-semibold tracking-[-0.03em] text-[color:var(--landing-ink)]">
            What we usually cover
          </h2>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {TOPICS.map((topic) => (
              <li
                key={topic}
                className="border-t border-[color:var(--landing-border)] pt-4 text-base font-medium text-[color:var(--landing-ink)]"
              >
                {topic}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
