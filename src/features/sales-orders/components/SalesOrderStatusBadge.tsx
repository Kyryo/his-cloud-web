import { Badge } from "@/components/ui/badge";
import type {
  SalesOrderInvoiceStatus,
  SalesOrderState,
} from "@/features/sales-orders/types/sales-order.types";
import {
  formatSalesOrderInvoiceStatusLabel,
  formatSalesOrderStateLabel,
  getSalesOrderInvoiceStatusBadgeVariant,
  getSalesOrderStateBadgeVariant,
} from "@/features/sales-orders/utils/sales-order-status";
import { cn } from "@/lib/utils";

type SalesOrderStateBadgeProps = {
  state: SalesOrderState;
  className?: string;
};

export function SalesOrderStateBadge({
  state,
  className,
}: SalesOrderStateBadgeProps) {
  return (
    <Badge
      variant={getSalesOrderStateBadgeVariant(state)}
      className={cn("font-normal", className)}
    >
      {formatSalesOrderStateLabel(state)}
    </Badge>
  );
}

type SalesOrderInvoiceStatusBadgeProps = {
  status: SalesOrderInvoiceStatus;
  className?: string;
};

export function SalesOrderInvoiceStatusBadge({
  status,
  className,
}: SalesOrderInvoiceStatusBadgeProps) {
  return (
    <Badge
      variant={getSalesOrderInvoiceStatusBadgeVariant(status)}
      className={cn("font-normal", className)}
    >
      {formatSalesOrderInvoiceStatusLabel(status)}
    </Badge>
  );
}
