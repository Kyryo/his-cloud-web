import type {
  InternalOrderStatus,
  PurchaseStatus,
  StockAdjustmentStatus,
} from "@/features/inventory/types/inventory.types";

export function formatInventoryAmount(
  value: string | number | null | undefined,
  currency = "",
): string {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  const numeric = typeof value === "number" ? value : Number.parseFloat(value);
  if (Number.isNaN(numeric)) {
    return String(value);
  }

  const formatted = numeric.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

  return currency ? `${currency} ${formatted}` : formatted;
}

export function formatInventoryQuantity(
  value: string | number | null | undefined,
): string {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  const numeric = typeof value === "number" ? value : Number.parseFloat(value);
  if (Number.isNaN(numeric)) {
    return String(value);
  }

  return numeric.toLocaleString(undefined, {
    maximumFractionDigits: 4,
  });
}

export function formatPurchaseStatusLabel(status: PurchaseStatus | undefined): string {
  switch (status) {
    case "DRAFT":
      return "Draft";
    case "SUBMITTED":
      return "Submitted";
    case "CONFIRMED":
      return "Confirmed";
    case "CANCELLED":
      return "Cancelled";
    default:
      return status ?? "Unknown";
  }
}

export function formatInternalOrderStatusLabel(
  status: InternalOrderStatus | undefined,
): string {
  switch (status) {
    case "DRAFT":
      return "Draft";
    case "SUBMITTED":
      return "Submitted";
    case "APPROVED":
      return "Approved";
    case "REJECTED":
      return "Rejected";
    case "DISPATCHED":
      return "Dispatched";
    case "RECEIVED":
      return "Received";
    case "CANCELLED":
      return "Cancelled";
    default:
      return status ?? "Unknown";
  }
}

export function formatStockAdjustmentStatusLabel(
  status: StockAdjustmentStatus | undefined,
): string {
  switch (status) {
    case "DRAFT":
      return "Draft";
    case "SUBMITTED":
      return "Submitted";
    case "APPROVED":
      return "Approved";
    case "REJECTED":
      return "Rejected";
    case "APPLIED":
      return "Applied";
    case "CANCELLED":
      return "Cancelled";
    default:
      return status ?? "Unknown";
  }
}

export function formatDocumentTypeLabel(documentType: string | undefined): string {
  switch (documentType) {
    case "PURCHASE_ORDER":
      return "Purchase order";
    case "INTERNAL_ORDER":
      return "Internal order";
    case "STOCK_ADJUSTMENT":
      return "Stock adjustment";
    default:
      return documentType ?? "Document";
  }
}

export function formatAdjustmentTypeLabel(type: string | undefined): string {
  switch (type) {
    case "QUANTITY":
      return "Quantity";
    case "COST":
      return "Cost";
    default:
      return type ?? "—";
  }
}

export function formatMovementTypeLabel(type: string | undefined): string {
  if (!type) {
    return "—";
  }
  return type
    .split("_")
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(" ");
}

export function formatDisplayDate(value: string | null | undefined): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDisplayDateTime(value: string | null | undefined): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatProductLabel(
  product: { display_name?: string; name?: string; default_code?: string | null; id?: number },
): string {
  const name = product.display_name || product.name || `Product #${product.id ?? "?"}`;
  if (product.default_code) {
    return `${name} (${product.default_code})`;
  }
  return name;
}
