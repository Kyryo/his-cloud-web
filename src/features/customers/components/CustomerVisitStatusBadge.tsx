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
      <Badge variant="success" className={cn("gap-1.5 font-normal", className)}>
        <span className="size-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
        {label}
      </Badge>
    );
  }

  if (status === "completed") {
    return (
      <Badge variant="secondary" className={cn("gap-1.5 font-normal", className)}>
        <span className="size-1.5 rounded-full bg-brand-primary" aria-hidden="true" />
        {label}
      </Badge>
    );
  }

  if (status === "cancelled") {
    return (
      <Badge variant="outline" className={cn("gap-1.5 font-normal", className)}>
        <span className="size-1.5 rounded-full bg-rose-500" aria-hidden="true" />
        {label}
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className={cn("gap-1.5 font-normal text-brand-muted", className)}>
      <span className="size-1.5 rounded-full bg-dash-muted" aria-hidden="true" />
      {label}
    </Badge>
  );
}
