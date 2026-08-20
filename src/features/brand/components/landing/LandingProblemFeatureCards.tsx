import Image from "next/image";

import { LANDING_PROBLEM } from "@/features/brand/constants/landing-home-content";

const PROBLEM_NUMBERS = ["01", "02", "03", "04"] as const;

export function LandingProblemFeatureCards() {
  return (
    <div className="mt-12 sm:mt-16">
      <Image
        src="/landing/problem-rejected-claims.jpg"
        alt="A clinic finance officer reviewing a rejected insurance claim"
        width={2048}
        height={3072}
        quality={90}
        sizes="(min-width: 1024px) 72vw, 100vw"
        className="mx-auto aspect-[16/10] w-full max-w-5xl object-cover object-[center_18%] sm:aspect-[2.2/1]"
      />

      <ol className="mx-auto mt-12 grid max-w-4xl list-none gap-x-10 gap-y-10 p-0 sm:mt-16 sm:grid-cols-2 sm:gap-x-12 sm:gap-y-12">
        {LANDING_PROBLEM.items.map((item, index) => (
          <li key={item.title} className="min-w-0 text-center sm:text-left">
            <p
              className="landing-display text-sm font-semibold tabular-nums text-[color:var(--landing-teal)]"
              aria-hidden="true"
            >
              {PROBLEM_NUMBERS[index]}
            </p>
            <h3 className="landing-display mt-2 text-[1.25rem] font-semibold tracking-[-0.018em] text-[color:var(--landing-ink)] sm:text-[1.4rem]">
              {item.title}
            </h3>
            <p className="landing-body mx-auto mt-2 max-w-[36ch] text-base leading-[1.7] text-[color:var(--landing-ledger-ink)] sm:mx-0">
              {item.description}
            </p>
          </li>
        ))}
      </ol>

      <div className="mt-16 grid items-center gap-10 sm:mt-20 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-14">
        <Image
          src="/landing/problem-unmatched-payments.jpg"
          alt="Clinic staff matching a bank remittance to unpaid claims"
          width={2731}
          height={2048}
          quality={90}
          sizes="(min-width: 1024px) 40vw, 100vw"
          className="aspect-[5/4] w-full object-cover object-[center_40%] sm:aspect-[4/3]"
        />

        <blockquote className="max-w-[22rem] justify-self-center lg:max-w-none lg:justify-self-start">
          <span
            aria-hidden="true"
            className="mb-6 block h-0.5 w-10 bg-[color:var(--landing-teal)]"
          />
          <p className="landing-display pb-1 text-[clamp(1.45rem,2.6vw,2rem)] font-medium italic leading-[1.28] tracking-[-0.025em] text-[color:var(--landing-ink)] text-balance">
            {LANDING_PROBLEM.closing}
          </p>
        </blockquote>
      </div>
    </div>
  );
}
