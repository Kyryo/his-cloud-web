import type { OpdQueueStage } from "@/features/clinical-opd/types/clinical-opd.types";
import { formatOpdQueueStage } from "@/features/clinical-opd/utils/opd-queue-stage";
import { cn } from "@/lib/utils";

const styles: Record<string, string> = {
  registered: "border-amber-200 bg-amber-50 text-amber-900",
  triaged: "border-brand-primary/25 bg-brand-tint text-brand-primary",
  with_clinician: "border-emerald-200 bg-emerald-50 text-emerald-900",
  completed: "border-dash-border bg-white text-brand-slate",
  cancelled: "border-red-200 bg-red-50 text-red-800",
};

type OpdQueueStageBadgeProps = {
  stage: OpdQueueStage | string;
  className?: string;
};

/**
 * Compact queue stage chip (matches OPD encounter header status sizing).
 */
export function OpdQueueStageBadge({
  stage,
  className,
}: OpdQueueStageBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center justify-center rounded-md border px-1.5 text-[11px] font-medium",
        styles[stage] ??
          "border-dash-border bg-white text-brand-slate",
        className,
      )}
      data-testid="opd-queue-stage-badge"
    >
      {formatOpdQueueStage(stage)}
    </span>
  );
}
