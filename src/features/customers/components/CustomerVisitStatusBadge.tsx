import {
  StatusDotBadge,
  type StatusDotBadgeTone,
} from "@/components/ui/status-dot-badge";
import type { CustomerVisitStatus } from "@/features/customers/types/customer-visit-status.types";
import { formatCustomerVisitStatusLabel } from "@/features/customers/utils/customer-visit-status";

type CustomerVisitStatusBadgeProps = {
  status: CustomerVisitStatus | string | undefined;
  className?: string;
};

const TONES: Record<string, StatusDotBadgeTone> = {
  active: "success",
  completed: "primary",
  cancelled: "danger",
};

export function CustomerVisitStatusBadge({
  status,
  className,
}: CustomerVisitStatusBadgeProps) {
  return (
    <StatusDotBadge tone={TONES[status ?? ""] ?? "neutral"} className={className}>
      {formatCustomerVisitStatusLabel(status)}
    </StatusDotBadge>
  );
}
