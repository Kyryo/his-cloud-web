import Image from "next/image";

import { LANDING_REVENUE } from "@/features/brand/constants/landing-home-content";

const METRIC_NUMBERS = ["01", "02", "03", "04", "05", "06"] as const;

export function LandingRevenueStandings() {
  return (
    <div className="mt-12 grid items-start gap-10 sm:mt-16 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16">
      <Image
        src="/landing/revenue-money-stands.jpg"
        alt="A clinic finance lead reviewing a revenue summary at the front desk"
        width={2048}
        height={3072}
        quality={90}
        sizes="(min-width: 1024px) 28vw, 90vw"
        className="aspect-[4/5] w-full object-cover object-[center_18%] sm:aspect-[3/4]"
      />

      <ol className="m-0 grid list-none gap-x-10 gap-y-0 p-0 sm:grid-cols-2">
        {LANDING_REVENUE.items.map((item, index) => (
          <li
            key={item}
            className="border-t border-[color:var(--landing-border)] py-5 first:border-t-0 sm:py-6 sm:[&:nth-child(2)]:border-t-0"
          >
            <p
              className="landing-display text-sm font-semibold tabular-nums text-[color:var(--landing-teal)]"
              aria-hidden="true"
            >
              {METRIC_NUMBERS[index]}
            </p>
            <p className="landing-display mt-2 text-[1.15rem] font-semibold tracking-[-0.018em] text-[color:var(--landing-ink)] sm:text-[1.25rem]">
              {item}
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}
