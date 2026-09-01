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
        activeStatus: "active",
        ordering: "-created_at",
        tags: [],
      }),
    ).toEqual({
      search: "Ada",
      page: 2,
      pageSize: 20,
      gender: "Female",
      isActive: true,
      ordering: "-created_at",
    });
  });

  it("maps tag filters to comma-separated query values", () => {
    expect(
      buildCustomerListFilters({
        search: "",
        page: 1,
        pageSize: 20,
        gender: "all",
        activeStatus: "all",
        ordering: DEFAULT_CUSTOMER_ORDERING,
        tags: ["tag-a", "tag-b"],
      }),
    ).toEqual({
      search: undefined,
      page: 1,
      pageSize: 20,
      gender: undefined,
      isActive: undefined,
      ordering: DEFAULT_CUSTOMER_ORDERING,
      tags: ["tag-a", "tag-b"],
    });
  });

  it("counts non-default filters", () => {
    expect(
      countActiveCustomerFilters({
        gender: "all",
        activeStatus: "all",
        ordering: DEFAULT_CUSTOMER_ORDERING,
        tags: [],
      }),
    ).toBe(0);

    expect(
      countActiveCustomerFilters({
        gender: "Male",
        activeStatus: "inactive",
        ordering: "first_name",
        tags: ["tag-a"],
      }),
    ).toBe(4);
  });
});
