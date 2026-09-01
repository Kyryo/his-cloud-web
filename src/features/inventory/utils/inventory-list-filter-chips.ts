import {
  ACTIVE_STATUS_OPTIONS,
  ADJUSTMENT_TYPE_OPTIONS,
  DEFAULT_BATCH_SHEET_FILTERS,
  DEFAULT_INTERNAL_ORDER_SHEET_FILTERS,
  DEFAULT_INVENTORY_ORDERING,
  DEFAULT_MOVEMENT_SHEET_FILTERS,
  DEFAULT_PURCHASE_ORDER_SHEET_FILTERS,
  DEFAULT_STOCK_ADJUSTMENT_SHEET_FILTERS,
  DEFAULT_STOCK_SHEET_FILTERS,
  INTERNAL_ORDER_STATUS_OPTIONS,
  INVENTORY_ORDERING_OPTIONS,
  MOVEMENT_ORDERING_OPTIONS,
  MOVEMENT_TYPE_OPTIONS,
  PURCHASE_STATUS_OPTIONS,
  STOCK_ADJUSTMENT_STATUS_OPTIONS,
  STOCK_ORDERING_OPTIONS,
  TRI_STATE_OPTIONS,
  type BatchSheetFilters,
  type InternalOrderSheetFilters,
  type MovementSheetFilters,
  type PurchaseOrderSheetFilters,
  type StockAdjustmentSheetFilters,
  type StockSheetFilters,
} from "@/features/inventory/utils/inventory-list-filters";

export type InventoryListSearchVariant =
  | "stock"
  | "purchase-orders"
  | "internal-orders"
  | "stock-adjustments"
  | "movements"
  | "batches";

export type InventoryListSearchFilters =
  | StockSheetFilters
  | PurchaseOrderSheetFilters
  | InternalOrderSheetFilters
  | StockAdjustmentSheetFilters
  | MovementSheetFilters
  | BatchSheetFilters;

export type InventoryFilterChipTone =
  | "slate"
  | "blue"
  | "purple"
  | "amber"
  | "emerald";

export type InventoryFilterChip = {
  key: string;
  label: string;
  tone: InventoryFilterChipTone;
  onClear: () => void;
};

function optionLabel(
  options: ReadonlyArray<{ value: string; label: string }>,
  value: string,
  fallback: string,
) {
  return options.find((option) => option.value === value)?.label ?? fallback;
}

function orderingChip(
  ordering: string,
  options: ReadonlyArray<{ value: string; label: string }>,
  onClear: () => void,
): InventoryFilterChip | null {
  if (ordering === DEFAULT_INVENTORY_ORDERING) {
    return null;
  }

  return {
    key: "ordering",
    label: `Sort: ${optionLabel(options, ordering, "Custom order")}`,
    tone: "purple",
    onClear,
  };
}

export function getDefaultFiltersForVariant(
  variant: InventoryListSearchVariant,
): InventoryListSearchFilters {
  switch (variant) {
    case "stock":
      return DEFAULT_STOCK_SHEET_FILTERS;
    case "purchase-orders":
      return DEFAULT_PURCHASE_ORDER_SHEET_FILTERS;
    case "internal-orders":
      return DEFAULT_INTERNAL_ORDER_SHEET_FILTERS;
    case "stock-adjustments":
      return DEFAULT_STOCK_ADJUSTMENT_SHEET_FILTERS;
    case "movements":
      return DEFAULT_MOVEMENT_SHEET_FILTERS;
    case "batches":
      return DEFAULT_BATCH_SHEET_FILTERS;
  }
}

export function getInventoryFilterChips(
  variant: InventoryListSearchVariant,
  filters: InventoryListSearchFilters,
  onApply: (filters: InventoryListSearchFilters) => void,
): InventoryFilterChip[] {
  const chips: InventoryFilterChip[] = [];

  switch (variant) {
    case "stock": {
      const current = filters as StockSheetFilters;
      if (current.locationUuid !== "all") {
        chips.push({
          key: "location",
          label: "Location filtered",
          tone: "blue",
          onClear: () => onApply({ ...current, locationUuid: "all" }),
        });
      }
      if (current.clinicUuid !== "all") {
        chips.push({
          key: "clinic",
          label: "Clinic filtered",
          tone: "emerald",
          onClear: () => onApply({ ...current, clinicUuid: "all" }),
        });
      }
      if (current.activeStatus !== "all") {
        chips.push({
          key: "status",
          label: `Status: ${optionLabel(ACTIVE_STATUS_OPTIONS, current.activeStatus, current.activeStatus)}`,
          tone: "slate",
          onClear: () => onApply({ ...current, activeStatus: "all" }),
        });
      }
      if (current.hasBatch !== "all") {
        chips.push({
          key: "batch",
          label: `Has batch: ${optionLabel(TRI_STATE_OPTIONS, current.hasBatch, current.hasBatch)}`,
          tone: "amber",
          onClear: () => onApply({ ...current, hasBatch: "all" }),
        });
      }
      const sortChip = orderingChip(current.ordering, STOCK_ORDERING_OPTIONS, () =>
        onApply({ ...current, ordering: DEFAULT_INVENTORY_ORDERING }),
      );
      if (sortChip) chips.push(sortChip);
      break;
    }
    case "purchase-orders": {
      const current = filters as PurchaseOrderSheetFilters;
      if (current.status !== "all") {
        chips.push({
          key: "status",
          label: `Status: ${optionLabel(PURCHASE_STATUS_OPTIONS, current.status, current.status)}`,
          tone: "slate",
          onClear: () => onApply({ ...current, status: "all" }),
        });
      }
      if (current.receivingLocationId !== "all") {
        chips.push({
          key: "receiving",
          label: "Receiving location filtered",
          tone: "blue",
          onClear: () => onApply({ ...current, receivingLocationId: "all" }),
        });
      }
      if (current.activeStatus !== "all") {
        chips.push({
          key: "active",
          label: `Activity: ${optionLabel(ACTIVE_STATUS_OPTIONS, current.activeStatus, current.activeStatus)}`,
          tone: "emerald",
          onClear: () => onApply({ ...current, activeStatus: "all" }),
        });
      }
      const sortChip = orderingChip(
        current.ordering,
        INVENTORY_ORDERING_OPTIONS,
        () => onApply({ ...current, ordering: DEFAULT_INVENTORY_ORDERING }),
      );
      if (sortChip) chips.push(sortChip);
      break;
    }
    case "internal-orders": {
      const current = filters as InternalOrderSheetFilters;
      if (current.status !== "all") {
        chips.push({
          key: "status",
          label: `Status: ${optionLabel(INTERNAL_ORDER_STATUS_OPTIONS, current.status, current.status)}`,
          tone: "slate",
          onClear: () => onApply({ ...current, status: "all" }),
        });
      }
      if (current.sourceLocationUuid !== "all") {
        chips.push({
          key: "source",
          label: "Source location filtered",
          tone: "blue",
          onClear: () => onApply({ ...current, sourceLocationUuid: "all" }),
        });
      }
      if (current.destinationLocationUuid !== "all") {
        chips.push({
          key: "destination",
          label: "Destination location filtered",
          tone: "emerald",
          onClear: () => onApply({ ...current, destinationLocationUuid: "all" }),
        });
      }
      const sortChip = orderingChip(
        current.ordering,
        INVENTORY_ORDERING_OPTIONS,
        () => onApply({ ...current, ordering: DEFAULT_INVENTORY_ORDERING }),
      );
      if (sortChip) chips.push(sortChip);
      break;
    }
    case "stock-adjustments": {
      const current = filters as StockAdjustmentSheetFilters;
      if (current.status !== "all") {
        chips.push({
          key: "status",
          label: `Status: ${optionLabel(STOCK_ADJUSTMENT_STATUS_OPTIONS, current.status, current.status)}`,
          tone: "slate",
          onClear: () => onApply({ ...current, status: "all" }),
        });
      }
      if (current.adjustmentType !== "all") {
        chips.push({
          key: "type",
          label: `Type: ${optionLabel(ADJUSTMENT_TYPE_OPTIONS, current.adjustmentType, current.adjustmentType)}`,
          tone: "amber",
          onClear: () => onApply({ ...current, adjustmentType: "all" }),
        });
      }
      if (current.locationUuid !== "all") {
        chips.push({
          key: "location",
          label: "Location filtered",
          tone: "blue",
          onClear: () => onApply({ ...current, locationUuid: "all" }),
        });
      }
      const sortChip = orderingChip(
        current.ordering,
        INVENTORY_ORDERING_OPTIONS,
        () => onApply({ ...current, ordering: DEFAULT_INVENTORY_ORDERING }),
      );
      if (sortChip) chips.push(sortChip);
      break;
    }
    case "movements": {
      const current = filters as MovementSheetFilters;
      if (current.movementType !== "all") {
        chips.push({
          key: "type",
          label: `Type: ${optionLabel(MOVEMENT_TYPE_OPTIONS, current.movementType, current.movementType)}`,
          tone: "amber",
          onClear: () => onApply({ ...current, movementType: "all" }),
        });
      }
      if (current.fromLocationUuid !== "all") {
        chips.push({
          key: "from",
          label: "From location filtered",
          tone: "blue",
          onClear: () => onApply({ ...current, fromLocationUuid: "all" }),
        });
      }
      if (current.toLocationUuid !== "all") {
        chips.push({
          key: "to",
          label: "To location filtered",
          tone: "emerald",
          onClear: () => onApply({ ...current, toLocationUuid: "all" }),
        });
      }
      const sortChip = orderingChip(
        current.ordering,
        MOVEMENT_ORDERING_OPTIONS,
        () => onApply({ ...current, ordering: DEFAULT_INVENTORY_ORDERING }),
      );
      if (sortChip) chips.push(sortChip);
      break;
    }
    case "batches": {
      const current = filters as BatchSheetFilters;
      if (current.activeStatus !== "all") {
        chips.push({
          key: "status",
          label: `Status: ${optionLabel(ACTIVE_STATUS_OPTIONS, current.activeStatus, current.activeStatus)}`,
          tone: "slate",
          onClear: () => onApply({ ...current, activeStatus: "all" }),
        });
      }
      if (current.hasExpiryDate !== "all") {
        chips.push({
          key: "expiry",
          label: `Has expiry: ${optionLabel(TRI_STATE_OPTIONS, current.hasExpiryDate, current.hasExpiryDate)}`,
          tone: "amber",
          onClear: () => onApply({ ...current, hasExpiryDate: "all" }),
        });
      }
      const sortChip = orderingChip(
        current.ordering,
        INVENTORY_ORDERING_OPTIONS,
        () => onApply({ ...current, ordering: DEFAULT_INVENTORY_ORDERING }),
      );
      if (sortChip) chips.push(sortChip);
      break;
    }
  }

  return chips;
}
