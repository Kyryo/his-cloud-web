import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export type LandingFeatureGridCardSize = "primary" | "secondary";

/** Light cream card surface — shared across all feature cards. */
const FEATURE_CARD_SURFACE =
  "border border-brand-border/80 bg-[color:var(--landing-warm)] shadow-[var(--landing-shadow)]";

export type LandingFeatureGridCardProps = {
  /** Bold lead phrase, e.g. "Stock alerts" */
  headlineBold: string;
  /** Gray continuation on the same line, e.g. "that catch shortages early" */
  headlineRest: string;
  href?: string;
  size?: LandingFeatureGridCardSize;
  /** Mockup area — screenshot or illustrated widget */
  mockup: ReactNode;
  className?: string;
};

export function LandingFeatureGridCard({
  headlineBold,
  headlineRest,
  href = "#",
  size = "primary",
  mockup,
  className,
}: LandingFeatureGridCardProps) {
  const isPrimary = size === "primary";

  return (
    <article
      className={cn(
        "flex flex-col rounded-[18px]",
        FEATURE_CARD_SURFACE,
        isPrimary ? "p-6 sm:p-7 lg:p-8" : "p-5 sm:p-6",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <h3
          className={cn(
            "min-w-0 leading-snug text-brand-navy",
            isPrimary ? "text-lg sm:text-xl" : "text-base sm:text-[17px]",
          )}
        >
          <span className="font-bold text-[color:var(--landing-ink)]">{headlineBold}</span>{" "}
          <span className="font-normal text-brand-muted">{headlineRest}</span>
        </h3>
        <Link
          href={href}
          aria-label={`Learn more about ${headlineBold}`}
          className="landing-focus flex size-9 shrink-0 items-center justify-center rounded-lg border border-brand-border bg-white text-brand-navy transition-colors hover:border-[color:var(--landing-teal)]/40 hover:bg-[color:var(--landing-teal-tint)]/30"
        >
          <ArrowUpRight className="size-4" aria-hidden="true" />
        </Link>
      </div>

      <div className={cn("relative mt-5 min-w-0", isPrimary ? "mt-6" : "mt-4")}>
        {mockup}
      </div>
    </article>
  );
}

type LandingFeatureGridProps = {
  intro?: ReactNode;
  closing?: ReactNode;
  primary: ReactNode;
  secondary: ReactNode;
  className?: string;
};

export function LandingFeatureGrid({
  intro,
  closing,
  primary,
  secondary,
  className,
}: LandingFeatureGridProps) {
  return (
    <div className={className}>
      {intro}
      <div className="mt-12 space-y-4 lg:mt-14 lg:space-y-5">
        <div className="grid gap-4 lg:grid-cols-2 lg:gap-5">{primary}</div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">{secondary}</div>
      </div>
      {closing ? <div className="mt-12 lg:mt-14">{closing}</div> : null}
    </div>
  );
}
