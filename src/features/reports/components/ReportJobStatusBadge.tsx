import { Badge } from "@/components/ui/badge";
import type { ReportJobStatus } from "@/features/reports/types/report-job.types";

const STATUS_LABELS: Record<ReportJobStatus, string> = {
  queued: "Queued",
  running: "Running",
  completed: "Completed",
  failed: "Failed",
  cancelled: "Cancelled",
  expired: "Expired",
};

const STATUS_VARIANT: Record<
  ReportJobStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  queued: "secondary",
  running: "default",
  completed: "secondary",
  failed: "destructive",
  cancelled: "outline",
  expired: "outline",
};

const STATUS_CLASS: Partial<Record<ReportJobStatus, string>> = {
  queued: "text-brand-primary",
  completed: "text-brand-primary",
};

type ReportJobStatusBadgeProps = {
  status: ReportJobStatus;
};

export function ReportJobStatusBadge({ status }: ReportJobStatusBadgeProps) {
  return (
    <Badge variant={STATUS_VARIANT[status]} className={STATUS_CLASS[status]}>
      {STATUS_LABELS[status]}
    </Badge>
  );
}
