import type { ReactNode } from "react";

import { AppIcon, type AppIconName } from "@/components/icons/app-icon";
import { cn } from "@/lib/utils";

export type StatsCard1Tone = "teal" | "sky" | "violet" | "rose" | "amber" | "navy";

const TONE_CLASS: Record<StatsCard1Tone, string> = {
  teal: "bg-brand-tint text-brand-primary",
  sky: "bg-sky-50 text-sky-700",
  violet: "bg-violet-50 text-violet-700",
  rose: "bg-rose-50 text-rose-700",
  amber: "bg-amber-50 text-amber-800",
  navy: "bg-[#eef1f0] text-brand-navy",
};

export type StatsCard1Props = {
  title: string;
  value: ReactNode;
  change?: number;
  changeLabel?: string;
  icon?: AppIconName;
  tone?: StatsCard1Tone;
  className?: string;
};

export function StatsCard1({
  title,
  value,
  change,
  changeLabel,
  icon,
  tone = "teal",
  className,
}: StatsCard1Props) {
  const showTrend = change !== undefined && changeLabel;

  return (
    <div
      className={cn(
        "flex w-full items-start gap-3 rounded-xl border border-dash-border bg-dash-panel px-4 py-3.5 shadow-[0_1px_2px_rgb(15_23_42/0.03)]",
        className,
      )}
    >
      {icon ? (
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-lg",
            TONE_CLASS[tone],
          )}
        >
          <AppIcon name={icon} size={18} />
        </div>
      ) : null}
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-dash-muted">{title}</p>
        <div className="mt-0.5 text-2xl font-semibold tabular-nums leading-tight text-brand-navy">
          {value}
        </div>
        {showTrend ? (
          <p className="mt-0.5 text-xs text-dash-muted">
            <span className={change >= 0 ? "text-emerald-600" : "text-rose-600"}>
              {change >= 0 ? "+" : ""}
              {change}%
            </span>{" "}
            {changeLabel}
          </p>
        ) : null}
      </div>
    </div>
  );
}

type StatsCard1GridProps = {
  children: ReactNode;
  className?: string;
};

export function StatsCard1Grid({ children, className }: StatsCard1GridProps) {
  return (
    <div className={cn("grid gap-3 sm:grid-cols-2 xl:grid-cols-4", className)}>
      {children}
    </div>
  );
}
