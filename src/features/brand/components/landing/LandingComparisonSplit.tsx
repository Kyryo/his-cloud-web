import { Ban, CheckCircle2 } from "lucide-react";
import Image from "next/image";

import { LANDING_COMPARISON } from "@/features/brand/constants/landing-home-content";

export function LandingComparisonSplit() {
  return (
    <div className="mt-12 sm:mt-16">
      <Image
        src="/landing/comparison-stop-chasing.jpg"
        alt="A clinic manager reviewing insurance claims with a clear view of what is still unpaid"
        width={2844}
        height={1600}
        quality={90}
        sizes="(min-width: 1024px) 72vw, 100vw"
        className="aspect-[16/9] w-full object-cover object-[center_22%] lg:aspect-[2.3/1]"
      />

      <div className="mt-10 grid gap-10 sm:mt-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <h3 className="landing-body text-sm font-medium text-[color:var(--landing-ledger-ink)]">
            {LANDING_COMPARISON.before.label}
          </h3>
          <ul className="mt-6 space-y-4">
            {LANDING_COMPARISON.before.items.map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 text-base leading-[1.65] text-[color:var(--landing-ledger-ink)]"
              >
                <Ban
                  className="mt-0.5 size-5 shrink-0 text-[color:var(--landing-ledger-ink)]/40"
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="border-t border-[color:var(--landing-border)] pt-10 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-16">
          <h3 className="landing-body text-sm font-medium text-[color:var(--landing-teal)]">
            {LANDING_COMPARISON.after.label}
          </h3>
          <ul className="mt-6 space-y-4">
            {LANDING_COMPARISON.after.items.map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 text-base font-medium leading-[1.65] text-[color:var(--landing-ink)]"
              >
                <CheckCircle2
                  className="mt-0.5 size-5 shrink-0 text-[color:var(--landing-teal)]"
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
