import { describe, expect, it } from "vitest";

import {
  buildCustomerListFilters,
  countActiveCustomerFilters,
  DEFAULT_CUSTOMER_ORDERING,
} from "@/features/customers/utils/customer-list-filters";

describe("customer list filters", () => {
  it("maps UI filter state to API query filters", () => {
    expect(
      buildCustomerListFilters({
        search: " Ada ",
        page: 2,
        pageSize: 20,
        gender: "Female",
        syncStatus: "synced",
        activeStatus: "active",
        ordering: "-created_at",
      }),
    ).toEqual({
      search: "Ada",
      page: 2,
      pageSize: 20,
      gender: "Female",
      hasSyncedToOdoo: true,
      isActive: true,
      ordering: "-created_at",
    });
  });

  it("counts non-default filters", () => {
    expect(
      countActiveCustomerFilters({
        gender: "all",
        syncStatus: "all",
        activeStatus: "all",
        ordering: DEFAULT_CUSTOMER_ORDERING,
      }),
    ).toBe(0);

    expect(
      countActiveCustomerFilters({
        gender: "Male",
        syncStatus: "not_synced",
        activeStatus: "inactive",
        ordering: "first_name",
      }),
    ).toBe(4);
  });
});
