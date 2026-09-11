import type { StatusPillVariant } from "@/components/ui/status-pill";
import type {
  ReceivablesAgingBucket,
  ReceivablesDebtor,
} from "@/features/receivables/types/receivables.types";
import { formatInvoiceDate } from "@/features/invoices/utils/format-invoice";
import { formatAmountNumber } from "@/features/sales-orders/utils/format-sales-order";

export function formatReceivablesClientName(
  name: string | null | undefined,
): string {
  const trimmed = name?.trim();
  return trimmed || "No client";
}

export function formatReceivablesIdentifier(
  identifier: string | null | undefined,
): string {
  const trimmed = identifier?.trim();
  if (!trimmed) {
    return "No ID";
  }

  const separator = trimmed.lastIndexOf("-");
  if (separator === -1 || separator === trimmed.length - 1) {
    return trimmed;
  }

  return trimmed.slice(separator + 1);
}

export function formatReceivablesAmount(
  value: string | number | null | undefined,
): string {
  return formatAmountNumber(value);
}

export function formatReceivablesInvoiceDate(
  value: string | null | undefined,
): string {
  return formatInvoiceDate(value);
}

export function formatReceivablesDaysOutstanding(days: number): string {
  if (!Number.isFinite(days) || days < 0) {
    return "—";
  }
  if (days === 1) {
    return "1 day";
  }
  return `${days} days`;
}

export function formatReceivablesAgingLabel(
  bucket: ReceivablesAgingBucket | string,
): string {
  switch (bucket) {
    case "0-30":
      return "0–30 days";
    case "31-60":
      return "31–60 days";
    case "61-90":
      return "61–90 days";
    case "90+":
      return "90+ days";
    default:
      return bucket;
  }
}

export function getReceivablesAgingVariant(
  bucket: ReceivablesAgingBucket | string,
): StatusPillVariant {
  switch (bucket) {
    case "0-30":
      return "secondary";
    case "31-60":
      return "warning";
    case "61-90":
      return "warning";
    case "90+":
      return "destructive";
    default:
      return "outline";
  }
}

export function getReceivablesDueSource(debtor: ReceivablesDebtor): string {
  const opening = Number(debtor.opening_balance) || 0;
  const invoiced = Number(debtor.total_invoiced) || 0;

  if (opening > 0 && invoiced > 0) {
    return "Opening + invoices";
  }
  if (opening > 0) {
    return "Opening balance";
  }
  if (invoiced > 0) {
    return "Invoices";
  }
  return "Balance";
}
