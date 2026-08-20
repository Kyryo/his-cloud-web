import Image from "next/image";
import Link from "next/link";

import { ROUTES } from "@/constants/routes";

const STEPS = [
  {
    number: "01",
    title: "Workflow discovery",
    body: "We map how visits, bills, claims, and payments move through your clinic before configuring the workspace.",
    image: "/landing/hero-clinic.jpg",
    alt: "Clinic staff discussing their daily workflow",
  },
  {
    number: "02",
    title: "Guided onboarding",
    body: "Your team learns Sigma through the real work they already do—with a focused path from setup to daily use.",
    image: "/landing/hero-clinic-care.png",
    alt: "Healthcare staff collaborating during onboarding",
  },
  {
    number: "03",
    title: "Ongoing support",
    body: "As clinic workflows change, support helps keep the system aligned with how the business operates.",
    image: "/landing/hero-clinic-corridor.png",
    alt: "A clinic team moving through a busy healthcare facility",
  },
] as const;

export function BrandServicesPage() {
  return (
    <>
      <section className="bg-[color:var(--landing-warm)] pt-28 pb-16 sm:pt-36 sm:pb-20">
        <div className="mx-auto max-w-3xl px-6 text-center sm:px-10">
          <p className="landing-body text-sm font-semibold text-[color:var(--landing-teal)]">
            Services
          </p>
          <h1 className="landing-display mt-4 text-[clamp(2.2rem,4.8vw,3.75rem)] font-semibold leading-[1.08] tracking-[-0.045em] text-[color:var(--landing-ink)] text-balance">
            Get live without turning it into an IT project.
          </h1>
          <p className="landing-body mx-auto mt-6 max-w-[38rem] text-base leading-[1.7] text-[color:var(--landing-ledger-ink)] sm:text-lg">
            Practical onboarding, clear training, and dependable support—not
            months of implementation overhead.
          </p>
          <Link
            href={ROUTES.contacts}
            className="landing-focus landing-btn-primary mt-8 inline-flex min-h-12 items-center justify-center rounded-full px-7 py-3 text-[15px] font-semibold"
          >
            Book a demo
          </Link>
        </div>
      </section>

      <section className="bg-white py-20 sm:py-28">
        <div className="mx-auto grid max-w-6xl gap-14 px-6 sm:px-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-20 lg:px-12">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <h2 className="landing-display max-w-[12ch] text-[clamp(1.85rem,3.4vw,2.75rem)] font-semibold tracking-[-0.04em] text-[color:var(--landing-ink)]">
              How clinics go live
            </h2>
            <p className="landing-body mt-5 max-w-[28rem] text-base leading-[1.7] text-[color:var(--landing-ledger-ink)]">
              Good implementation should make the software feel ordinary by the
              time your clinic opens the next morning.
            </p>
          </div>

          <ol className="space-y-16">
            {STEPS.map((step) => (
              <li key={step.number} className="grid gap-6">
                <div>
                  <p className="landing-display text-sm font-semibold tabular-nums text-[color:var(--landing-teal)]">
                    {step.number}
                  </p>
                  <h3 className="landing-display mt-2 text-2xl font-semibold tracking-[-0.03em] text-[color:var(--landing-ink)]">
                    {step.title}
                  </h3>
                  <p className="landing-body mt-3 max-w-[36rem] text-base leading-[1.7] text-[color:var(--landing-ledger-ink)]">
                    {step.body}
                  </p>
                </div>
                <Image
                  src={step.image}
                  alt={step.alt}
                  width={1400}
                  height={900}
                  quality={88}
                  className="aspect-[16/10] w-full object-cover"
                  sizes="(min-width: 1024px) 42vw, 100vw"
                />
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}
