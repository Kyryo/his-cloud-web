import { LANDING_PROOF_STATS } from "@/features/brand/constants/landing-tokens";
import { cn } from "@/lib/utils";

type LandingStatRowProps = {
  className?: string;
  compact?: boolean;
  align?: "start" | "center";
};

export function LandingStatRow({
  className,
  compact = false,
  align = "start",
}: LandingStatRowProps) {
  const isCenter = align === "center";

  return (
    <div
      className={cn(
        "flex flex-wrap gap-x-8 gap-y-4",
        isCenter ? "justify-center text-center" : "justify-start",
        className,
      )}
      role="list"
      aria-label="Clinic proof points"
    >
      {LANDING_PROOF_STATS.map((stat) => (
        <div key={stat.label} role="listitem" className="min-w-[7.5rem]">
          <p
            className={cn(
              "font-[family-name:var(--font-bricolage)] font-semibold tracking-tight text-[color:var(--landing-teal)]",
              compact ? "text-2xl sm:text-3xl" : "text-3xl sm:text-4xl",
            )}
          >
            {stat.value}
          </p>
          <p
            className={cn(
              "landing-body mt-1 text-[color:var(--landing-ledger-ink)]",
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
