import type {
  SalesOrderInvoiceStatus,
  SalesOrderState,
} from "@/features/sales-orders/types/sales-order.types";

export function formatSalesOrderStateLabel(state: SalesOrderState): string {
  switch (state) {
    case "draft":
      return "Draft";
    case "sent":
      return "Quotation sent";
    case "sale":
      return "Confirmed";
    case "done":
      return "Locked";
    case "cancel":
      return "Cancelled";
    default:
      return state ? state.charAt(0).toUpperCase() + state.slice(1) : "Unknown";
  }
}

export function formatSalesOrderInvoiceStatusLabel(
  status: SalesOrderInvoiceStatus,
): string {
  switch (status) {
    case "no":
      return "Nothing to invoice";
    case "to invoice":
      return "To invoice";
    case "invoiced":
      return "Fully invoiced";
    case "upselling":
      return "Upselling";
    default:
      return status
        ? status.charAt(0).toUpperCase() + status.slice(1)
        : "Unknown";
  }
}

export type SalesOrderBadgeVariant =
  | "default"
  | "secondary"
  | "outline"
  | "success"
  | "warning"
  | "destructive";

export function getSalesOrderStateBadgeVariant(
  state: SalesOrderState,
): SalesOrderBadgeVariant {
  switch (state) {
    case "sale":
    case "done":
      return "success";
    case "draft":
    case "sent":
      return "secondary";
    case "cancel":
      return "destructive";
    default:
      return "outline";
  }
}

export function getSalesOrderInvoiceStatusBadgeVariant(
  status: SalesOrderInvoiceStatus,
): SalesOrderBadgeVariant {
  switch (status) {
    case "invoiced":
      return "success";
    case "to invoice":
      return "warning";
    case "no":
      return "outline";
    default:
      return "secondary";
  }
}
