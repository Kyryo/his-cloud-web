import { LANDING_PROOF_STATS } from "@/features/brand/constants/landing-tokens";
import { cn } from "@/lib/utils";

type LandingStatRowProps = {
  className?: string;
  compact?: boolean;
};

export function LandingStatRow({ className, compact = false }: LandingStatRowProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap gap-x-8 gap-y-4",
        compact
          ? "justify-center text-center sm:justify-start sm:text-left"
          : "justify-start",
        className,
      )}
      role="list"
      aria-label="Clinic proof points"
    >
      {LANDING_PROOF_STATS.map((stat) => (
        <div key={stat.label} role="listitem" className="min-w-[7rem]">
          <p
            className={cn(
              "font-[family-name:var(--font-bricolage)] font-extrabold text-[color:var(--landing-ink)]",
              compact ? "text-xl sm:text-2xl" : "text-2xl sm:text-3xl",
            )}
          >
            {stat.value}
          </p>
          <p
            className={cn(
              "landing-body text-[color:var(--landing-ledger-ink)]",
              compact ? "text-xs sm:text-sm" : "text-sm",
            )}
          >
            {stat.label}
          </p>
        </div>
      ))}
    </div>
  );
}
