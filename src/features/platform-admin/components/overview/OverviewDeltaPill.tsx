import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

import { cn } from "@/lib/utils";
import type { SeriesDelta } from "@/features/platform-admin/utils/overview-series";

type Props = {
  delta: SeriesDelta;
  /** Formats the absolute change, e.g. `+3` or `+2.4 pts`. */
  format: (change: number) => string;
};

export function OverviewDeltaPill({ delta, format }: Props) {
  const Icon =
    delta.direction === "up"
      ? ArrowUpRight
      : delta.direction === "down"
        ? ArrowDownRight
        : Minus;
  return (
    <span
      data-direction={delta.direction}
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-semibold tabular-nums ring-1 ring-inset",
        delta.direction === "up" &&
          "bg-emerald-500/10 text-emerald-700 ring-emerald-600/15 dark:text-emerald-400",
        delta.direction === "down" &&
          "bg-red-500/10 text-red-700 ring-red-600/15 dark:text-red-400",
        delta.direction === "flat" &&
          "bg-foreground/5 text-muted-foreground ring-foreground/10",
      )}
    >
      <Icon className="size-3" aria-hidden />
      {format(delta.change)}
    </span>
  );
}
