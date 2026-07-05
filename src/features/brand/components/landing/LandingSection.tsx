import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export type LandingSectionVariant = "clay" | "warm" | "green" | "ink";

const VARIANT_CLASSES: Record<LandingSectionVariant, string> = {
  clay: "bg-[color:var(--landing-clay)]",
  warm: "bg-[color:var(--landing-warm)]",
  green: "bg-[color:var(--landing-green-tint)]",
  ink: "bg-[color:var(--landing-ink)] text-white",
};

type LandingSectionProps = {
  children: ReactNode;
  variant?: LandingSectionVariant;
  className?: string;
  id?: string;
};

export function LandingSection({
  children,
  variant = "clay",
  className,
  id,
}: LandingSectionProps) {
  return (
    <section
      id={id}
      className={cn(
        "py-20 lg:py-28",
        VARIANT_CLASSES[variant],
        className,
      )}
    >
      <div className="mx-auto max-w-7xl px-6 sm:px-12">{children}</div>
    </section>
  );
}
