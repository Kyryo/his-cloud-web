import { humanizeOhCode } from "@/features/occupational-health/utils/oh-format";
import { cn } from "@/lib/utils";

type OhChipTone = "positive" | "caution" | "danger" | "neutral";

const TONE_CLASSES: Record<OhChipTone, string> = {
  positive: "border-emerald-200 bg-emerald-50 text-emerald-800",
  caution: "border-amber-200 bg-amber-50 text-amber-900",
  danger: "border-red-200 bg-red-50 text-red-800",
  neutral: "border-dash-border bg-white text-brand-slate",
};

const VALUE_TONES: Record<string, OhChipTone> = {
  fit: "positive",
  fit_with_restrictions: "caution",
  temporarily_unfit: "caution",
  deferred: "neutral",
  permanently_unfit: "danger",
  unfit: "danger",
  issued: "positive",
  amended: "caution",
  withdrawn: "neutral",
  open: "caution",
  closed: "neutral",
  minor: "neutral",
  moderate: "caution",
  major: "danger",
  fatal: "danger",
  watch: "caution",
  alert: "danger",
};

type OhStatusChipProps = {
  value: string;
  label?: string;
  className?: string;
};

export function OhStatusChip({ value, label, className }: OhStatusChipProps) {
  const tone = VALUE_TONES[value] ?? "neutral";

  return (
    <span
      className={cn(
        "inline-flex h-5 items-center rounded-md border px-1.5 text-[11px] font-medium",
        TONE_CLASSES[tone],
        className,
      )}
      data-testid="oh-status-chip"
    >
      {label ?? humanizeOhCode(value)}
    </span>
  );
}
