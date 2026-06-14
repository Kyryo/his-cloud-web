"use client";

import { SlidersHorizontal } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { FetchErrorNotice } from "@/components/fetch-error-notice";
import { FilterSelectField } from "@/components/filter-select-field";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { fetchInventoryLocations } from "@/features/inventory/services/inventory.service";
import type { InventoryLocationOption } from "@/features/inventory/types/inventory.types";
import {
  ACTIVE_STATUS_OPTIONS,
  ADJUSTMENT_TYPE_OPTIONS,
  countActiveBatchFilters,
  countActiveInternalOrderFilters,
  countActiveMovementFilters,
  countActiveProductFilters,
  countActivePurchaseOrderFilters,
  countActiveStockAdjustmentFilters,
  countActiveStockFilters,
  DEFAULT_BATCH_SHEET_FILTERS,
  DEFAULT_INTERNAL_ORDER_SHEET_FILTERS,
  DEFAULT_MOVEMENT_SHEET_FILTERS,
  DEFAULT_PRODUCT_SHEET_FILTERS,
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
  type ProductSheetFilters,
  type PurchaseOrderSheetFilters,
  type StockAdjustmentSheetFilters,
  type StockSheetFilters,
} from "@/features/inventory/utils/inventory-list-filters";
import { fetchOrganizationClinics } from "@/features/settings/services/settings.service";
import type { OrganizationClinic } from "@/features/settings/types/settings.types";
import { getErrorMessage, logFetchError } from "@/lib/fetch-error";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";

type InventoryFilterVariant =
  | "stock"
  | "products"
  | "purchase-orders"
  | "internal-orders"
  | "stock-adjustments"
  | "movements"
  | "batches";

type InventoryFiltersSheetProps = {
  variant: InventoryFilterVariant;
  filters:
    | StockSheetFilters
    | ProductSheetFilters
    | PurchaseOrderSheetFilters
    | InternalOrderSheetFilters
    | StockAdjustmentSheetFilters
    | MovementSheetFilters
    | BatchSheetFilters;
  isLoading?: boolean;
  onApply: (filters: InventoryFiltersSheetProps["filters"]) => void;
};

const VARIANT_META: Record<
  InventoryFilterVariant,
  { title: string; description: string; testId: string }
> = {
  stock: {
    title: "Filter stock",
    description: "Narrow stock records by location, clinic, and status.",
    testId: "inventory-stock-filters-button",
  },
  products: {
    title: "Filter products",
    description: "Show active or inactive products from ERP.",
    testId: "inventory-products-filters-button",
  },
  "purchase-orders": {
    title: "Filter purchase orders",
    description: "Filter by status, receiving location, and activity.",
    testId: "inventory-purchase-orders-filters-button",
  },
  "internal-orders": {
    title: "Filter internal orders",
    description: "Filter transfers by status and source or destination.",
    testId: "inventory-internal-orders-filters-button",
  },
  "stock-adjustments": {
    title: "Filter stock adjustments",
    description: "Filter adjustments by type, status, and location.",
    testId: "inventory-stock-adjustments-filters-button",
  },
  movements: {
    title: "Filter movements",
    description: "Filter movement history by type and locations.",
    testId: "inventory-movements-filters-button",
  },
  batches: {
    title: "Filter batches",
    description: "Filter batches by activity and expiry tracking.",
    testId: "inventory-batches-filters-button",
  },
};

function countActiveFilters(
  variant: InventoryFilterVariant,
  filters: InventoryFiltersSheetProps["filters"],
): number {
  switch (variant) {
    case "stock":
      return countActiveStockFilters(filters as StockSheetFilters);
    case "products":
      return countActiveProductFilters(filters as ProductSheetFilters);
    case "purchase-orders":
      return countActivePurchaseOrderFilters(filters as PurchaseOrderSheetFilters);
    case "internal-orders":
      return countActiveInternalOrderFilters(filters as InternalOrderSheetFilters);
    case "stock-adjustments":
      return countActiveStockAdjustmentFilters(filters as StockAdjustmentSheetFilters);
    case "movements":
      return countActiveMovementFilters(filters as MovementSheetFilters);
    case "batches":
      return countActiveBatchFilters(filters as BatchSheetFilters);
    default:
      return 0;
  }
}

function getDefaultFilters(variant: InventoryFilterVariant) {
  switch (variant) {
    case "stock":
      return DEFAULT_STOCK_SHEET_FILTERS;
    case "products":
      return DEFAULT_PRODUCT_SHEET_FILTERS;
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

function buildLocationOptions(
  locations: InventoryLocationOption[],
  useNumericId = false,
) {
  return [
    { value: "all", label: "All locations" },
    ...locations.map((location) => ({
      value: useNumericId ? String(location.id) : location.uuid,
      label: `${location.name} (${location.code})`,
    })),
  ];
}

export function InventoryFiltersSheet({
  variant,
  filters,
  isLoading = false,
  onApply,
}: InventoryFiltersSheetProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(filters);
  const [locations, setLocations] = useState<InventoryLocationOption[]>([]);
  const [clinics, setClinics] = useState<OrganizationClinic[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [optionsLoadError, setOptionsLoadError] = useState<string | null>(null);

  const needsLocationOptions =
    variant === "stock" ||
    variant === "purchase-orders" ||
    variant === "internal-orders" ||
    variant === "stock-adjustments" ||
    variant === "movements";

  const loadOptions = useCallback(async () => {
    setIsLoadingOptions(true);
    setOptionsLoadError(null);

    try {
      const needsClinics = variant === "stock";
      const [locationsResponse, clinicsResponse] = await Promise.all([
        needsLocationOptions ? fetchInventoryLocations() : Promise.resolve(null),
        needsClinics ? fetchOrganizationClinics() : Promise.resolve(null),
      ]);

      setLocations(locationsResponse?.results ?? []);
      setClinics(clinicsResponse?.results ?? []);
    } catch (error) {
      logFetchError("InventoryFiltersSheet.loadOptions", error);
      setLocations([]);
      setClinics([]);
      setOptionsLoadError(
        getErrorMessage(error, "Could not load filter options."),
      );
    } finally {
      setIsLoadingOptions(false);
    }
  }, [needsLocationOptions, variant]);

  const meta = VARIANT_META[variant];
  const activeCount = useMemo(
    () => countActiveFilters(variant, filters),
    [filters, variant],
  );

  const locationOptions = useMemo(
    () =>
      buildLocationOptions(
        locations,
        variant === "purchase-orders",
      ),
    [locations, variant],
  );

  const clinicOptions = useMemo(
    () => [
      { value: "all", label: "All clinics" },
      ...clinics.map((clinic) => ({
        value: clinic.uuid,
        label: `${clinic.name} (${clinic.code})`,
      })),
    ],
    [clinics],
  );

  useEffect(() => {
    if (!open) {
      setOptionsLoadError(null);
      return;
    }

    void loadOptions();
  }, [loadOptions, open]);

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setDraft(filters);
    }
    setOpen(nextOpen);
  }

  function handleApply() {
    onApply(draft);
    setOpen(false);
  }

  function handleReset() {
    const reset = getDefaultFilters(variant);
    setDraft(reset);
    onApply(reset);
    setOpen(false);
  }

  const optionsDisabled = isLoading || isLoadingOptions;

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={isLoading}
        onClick={() => handleOpenChange(true)}
        data-testid={meta.testId}
      >
        <SlidersHorizontal className="size-4" />
        Filters
        {activeCount > 0 ? (
          <Badge variant="secondary" className="ml-1 px-1.5 py-0">
            {activeCount}
          </Badge>
        ) : null}
      </Button>

      <SheetContent
        side="right"
        className={cn("w-full text-sm sm:max-w-md", appFont.className)}
      >
        <SheetHeader>
          <SheetTitle className="text-base font-medium text-brand-navy">
            {meta.title}
          </SheetTitle>
          <SheetDescription className="text-sm text-brand-muted">
            {meta.description}
          </SheetDescription>
        </SheetHeader>

        {optionsLoadError ? (
          <FetchErrorNotice
            className="mt-4"
            message={optionsLoadError}
            onRetry={() => void loadOptions()}
          />
        ) : null}

        <div className="mt-5 space-y-3">
          {variant === "stock" ? (
            <>
              <FilterSelectField
                id="inventory-filter-stock-location"
                label="Location"
                value={(draft as StockSheetFilters).locationUuid}
                disabled={optionsDisabled}
                onValueChange={(value) =>
                  setDraft((current) => ({
                    ...(current as StockSheetFilters),
                    locationUuid: value,
                  }))
                }
                options={locationOptions}
              />
              <FilterSelectField
                id="inventory-filter-stock-clinic"
                label="Clinic"
                value={(draft as StockSheetFilters).clinicUuid}
                disabled={optionsDisabled}
                onValueChange={(value) =>
                  setDraft((current) => ({
                    ...(current as StockSheetFilters),
                    clinicUuid: value,
                  }))
                }
                options={clinicOptions}
              />
              <FilterSelectField
                id="inventory-filter-stock-active"
                label="Status"
                value={(draft as StockSheetFilters).activeStatus}
                disabled={optionsDisabled}
                onValueChange={(value) =>
                  setDraft((current) => ({
                    ...(current as StockSheetFilters),
                    activeStatus: value as StockSheetFilters["activeStatus"],
                  }))
                }
                options={ACTIVE_STATUS_OPTIONS}
              />
              <FilterSelectField
                id="inventory-filter-stock-batch"
                label="Has batch"
                value={(draft as StockSheetFilters).hasBatch}
                disabled={optionsDisabled}
                onValueChange={(value) =>
                  setDraft((current) => ({
                    ...(current as StockSheetFilters),
                    hasBatch: value as StockSheetFilters["hasBatch"],
                  }))
                }
                options={TRI_STATE_OPTIONS}
              />
              <FilterSelectField
                id="inventory-filter-stock-ordering"
                label="Sort by"
                value={(draft as StockSheetFilters).ordering}
                disabled={optionsDisabled}
                onValueChange={(value) =>
                  setDraft((current) => ({
                    ...(current as StockSheetFilters),
                    ordering: value,
                  }))
                }
                options={STOCK_ORDERING_OPTIONS}
              />
            </>
          ) : null}

          {variant === "products" ? (
            <>
              <FilterSelectField
                id="inventory-filter-products-active"
                label="Status"
                value={(draft as ProductSheetFilters).activeStatus}
                disabled={optionsDisabled}
                onValueChange={(value) =>
                  setDraft((current) => ({
                    ...(current as ProductSheetFilters),
                    activeStatus: value as ProductSheetFilters["activeStatus"],
                  }))
                }
                options={ACTIVE_STATUS_OPTIONS}
              />
              <FilterSelectField
                id="inventory-filter-products-ordering"
                label="Sort by"
                value={(draft as ProductSheetFilters).ordering}
                disabled={optionsDisabled}
                onValueChange={(value) =>
                  setDraft((current) => ({
                    ...(current as ProductSheetFilters),
                    ordering: value,
                  }))
                }
                options={INVENTORY_ORDERING_OPTIONS}
              />
            </>
          ) : null}

          {variant === "purchase-orders" ? (
            <>
              <FilterSelectField
                id="inventory-filter-po-status"
                label="Status"
                value={(draft as PurchaseOrderSheetFilters).status}
                disabled={optionsDisabled}
                onValueChange={(value) =>
                  setDraft((current) => ({
                    ...(current as PurchaseOrderSheetFilters),
                    status: value,
                  }))
                }
                options={PURCHASE_STATUS_OPTIONS}
              />
              <FilterSelectField
                id="inventory-filter-po-location"
                label="Receiving location"
                value={(draft as PurchaseOrderSheetFilters).receivingLocationId}
                disabled={optionsDisabled}
                onValueChange={(value) =>
                  setDraft((current) => ({
                    ...(current as PurchaseOrderSheetFilters),
                    receivingLocationId: value,
                  }))
                }
                options={locationOptions}
              />
              <FilterSelectField
                id="inventory-filter-po-active"
                label="Activity"
                value={(draft as PurchaseOrderSheetFilters).activeStatus}
                disabled={optionsDisabled}
                onValueChange={(value) =>
                  setDraft((current) => ({
                    ...(current as PurchaseOrderSheetFilters),
                    activeStatus: value as PurchaseOrderSheetFilters["activeStatus"],
                  }))
                }
                options={ACTIVE_STATUS_OPTIONS}
              />
              <FilterSelectField
                id="inventory-filter-po-ordering"
                label="Sort by"
                value={(draft as PurchaseOrderSheetFilters).ordering}
                disabled={optionsDisabled}
                onValueChange={(value) =>
                  setDraft((current) => ({
                    ...(current as PurchaseOrderSheetFilters),
                    ordering: value,
                  }))
                }
                options={INVENTORY_ORDERING_OPTIONS}
              />
            </>
          ) : null}

          {variant === "internal-orders" ? (
            <>
              <FilterSelectField
                id="inventory-filter-io-status"
                label="Status"
                value={(draft as InternalOrderSheetFilters).status}
                disabled={optionsDisabled}
                onValueChange={(value) =>
                  setDraft((current) => ({
                    ...(current as InternalOrderSheetFilters),
                    status: value,
                  }))
                }
                options={INTERNAL_ORDER_STATUS_OPTIONS}
              />
              <FilterSelectField
                id="inventory-filter-io-source"
                label="Source location"
                value={(draft as InternalOrderSheetFilters).sourceLocationUuid}
                disabled={optionsDisabled}
                onValueChange={(value) =>
                  setDraft((current) => ({
                    ...(current as InternalOrderSheetFilters),
                    sourceLocationUuid: value,
                  }))
                }
                options={locationOptions}
              />
              <FilterSelectField
                id="inventory-filter-io-destination"
                label="Destination location"
                value={(draft as InternalOrderSheetFilters).destinationLocationUuid}
                disabled={optionsDisabled}
                onValueChange={(value) =>
                  setDraft((current) => ({
                    ...(current as InternalOrderSheetFilters),
                    destinationLocationUuid: value,
                  }))
                }
                options={locationOptions}
              />
              <FilterSelectField
                id="inventory-filter-io-ordering"
                label="Sort by"
                value={(draft as InternalOrderSheetFilters).ordering}
                disabled={optionsDisabled}
                onValueChange={(value) =>
                  setDraft((current) => ({
                    ...(current as InternalOrderSheetFilters),
                    ordering: value,
                  }))
                }
                options={INVENTORY_ORDERING_OPTIONS}
              />
            </>
          ) : null}

          {variant === "stock-adjustments" ? (
            <>
              <FilterSelectField
                id="inventory-filter-sa-status"
                label="Status"
                value={(draft as StockAdjustmentSheetFilters).status}
                disabled={optionsDisabled}
                onValueChange={(value) =>
                  setDraft((current) => ({
                    ...(current as StockAdjustmentSheetFilters),
                    status: value,
                  }))
                }
                options={STOCK_ADJUSTMENT_STATUS_OPTIONS}
              />
              <FilterSelectField
                id="inventory-filter-sa-type"
                label="Adjustment type"
                value={(draft as StockAdjustmentSheetFilters).adjustmentType}
                disabled={optionsDisabled}
                onValueChange={(value) =>
                  setDraft((current) => ({
                    ...(current as StockAdjustmentSheetFilters),
                    adjustmentType: value,
                  }))
                }
                options={ADJUSTMENT_TYPE_OPTIONS}
              />
              <FilterSelectField
                id="inventory-filter-sa-location"
                label="Location"
                value={(draft as StockAdjustmentSheetFilters).locationUuid}
                disabled={optionsDisabled}
                onValueChange={(value) =>
                  setDraft((current) => ({
                    ...(current as StockAdjustmentSheetFilters),
                    locationUuid: value,
                  }))
                }
                options={locationOptions}
              />
              <FilterSelectField
                id="inventory-filter-sa-ordering"
                label="Sort by"
                value={(draft as StockAdjustmentSheetFilters).ordering}
                disabled={optionsDisabled}
                onValueChange={(value) =>
                  setDraft((current) => ({
                    ...(current as StockAdjustmentSheetFilters),
                    ordering: value,
                  }))
                }
                options={INVENTORY_ORDERING_OPTIONS}
              />
            </>
          ) : null}

          {variant === "movements" ? (
            <>
              <FilterSelectField
                id="inventory-filter-movement-type"
                label="Movement type"
                value={(draft as MovementSheetFilters).movementType}
                disabled={optionsDisabled}
                onValueChange={(value) =>
                  setDraft((current) => ({
                    ...(current as MovementSheetFilters),
                    movementType: value,
                  }))
                }
                options={MOVEMENT_TYPE_OPTIONS}
              />
              <FilterSelectField
                id="inventory-filter-movement-from"
                label="From location"
                value={(draft as MovementSheetFilters).fromLocationUuid}
                disabled={optionsDisabled}
                onValueChange={(value) =>
                  setDraft((current) => ({
                    ...(current as MovementSheetFilters),
                    fromLocationUuid: value,
                  }))
                }
                options={locationOptions}
              />
              <FilterSelectField
                id="inventory-filter-movement-to"
                label="To location"
                value={(draft as MovementSheetFilters).toLocationUuid}
                disabled={optionsDisabled}
                onValueChange={(value) =>
                  setDraft((current) => ({
                    ...(current as MovementSheetFilters),
                    toLocationUuid: value,
                  }))
                }
                options={locationOptions}
              />
              <FilterSelectField
                id="inventory-filter-movement-ordering"
                label="Sort by"
                value={(draft as MovementSheetFilters).ordering}
                disabled={optionsDisabled}
                onValueChange={(value) =>
                  setDraft((current) => ({
                    ...(current as MovementSheetFilters),
                    ordering: value,
                  }))
                }
                options={MOVEMENT_ORDERING_OPTIONS}
              />
            </>
          ) : null}

          {variant === "batches" ? (
            <>
              <FilterSelectField
                id="inventory-filter-batch-active"
                label="Status"
                value={(draft as BatchSheetFilters).activeStatus}
                disabled={optionsDisabled}
                onValueChange={(value) =>
                  setDraft((current) => ({
                    ...(current as BatchSheetFilters),
                    activeStatus: value as BatchSheetFilters["activeStatus"],
                  }))
                }
                options={ACTIVE_STATUS_OPTIONS}
              />
              <FilterSelectField
                id="inventory-filter-batch-expiry"
                label="Has expiry date"
                value={(draft as BatchSheetFilters).hasExpiryDate}
                disabled={optionsDisabled}
                onValueChange={(value) =>
                  setDraft((current) => ({
                    ...(current as BatchSheetFilters),
                    hasExpiryDate: value as BatchSheetFilters["hasExpiryDate"],
                  }))
                }
                options={TRI_STATE_OPTIONS}
              />
              <FilterSelectField
                id="inventory-filter-batch-ordering"
                label="Sort by"
                value={(draft as BatchSheetFilters).ordering}
                disabled={optionsDisabled}
                onValueChange={(value) =>
                  setDraft((current) => ({
                    ...(current as BatchSheetFilters),
                    ordering: value,
                  }))
                }
                options={INVENTORY_ORDERING_OPTIONS}
              />
            </>
          ) : null}
        </div>

        <SheetFooter className="mt-8 gap-2 sm:justify-between">
          <Button type="button" variant="ghost" onClick={handleReset}>
            Reset filters
          </Button>
          <Button type="button" onClick={handleApply}>
            Apply filters
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
