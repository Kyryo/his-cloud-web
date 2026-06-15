import { Badge } from "@/components/ui/badge";
import type { TherapyVisitStatus } from "@/features/therapy/types/therapy.types";

const VISIT_STATUS_LABELS: Record<TherapyVisitStatus, string> = {
  not_started: "Not started",
  active: "Active",
  completed: "Completed",
  cancelled: "Cancelled",
};

export function TherapyVisitStatusBadge({
  status,
}: {
  status: TherapyVisitStatus;
}) {
  const variant =
    status === "active"
      ? "success"
      : status === "completed"
        ? "secondary"
        : status === "cancelled"
          ? "destructive"
          : "outline";

  return <Badge variant={variant}>{VISIT_STATUS_LABELS[status]}</Badge>;
}
