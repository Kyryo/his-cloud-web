import Link from "next/link";

import { ROUTES } from "@/constants/routes";

const BELIEFS = [
  {
    title: "Built around clinic reality",
    body: "Sigma starts with the people handling patients, claims, and payments every day—not with an abstract software model.",
  },
  {
    title: "Focused on financial continuity",
    body: "We treat revenue as a continuous trail that begins with care and ends only when the clinic is fully paid.",
  },
  {
    title: "Designed to stay understandable",
    body: "Healthcare operations are already complex. The software should clarify the work instead of adding another layer to manage.",
  },
] as const;

export function BrandAboutPage() {
  return (
    <>
      <section className="pt-32 pb-20 sm:pt-40 sm:pb-28">
        <div className="mx-auto max-w-4xl px-6 sm:px-10 lg:px-12">
          <p className="landing-body text-sm font-semibold text-[color:var(--landing-teal)]">
            About Sigma
          </p>
          <h1 className="landing-display mt-5 text-[clamp(2.5rem,6vw,4.75rem)] font-semibold leading-[1.02] tracking-[-0.05em] text-[color:var(--landing-ink)]">
            We build for the work that continues after care is delivered.
          </h1>
          <p className="landing-body mt-8 max-w-[36rem] text-lg leading-[1.7] text-[color:var(--landing-ledger-ink)] sm:text-xl">
            Clinics do not lose revenue because they stop caring for patients.
            They lose it when information breaks between the visit, the bill,
            the insurer, and the payment.
          </p>
        </div>
      </section>

      <section className="border-y border-[color:var(--landing-border)] bg-[color:var(--landing-ink)] py-16 sm:py-20">
        <blockquote className="mx-auto max-w-4xl px-6 sm:px-10">
          <p className="landing-display text-[clamp(1.55rem,3vw,2.4rem)] font-medium italic leading-[1.3] tracking-[-0.03em] text-white text-balance">
            Treating the patient is the clinical outcome. Collecting what the
            clinic earned keeps that care sustainable.
          </p>
        </blockquote>
      </section>

      <section className="bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-6 sm:px-10 lg:px-12">
          <h2 className="landing-display text-[clamp(1.75rem,3vw,2.4rem)] font-semibold tracking-[-0.04em] text-[color:var(--landing-ink)]">
            What we believe
          </h2>
          <div className="mt-14 space-y-12">
            {BELIEFS.map((belief, index) => (
              <article
                key={belief.title}
                className={
                  index % 2 === 1
                    ? "max-w-2xl border-r-2 border-[color:var(--landing-teal)] pr-6 text-right sm:ml-auto sm:pr-8"
                    : "max-w-2xl border-l-2 border-[color:var(--landing-teal)] pl-6 sm:pl-8"
                }
              >
                <h3 className="landing-display text-xl font-semibold tracking-[-0.02em] text-[color:var(--landing-ink)] sm:text-2xl">
                  {belief.title}
                </h3>
                <p className="landing-body mt-3 text-base leading-[1.7] text-[color:var(--landing-ledger-ink)]">
                  {belief.body}
                </p>
              </article>
            ))}
          </div>
          <div className="mt-16 flex flex-col gap-3 sm:flex-row">
            <Link
              href={ROUTES.company}
              className="landing-focus landing-btn-secondary inline-flex min-h-12 items-center justify-center rounded-full border px-7 py-3 text-[15px] font-semibold"
            >
              Our company
            </Link>
            <Link
              href={ROUTES.contacts}
              className="landing-focus landing-btn-primary inline-flex min-h-12 items-center justify-center rounded-full px-7 py-3 text-[15px] font-semibold"
            >
              Book a demo
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
