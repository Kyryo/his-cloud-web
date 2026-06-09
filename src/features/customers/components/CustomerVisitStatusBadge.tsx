import { Badge } from "@/components/ui/badge";
import type { CustomerVisitStatus } from "@/features/customers/types/customer-visit-status.types";
import { formatCustomerVisitStatusLabel } from "@/features/customers/utils/customer-visit-status";
import { cn } from "@/lib/utils";

type CustomerVisitStatusBadgeProps = {
  status: CustomerVisitStatus | string | undefined;
  className?: string;
};

export function CustomerVisitStatusBadge({
  status,
  className,
}: CustomerVisitStatusBadgeProps) {
  const label = formatCustomerVisitStatusLabel(status);

  if (status === "active") {
    return (
      <Badge variant="success" className={cn("font-normal", className)}>
        {label}
      </Badge>
    );
  }

  if (status === "completed") {
    return (
      <Badge variant="secondary" className={cn("font-normal", className)}>
        {label}
      </Badge>
    );
  }

  if (status === "cancelled") {
    return (
      <Badge variant="outline" className={cn("font-normal", className)}>
        {label}
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className={cn("font-normal text-brand-muted", className)}>
      {label}
    </Badge>
  );
}
