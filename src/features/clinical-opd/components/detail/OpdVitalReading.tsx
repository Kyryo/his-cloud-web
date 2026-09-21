import { ArrowDown, ArrowUp } from "lucide-react";

import {
  splitVitalDisplay,
  type OpdVitalStatus,
} from "@/features/clinical-opd/utils/opd-encounter-vitals";
import { cn } from "@/lib/utils";

const AMOUNT_CLASS = {
  sm: "text-base",
  md: "text-2xl",
  lg: "text-3xl",
} as const;

type OpdVitalReadingProps = {
  value: string | null;
  emptyLabel?: string;
  size?: keyof typeof AMOUNT_CLASS;
  status?: OpdVitalStatus;
};

export function OpdVitalReading({
  value,
  emptyLabel = "Not recorded",
  size = "md",
  status = "unknown",
}: OpdVitalReadingProps) {
  if (!value) {
    return <span className="text-sm text-brand-muted">{emptyLabel}</span>;
  }

  const { amount, unit } = splitVitalDisplay(value);
  const isOutOfRange = status === "high" || status === "low";
  const OutOfRangeIcon = status === "high" ? ArrowUp : ArrowDown;

  return (
    <span
      className="inline-flex items-baseline gap-1"
      title={isOutOfRange ? `Outside the expected range (${status})` : undefined}
    >
      <span
        className={cn(
          "font-semibold tracking-tight tabular-nums",
          AMOUNT_CLASS[size],
          isOutOfRange ? "text-red-600" : "text-brand-navy",
        )}
      >
        {amount}
      </span>
      {isOutOfRange ? (
        <OutOfRangeIcon
          className="size-3.5 shrink-0 self-center text-red-600"
          aria-label={status === "high" ? "Above expected range" : "Below expected range"}
        />
      ) : null}
      {unit ? (
        <span className="text-xs text-dash-muted">{unit}</span>
      ) : null}
    </span>
  );
}
