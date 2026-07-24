import type { ReactNode } from "react";

import { LandingDottedArcDecor } from "@/features/brand/components/landing/LandingDottedArcDecor";
import { cn } from "@/lib/utils";

export type LandingSectionVariant = "white" | "muted" | "clay" | "warm";

const VARIANT_CLASSES: Record<LandingSectionVariant, string> = {
  white: "bg-white",
  muted: "bg-[color:var(--landing-warm)]",
  /** Aliases kept for older call sites */
  clay: "bg-[color:var(--landing-warm)]",
  warm: "bg-white",
};

type LandingSectionProps = {
  children: ReactNode;
  variant?: LandingSectionVariant;
  className?: string;
  id?: string;
  /** Faint dotted arc texture behind section content. */
  withDottedPattern?: boolean;
};

export function LandingSection({
  children,
  variant = "white",
  className,
  id,
  withDottedPattern = false,
}: LandingSectionProps) {
  return (
    <section
      id={id}
      className={cn(
        "relative py-24 sm:py-28 lg:py-32",
        withDottedPattern && "overflow-hidden",
        VARIANT_CLASSES[variant],
        className,
      )}
    >
      {withDottedPattern ? <LandingDottedArcDecor /> : null}
      <div className="relative z-10 mx-auto max-w-6xl px-6 sm:px-10 lg:px-12">
        {children}
      </div>
    </section>
  );
}
