import type { InventoryListFilters } from "@/features/inventory/types/inventory.types";

export type InventoryTriStateFilter = "all" | "yes" | "no";
export type InventoryActiveFilter = "all" | "active" | "inactive";

export type InventoryOrderingOption = {
  value: string;
  label: string;
};

export const DEFAULT_INVENTORY_ORDERING = "-created_at";

export const INVENTORY_ORDERING_OPTIONS: InventoryOrderingOption[] = [
  { value: "-created_at", label: "Newest first" },
  { value: "created_at", label: "Oldest first" },
];

export const STOCK_ORDERING_OPTIONS: InventoryOrderingOption[] = [
  ...INVENTORY_ORDERING_OPTIONS,
  { value: "-quantity_on_hand", label: "Quantity (high to low)" },
  { value: "quantity_on_hand", label: "Quantity (low to high)" },
];

export const MOVEMENT_ORDERING_OPTIONS: InventoryOrderingOption[] = [
  ...INVENTORY_ORDERING_OPTIONS,
  { value: "-quantity", label: "Quantity (high to low)" },
  { value: "quantity", label: "Quantity (low to high)" },
];

export type StockSheetFilters = {
  locationUuid: string;
  clinicUuid: string;
  activeStatus: InventoryActiveFilter;
  hasBatch: InventoryTriStateFilter;
  ordering: string;
};

export type ProductSheetFilters = {
  activeStatus: InventoryActiveFilter;
  ordering: string;
};

export type PurchaseOrderSheetFilters = {
  status: string;
  receivingLocationId: string;
  activeStatus: InventoryActiveFilter;
  ordering: string;
};

export type InternalOrderSheetFilters = {
  status: string;
  sourceLocationUuid: string;
  destinationLocationUuid: string;
  ordering: string;
};

export type StockAdjustmentSheetFilters = {
  status: string;
  adjustmentType: string;
  locationUuid: string;
  ordering: string;
};

export type MovementSheetFilters = {
  movementType: string;
  fromLocationUuid: string;
  toLocationUuid: string;
  ordering: string;
};

export type BatchSheetFilters = {
  activeStatus: InventoryActiveFilter;
  hasExpiryDate: InventoryTriStateFilter;
  ordering: string;
};

export const DEFAULT_STOCK_SHEET_FILTERS: StockSheetFilters = {
  locationUuid: "all",
  clinicUuid: "all",
  activeStatus: "all",
  hasBatch: "all",
  ordering: DEFAULT_INVENTORY_ORDERING,
};

export const DEFAULT_PRODUCT_SHEET_FILTERS: ProductSheetFilters = {
  activeStatus: "active",
  ordering: DEFAULT_INVENTORY_ORDERING,
};

export const DEFAULT_PURCHASE_ORDER_SHEET_FILTERS: PurchaseOrderSheetFilters = {
  status: "all",
  receivingLocationId: "all",
  activeStatus: "all",
  ordering: DEFAULT_INVENTORY_ORDERING,
};

export const DEFAULT_INTERNAL_ORDER_SHEET_FILTERS: InternalOrderSheetFilters = {
  status: "all",
  sourceLocationUuid: "all",
  destinationLocationUuid: "all",
  ordering: DEFAULT_INVENTORY_ORDERING,
};

export const DEFAULT_STOCK_ADJUSTMENT_SHEET_FILTERS: StockAdjustmentSheetFilters = {
  status: "all",
  adjustmentType: "all",
  locationUuid: "all",
  ordering: DEFAULT_INVENTORY_ORDERING,
};

export const DEFAULT_MOVEMENT_SHEET_FILTERS: MovementSheetFilters = {
  movementType: "all",
  fromLocationUuid: "all",
  toLocationUuid: "all",
  ordering: DEFAULT_INVENTORY_ORDERING,
};

export const DEFAULT_BATCH_SHEET_FILTERS: BatchSheetFilters = {
  activeStatus: "all",
  hasExpiryDate: "all",
  ordering: DEFAULT_INVENTORY_ORDERING,
};

function triStateToBoolean(
  value: InventoryTriStateFilter,
): boolean | undefined {
  if (value === "all") {
    return undefined;
  }
  return value === "yes";
}

function activeFilterToBoolean(
  value: InventoryActiveFilter,
): boolean | undefined {
  if (value === "all") {
    return undefined;
  }
  return value === "active";
}

function optionalUuid(value: string): string | undefined {
  return value === "all" ? undefined : value;
}

function optionalNumericId(value: string): number | undefined {
  if (value === "all") {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function optionalChoice(value: string): string | undefined {
  return value === "all" ? undefined : value;
}

function countOrderingFilter(ordering: string): number {
  return ordering !== DEFAULT_INVENTORY_ORDERING ? 1 : 0;
}

export function countActiveStockFilters(filters: StockSheetFilters): number {
  let count = 0;
  if (filters.locationUuid !== "all") count += 1;
  if (filters.clinicUuid !== "all") count += 1;
  if (filters.activeStatus !== "all") count += 1;
  if (filters.hasBatch !== "all") count += 1;
  count += countOrderingFilter(filters.ordering);
  return count;
}

export function countActiveProductFilters(filters: ProductSheetFilters): number {
  let count = 0;
  if (filters.activeStatus !== "active") count += 1;
  count += countOrderingFilter(filters.ordering);
  return count;
}

export function countActivePurchaseOrderFilters(
  filters: PurchaseOrderSheetFilters,
): number {
  let count = 0;
  if (filters.status !== "all") count += 1;
  if (filters.receivingLocationId !== "all") count += 1;
  if (filters.activeStatus !== "all") count += 1;
  count += countOrderingFilter(filters.ordering);
  return count;
}

export function countActiveInternalOrderFilters(
  filters: InternalOrderSheetFilters,
): number {
  let count = 0;
  if (filters.status !== "all") count += 1;
  if (filters.sourceLocationUuid !== "all") count += 1;
  if (filters.destinationLocationUuid !== "all") count += 1;
  count += countOrderingFilter(filters.ordering);
  return count;
}

export function countActiveStockAdjustmentFilters(
  filters: StockAdjustmentSheetFilters,
): number {
  let count = 0;
  if (filters.status !== "all") count += 1;
  if (filters.adjustmentType !== "all") count += 1;
  if (filters.locationUuid !== "all") count += 1;
  count += countOrderingFilter(filters.ordering);
  return count;
}

export function countActiveMovementFilters(filters: MovementSheetFilters): number {
  let count = 0;
  if (filters.movementType !== "all") count += 1;
  if (filters.fromLocationUuid !== "all") count += 1;
  if (filters.toLocationUuid !== "all") count += 1;
  count += countOrderingFilter(filters.ordering);
  return count;
}

export function countActiveBatchFilters(filters: BatchSheetFilters): number {
  let count = 0;
  if (filters.activeStatus !== "all") count += 1;
  if (filters.hasExpiryDate !== "all") count += 1;
  count += countOrderingFilter(filters.ordering);
  return count;
}

export function buildStockListFilters(
  sheetFilters: StockSheetFilters,
): Omit<InventoryListFilters, "page" | "pageSize" | "search"> {
  return {
    location_uuid: optionalUuid(sheetFilters.locationUuid),
    clinic_uuid: optionalUuid(sheetFilters.clinicUuid),
    is_active: activeFilterToBoolean(sheetFilters.activeStatus),
    has_batch: triStateToBoolean(sheetFilters.hasBatch),
    ordering: sheetFilters.ordering,
  };
}

export function buildProductListFilters(
  sheetFilters: ProductSheetFilters,
): Omit<InventoryListFilters, "page" | "pageSize" | "search"> {
  return {
    is_active: activeFilterToBoolean(sheetFilters.activeStatus),
    ordering: sheetFilters.ordering,
  };
}

export function buildPurchaseOrderListFilters(
  sheetFilters: PurchaseOrderSheetFilters,
): Omit<InventoryListFilters, "page" | "pageSize" | "search"> {
  return {
    status: optionalChoice(sheetFilters.status),
    receiving_location: optionalNumericId(sheetFilters.receivingLocationId),
    is_active: activeFilterToBoolean(sheetFilters.activeStatus),
    ordering: sheetFilters.ordering,
  };
}

export function buildInternalOrderListFilters(
  sheetFilters: InternalOrderSheetFilters,
): Omit<InventoryListFilters, "page" | "pageSize" | "search"> {
  return {
    status: optionalChoice(sheetFilters.status),
    source_location_uuid: optionalUuid(sheetFilters.sourceLocationUuid),
    destination_location_uuid: optionalUuid(sheetFilters.destinationLocationUuid),
    ordering: sheetFilters.ordering,
  };
}

export function buildStockAdjustmentListFilters(
  sheetFilters: StockAdjustmentSheetFilters,
): Omit<InventoryListFilters, "page" | "pageSize" | "search"> {
  return {
    status: optionalChoice(sheetFilters.status),
    adjustment_type: optionalChoice(sheetFilters.adjustmentType),
    location_uuid: optionalUuid(sheetFilters.locationUuid),
    ordering: sheetFilters.ordering,
  };
}

export function buildMovementListFilters(
  sheetFilters: MovementSheetFilters,
): Omit<InventoryListFilters, "page" | "pageSize" | "search"> {
  return {
    movement_type: optionalChoice(sheetFilters.movementType),
    from_location_uuid: optionalUuid(sheetFilters.fromLocationUuid),
    to_location_uuid: optionalUuid(sheetFilters.toLocationUuid),
    ordering: sheetFilters.ordering,
  };
}

export function buildBatchListFilters(
  sheetFilters: BatchSheetFilters,
): Omit<InventoryListFilters, "page" | "pageSize" | "search"> {
  return {
    is_active: activeFilterToBoolean(sheetFilters.activeStatus),
    has_expiry_date: triStateToBoolean(sheetFilters.hasExpiryDate),
    ordering: sheetFilters.ordering,
  };
}

export const PURCHASE_STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "DRAFT", label: "Draft" },
  { value: "SUBMITTED", label: "Submitted" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "CANCELLED", label: "Cancelled" },
] as const;

export const INTERNAL_ORDER_STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "DRAFT", label: "Draft" },
  { value: "SUBMITTED", label: "Submitted" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
  { value: "DISPATCHED", label: "Dispatched" },
  { value: "RECEIVED", label: "Received" },
  { value: "CANCELLED", label: "Cancelled" },
] as const;

export const STOCK_ADJUSTMENT_STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "DRAFT", label: "Draft" },
  { value: "SUBMITTED", label: "Submitted" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
  { value: "APPLIED", label: "Applied" },
  { value: "CANCELLED", label: "Cancelled" },
] as const;

export const ADJUSTMENT_TYPE_OPTIONS = [
  { value: "all", label: "All types" },
  { value: "QUANTITY", label: "Quantity" },
  { value: "COST", label: "Cost" },
] as const;

export const MOVEMENT_TYPE_OPTIONS = [
  { value: "all", label: "All types" },
  { value: "PURCHASE_RECEIPT", label: "Purchase receipt" },
  { value: "INTERNAL_ORDER_OUT", label: "Internal order out" },
  { value: "INTERNAL_ORDER_IN", label: "Internal order in" },
  { value: "ADJUSTMENT_QTY", label: "Quantity adjustment" },
  { value: "ADJUSTMENT_COST", label: "Cost adjustment" },
  { value: "RETURN_TO_VENDOR", label: "Return to vendor" },
] as const;

export const ACTIVE_STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Active only" },
  { value: "inactive", label: "Inactive only" },
] as const;

export const TRI_STATE_OPTIONS = [
  { value: "all", label: "All" },
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
] as const;
