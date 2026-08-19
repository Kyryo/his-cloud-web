import Image from "next/image";

import { LANDING_SOLUTION } from "@/features/brand/constants/landing-home-content";

const STEPS = [
  {
    number: "01",
    src: "/landing/solution-submit-claims.jpg",
    alt: "A clinic officer checking a claim before it is submitted",
    object: "object-[center_22%]",
  },
  {
    number: "02",
    src: "/landing/solution-track-claims.jpg",
    alt: "Clinic staff tracking where each insurance claim stands",
    object: "object-[center_28%]",
  },
  {
    number: "03",
    src: "/landing/solution-match-payments.jpg",
    alt: "Matching a payment back to the patient visit it belongs to",
    object: "object-center",
  },
] as const;

export function LandingSolutionJourney() {
  return (
    <div className="mt-12 sm:mt-16">
      <ol className="m-0 grid list-none gap-10 p-0 sm:gap-12 lg:grid-cols-3 lg:gap-8">
        {LANDING_SOLUTION.items.map((item, index) => {
          const step = STEPS[index];

          return (
            <li key={item.title} className="min-w-0">
              <Image
                src={step.src}
                alt={step.alt}
                width={2133}
                height={1600}
                quality={90}
                sizes="(min-width: 1024px) 22vw, 90vw"
                className={`aspect-[4/3] w-full object-cover ${step.object}`}
              />
              <p
                className="landing-display mt-5 text-sm font-semibold tabular-nums text-[color:var(--landing-teal)]"
                aria-hidden="true"
              >
                {step.number}
              </p>
              <h3 className="landing-display mt-2 text-[1.25rem] font-semibold tracking-[-0.018em] text-[color:var(--landing-ink)] sm:text-[1.35rem]">
                {item.title}
              </h3>
              <p className="landing-body mt-2 max-w-[34ch] text-base leading-[1.7] text-[color:var(--landing-ledger-ink)]">
                {item.description}
              </p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
