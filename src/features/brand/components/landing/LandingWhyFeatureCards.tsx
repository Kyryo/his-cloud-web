import { LANDING_WHY } from "@/features/brand/constants/landing-home-content";

export function LandingWhyFeatureCards() {
  return (
    <ul className="mt-12 max-w-3xl list-none divide-y divide-[color:var(--landing-border)] p-0 sm:mt-16">
      {LANDING_WHY.items.map((item) => (
        <li key={item.title} className="py-7 first:pt-0 last:pb-0 sm:py-8">
          <h3 className="landing-display text-[1.35rem] font-semibold tracking-[-0.018em] text-[color:var(--landing-ink)] sm:text-[1.55rem]">
            {item.title}
          </h3>
          <p className="landing-body mt-2 max-w-[42ch] text-base leading-[1.7] text-[color:var(--landing-ledger-ink)]">
            {item.description}
          </p>
        </li>
      ))}
    </ul>
  );
}
