import { LANDING_WHY } from "@/features/brand/constants/landing-home-content";

const WHY_NUMBERS = ["01", "02", "03", "04"] as const;

export function LandingWhyFeatureCards() {
  return (
    <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-16 xl:gap-20">
      <div className="max-w-xl lg:sticky lg:top-28">
        <h2 className="landing-display text-[clamp(1.85rem,3.4vw,2.75rem)] font-semibold tracking-[-0.04em] text-[color:var(--landing-ink)] text-balance">
          {LANDING_WHY.title}
        </h2>
        <p className="landing-body mt-5 max-w-[40rem] text-[1.05rem] leading-[1.7] text-[color:var(--landing-ledger-ink)]">
          {LANDING_WHY.description}
        </p>
      </div>

      <ol className="m-0 list-none divide-y divide-[color:var(--landing-border)] border-y border-[color:var(--landing-border)] p-0">
        {LANDING_WHY.items.map((item, index) => (
          <li
            key={item.title}
            className="grid grid-cols-[auto_minmax(0,1fr)] gap-4 py-6 sm:gap-5 sm:py-7"
          >
            <span
              className="landing-display pt-0.5 text-sm font-semibold tabular-nums text-[color:var(--landing-teal)]"
              aria-hidden="true"
            >
              {WHY_NUMBERS[index]}
            </span>
            <div>
              <h3 className="landing-display text-[1.2rem] font-semibold tracking-[-0.018em] text-[color:var(--landing-ink)] sm:text-[1.35rem]">
                {item.title}
              </h3>
              <p className="landing-body mt-2 max-w-[38ch] text-base leading-[1.7] text-[color:var(--landing-ledger-ink)]">
                {item.description}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
