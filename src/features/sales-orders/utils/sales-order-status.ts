import type {
  SalesOrder,
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

export function canEditSalesOrderLines(state: SalesOrderState): boolean {
  return state === "draft" || state === "sent";
}

import { hasSavedSplitMismatch } from "@/features/sales-orders/utils/sales-order-line-split-mismatch";

export function getConvertSalesOrderToInvoiceDisabledReason(
  order: Pick<SalesOrder, "state" | "invoice_status" | "lines">,
  options?: { hasDraftSplitMismatch?: boolean },
): string | null {
  if (order.state === "cancel") {
    return "Cancelled orders cannot be converted to an invoice.";
  }

  if (order.invoice_status === "invoiced") {
    return "This sales order is already fully invoiced.";
  }

  if ((order.lines ?? []).length === 0) {
    return "Add at least one line item before converting to an invoice.";
  }

  if (options?.hasDraftSplitMismatch || hasSavedSplitMismatch(order)) {
    return "Resolve client/insurance split mismatch first.";
  }

  return null;
}

export function canConvertSalesOrderToInvoice(
  order: Pick<SalesOrder, "state" | "invoice_status" | "lines">,
  options?: { hasDraftSplitMismatch?: boolean },
): boolean {
  return (
    getConvertSalesOrderToInvoiceDisabledReason(order, options) === null
  );
}

export function getCancelSalesOrderDisabledReason(
  order: Pick<SalesOrder, "state">,
): string | null {
  if (order.state === "done") {
    return "Locked sales orders cannot be cancelled.";
  }

  if (order.state === "cancel") {
    return "This sales order is already cancelled.";
  }

  return null;
}

export function canCancelSalesOrder(order: Pick<SalesOrder, "state">): boolean {
  return getCancelSalesOrderDisabledReason(order) === null;
}
