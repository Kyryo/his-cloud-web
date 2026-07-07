import type { ReactNode } from "react";

import { LandingDottedArcDecor } from "@/features/brand/components/landing/LandingDottedArcDecor";
import { cn } from "@/lib/utils";

export type LandingSectionVariant =
  | "clay"
  | "warm"
  | "green"
  | "brandGreen"
  | "ink"
  | "white";

const VARIANT_CLASSES: Record<LandingSectionVariant, string> = {
  clay: "bg-[color:var(--landing-clay)]",
  warm: "bg-[color:var(--landing-warm)]",
  green: "bg-[color:var(--landing-green-tint)]",
  brandGreen: "bg-[color:var(--landing-green)] text-white",
  ink: "bg-[color:var(--landing-ink)] text-white",
  white: "bg-white",
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
  variant = "clay",
  className,
  id,
  withDottedPattern = false,
}: LandingSectionProps) {
  return (
    <section
      id={id}
      className={cn(
        "relative py-20 lg:py-28",
        withDottedPattern && "overflow-hidden",
        VARIANT_CLASSES[variant],
        className,
      )}
    >
      {withDottedPattern ? <LandingDottedArcDecor /> : null}
      <div className="relative z-10 mx-auto max-w-7xl px-6 sm:px-12">{children}</div>
    </section>
  );
}
