import {
  CircleDollarSign,
  ServerOff,
  Sheet,
  Sparkles,
  Timer,
  type LucideIcon,
} from "lucide-react";

import { LANDING_WHY } from "@/features/brand/constants/landing-home-content";
import { cn } from "@/lib/utils";

const WHY_ICONS: LucideIcon[] = [ServerOff, Timer, Sheet, CircleDollarSign];

/** Short outcome line — encodes the payoff without decorative chrome. */
const WHY_OUTCOMES = [
  "Browser-only access",
  "Live in hours",
  "One connected ledger",
  "Traceable end to end",
] as const;

export function LandingWhyFeatureCards() {
  return (
    <ul className="mx-auto mt-16 grid max-w-5xl list-none gap-4 p-0 sm:mt-20 sm:grid-cols-2 sm:gap-5">
      {LANDING_WHY.items.map((item, index) => {
        const Icon = WHY_ICONS[index] ?? Sparkles;
        const outcome = WHY_OUTCOMES[index];

        return (
          <li
            key={item.title}
            className={cn(
              "group relative list-none rounded-[16px] border bg-white p-7 sm:p-8",
              "transition-[transform,box-shadow,border-color] duration-250 ease-out",
              "motion-safe:hover:-translate-y-0.5",
              "hover:border-[color:color-mix(in_srgb,var(--color-brand-primary)_35%,var(--color-brand-border))]",
              "hover:shadow-[0_12px_28px_-12px_rgba(15,23,42,0.14)]",
            )}
            style={{ borderColor: "var(--color-brand-border)" }}
          >
            <div className="flex items-center gap-3">
              <Icon
                className="size-[1.125rem] shrink-0"
                style={{ color: "var(--color-brand-primary)" }}
                strokeWidth={1.75}
                aria-hidden="true"
              />
              <p
                className="text-[11px] font-semibold uppercase tracking-[0.14em]"
                style={{ color: "var(--color-brand-muted)" }}
              >
                {outcome}
              </p>
            </div>

            <h3
              className="mt-5 font-[family-name:var(--font-bricolage)] text-xl font-semibold tracking-tight text-pretty sm:text-[1.35rem]"
              style={{ color: "var(--color-brand-navy)" }}
            >
              {item.title}
            </h3>

            <div
              aria-hidden="true"
              className="mt-5 h-px w-9 origin-left transition-[width,background-color] duration-300 ease-out group-hover:w-14"
              style={{
                backgroundColor:
                  "color-mix(in srgb, var(--color-brand-primary) 40%, transparent)",
              }}
            />

            <p
              className="mt-5 max-w-[36ch] text-[0.975rem] leading-[1.7]"
              style={{ color: "var(--color-brand-slate)" }}
            >
              {item.description}
            </p>
          </li>
        );
      })}
    </ul>
  );
}
