import type {
  InternalOrderStatus,
  InventoryProduct,
  InventoryProductMeta,
  InventoryProductTypeLabel,
  PurchaseStatus,
  StockAdjustmentStatus,
} from "@/features/inventory/types/inventory.types";

export function formatInventoryAmount(
  value: string | number | null | undefined,
  currency = "",
  options?: {
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  },
): string {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  const numeric = typeof value === "number" ? value : Number.parseFloat(value);
  if (Number.isNaN(numeric)) {
    return String(value);
  }

  const formatted = numeric.toLocaleString(undefined, {
    minimumFractionDigits: options?.minimumFractionDigits ?? 0,
    maximumFractionDigits: options?.maximumFractionDigits ?? 2,
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
  product: {
    display_name?: string;
    name?: string;
    default_code?: string | false | null;
    uuid?: string;
    id?: number;
  },
): string {
  const name =
    product.display_name ||
    product.name ||
    (product.uuid ? `Product ${product.uuid.slice(0, 8)}…` : `Product #${product.uuid ?? "?"}`);
  if (product.default_code) {
    return `${name} (${product.default_code})`;
  }
  return name;
}

export function formatProductTypeLabel(
  product: Pick<InventoryProduct, "product_type_label" | "product_type">,
): string {
  if (product.product_type_label) {
    return product.product_type_label.charAt(0).toUpperCase() +
      product.product_type_label.slice(1);
  }

  switch (product.product_type) {
    case "product":
      return "Stockable";
    case "consu":
      return "Consumable";
    case "service":
      return "Service";
    default:
      return product.product_type ?? "—";
  }
}

export function getProductTypeBadgeVariant(
  label: InventoryProductTypeLabel | null | undefined,
): "default" | "secondary" | "outline" {
  switch (label) {
    case "stockable":
      return "default";
    case "consumable":
      return "secondary";
    case "service":
      return "outline";
    default:
      return "outline";
  }
}

export function formatBooleanLabel(value: boolean | null | undefined): string {
  if (value === true) {
    return "Yes";
  }
  if (value === false) {
    return "No";
  }
  return "—";
}

export function getProductMeta(product: InventoryProduct): InventoryProductMeta {
  return product.metadata ?? {};
}

export function formatProcedureScopeLabel(meta: InventoryProductMeta): string {
  if (meta.clinic_wide_procedure) {
    return "Clinic-wide";
  }
  if (meta.dental_only_procedure) {
    return "Dental only";
  }
  if (meta.opd_only_procedure) {
    return "OPD only";
  }
  if (meta.ipd_only_procedure) {
    return "IPD only";
  }
  if (meta.physio_only_procedure) {
    return "Physio only";
  }
  return "—";
}

export function formatPricelistComputePrice(value: string | undefined): string {
  switch (value) {
    case "fixed":
      return "Fixed price";
    case "percentage":
      return "Percentage";
    default:
      return value ?? "—";
  }
}
