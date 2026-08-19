import Image from "next/image";

import { LANDING_PROBLEM } from "@/features/brand/constants/landing-home-content";

const PROBLEM_NUMBERS = ["01", "02", "03", "04"] as const;

export function LandingProblemFeatureCards() {
  return (
    <div className="mt-12 sm:mt-16">
      <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-16">
        <Image
          src="/landing/problem-rejected-claims.jpg"
          alt="A clinic finance officer reviewing a rejected insurance claim"
          width={2048}
          height={3072}
          quality={90}
          sizes="(min-width: 1024px) 28vw, 90vw"
          className="aspect-[4/5] w-full object-cover object-[center_18%] sm:aspect-[3/4]"
        />

        <ol className="m-0 list-none divide-y divide-[color:var(--landing-border)] p-0">
          {LANDING_PROBLEM.items.map((item, index) => (
            <li
              key={item.title}
              className="grid grid-cols-[auto_minmax(0,1fr)] gap-4 py-6 first:pt-0 last:pb-0 sm:gap-6 sm:py-7"
            >
              <span
                className="landing-display pt-0.5 text-sm font-semibold tabular-nums text-[color:var(--landing-teal)]"
                aria-hidden="true"
              >
                {PROBLEM_NUMBERS[index]}
              </span>
              <div>
                <h3 className="landing-display text-[1.2rem] font-semibold tracking-[-0.018em] text-[color:var(--landing-ink)] sm:text-[1.35rem]">
                  {item.title}
                </h3>
                <p className="landing-body mt-2 max-w-[40ch] text-base leading-[1.7] text-[color:var(--landing-ledger-ink)]">
                  {item.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <figure className="relative mt-16 sm:mt-20">
        <Image
          src="/landing/problem-unmatched-payments.jpg"
          alt="Clinic staff matching a bank remittance to unpaid claims"
          width={2731}
          height={2048}
          quality={90}
          sizes="(min-width: 1024px) 72vw, 100vw"
          className="aspect-[4/3] w-full object-cover object-[center_40%] sm:aspect-[16/9] lg:aspect-[2.3/1]"
        />
        <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#1f2a24] via-[#1f2a24]/80 to-transparent px-5 pb-6 pt-20 sm:px-8 sm:pb-8 sm:pt-28 lg:px-10">
          <p className="landing-display max-w-[26ch] text-[1.25rem] font-semibold leading-snug tracking-[-0.018em] text-white sm:text-[1.55rem] lg:text-[1.7rem]">
            {LANDING_PROBLEM.closing}
          </p>
        </figcaption>
      </figure>
    </div>
  );
}
