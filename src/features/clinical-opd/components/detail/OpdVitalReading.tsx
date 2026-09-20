import {
  splitVitalDisplay,
} from "@/features/clinical-opd/utils/opd-encounter-vitals";
import { cn } from "@/lib/utils";

const AMOUNT_CLASS = {
  sm: "text-lg",
  md: "text-2xl",
  lg: "text-3xl",
} as const;

type OpdVitalReadingProps = {
  value: string | null;
  emptyLabel?: string;
  size?: keyof typeof AMOUNT_CLASS;
};

export function OpdVitalReading({
  value,
  emptyLabel = "Not recorded",
  size = "md",
}: OpdVitalReadingProps) {
  if (!value) {
    return <span className="text-sm text-brand-muted">{emptyLabel}</span>;
  }

  const { amount, unit } = splitVitalDisplay(value);

  return (
    <span className="inline-flex items-baseline gap-1.5">
      <span
        className={cn(
          "font-semibold tracking-tight tabular-nums text-brand-navy",
          AMOUNT_CLASS[size],
        )}
      >
        {amount}
      </span>
      {unit ? (
        <span className="text-sm text-dash-muted">{unit}</span>
      ) : null}
    </span>
  );
}
