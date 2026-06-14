import { describe, expect, it } from "vitest";

import {
  buildInternalOrderListFilters,
  buildStockListFilters,
  countActiveInternalOrderFilters,
  countActiveStockFilters,
  DEFAULT_INVENTORY_ORDERING,
  DEFAULT_STOCK_SHEET_FILTERS,
} from "@/features/inventory/utils/inventory-list-filters";

describe("inventory list filters", () => {
  it("maps stock sheet filters to API query filters", () => {
    expect(
      buildStockListFilters({
        locationUuid: "loc-uuid",
        clinicUuid: "clinic-uuid",
        activeStatus: "active",
        hasBatch: "yes",
        ordering: "-quantity_on_hand",
      }),
    ).toEqual({
      location_uuid: "loc-uuid",
      clinic_uuid: "clinic-uuid",
      is_active: true,
      has_batch: true,
      ordering: "-quantity_on_hand",
    });
  });

  it("omits default stock filter values", () => {
    expect(buildStockListFilters(DEFAULT_STOCK_SHEET_FILTERS)).toEqual({
      location_uuid: undefined,
      clinic_uuid: undefined,
      is_active: undefined,
      has_batch: undefined,
      ordering: DEFAULT_INVENTORY_ORDERING,
    });
  });

  it("maps internal order sheet filters to UUID params", () => {
    expect(
      buildInternalOrderListFilters({
        status: "APPROVED",
        sourceLocationUuid: "source-uuid",
        destinationLocationUuid: "dest-uuid",
        ordering: "created_at",
      }),
    ).toEqual({
      status: "APPROVED",
      source_location_uuid: "source-uuid",
      destination_location_uuid: "dest-uuid",
      ordering: "created_at",
    });
  });

  it("counts non-default stock filters", () => {
    expect(countActiveStockFilters(DEFAULT_STOCK_SHEET_FILTERS)).toBe(0);
    expect(
      countActiveStockFilters({
        ...DEFAULT_STOCK_SHEET_FILTERS,
        locationUuid: "loc-uuid",
        activeStatus: "inactive",
      }),
    ).toBe(2);
  });

  it("counts non-default internal order filters", () => {
    expect(countActiveInternalOrderFilters({
      status: "all",
      sourceLocationUuid: "all",
      destinationLocationUuid: "all",
      ordering: DEFAULT_INVENTORY_ORDERING,
    })).toBe(0);

    expect(
      countActiveInternalOrderFilters({
        status: "DRAFT",
        sourceLocationUuid: "source-uuid",
        destinationLocationUuid: "all",
        ordering: DEFAULT_INVENTORY_ORDERING,
      }),
    ).toBe(2);
  });
});
