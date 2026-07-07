import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type LandingFeatureRowProps = {
  title: string;
  description: string;
  /** Optional secondary paragraph or bullet list */
  supporting?: ReactNode;
  visual: ReactNode;
  /** When true, visual sits on the right on lg+ (text left). Alternates by index. */
  visualOnRight?: boolean;
  className?: string;
};

export function LandingFeatureRow({
  title,
  description,
  supporting,
  visual,
  visualOnRight = true,
  className,
}: LandingFeatureRowProps) {
  return (
    <div
      className={cn(
        "grid items-center gap-8 lg:grid-cols-2 lg:gap-14 xl:gap-16",
        className,
      )}
    >
      <div className={cn("min-w-0", !visualOnRight && "lg:order-2")}>
        <h3 className="landing-display text-[clamp(1.5rem,2.5vw,2rem)] font-extrabold leading-tight">
          {title}
        </h3>
        <p className="landing-body mt-4 text-base leading-relaxed text-[color:var(--landing-ledger-ink)] sm:text-lg">
          {description}
        </p>
        {supporting ? (
          <div className="landing-body mt-4 text-base leading-relaxed text-[color:var(--landing-ledger-ink)]">
            {supporting}
          </div>
        ) : null}
      </div>
      <div className={cn("min-w-0", !visualOnRight && "lg:order-1")}>{visual}</div>
    </div>
  );
}

type LandingFeatureRowsProps = {
  intro?: ReactNode;
  closing?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function LandingFeatureRows({
  intro,
  closing,
  children,
  className,
}: LandingFeatureRowsProps) {
  return (
    <div className={className}>
      {intro}
      <div className="mt-12 space-y-16 lg:mt-16 lg:space-y-24">{children}</div>
      {closing ? <div className="mt-12 lg:mt-16">{closing}</div> : null}
    </div>
  );
}
