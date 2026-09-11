import { describe, expect, it } from "vitest";

import { ROUTES } from "@/constants/routes";
import { DEFAULT_CUSTOMER_ORDERING } from "@/features/customers/utils/customer-list-filters";
import {
  customersHref,
  filtersFromCustomerSearchParams,
  parseCustomerGender,
  parseCustomerOrdering,
  parseCustomerStatus,
  parseListPage,
} from "@/features/customers/utils/customer-list-url";

describe("customer list URL", () => {
  it("defaults page, gender, status, and ordering", () => {
    expect(parseListPage("0")).toBe(1);
    expect(parseListPage("3")).toBe(3);
    expect(parseCustomerGender("Female")).toBe("Female");
    expect(parseCustomerGender("unknown")).toBe("all");
    expect(parseCustomerStatus("inactive")).toBe("inactive");
    expect(parseCustomerStatus("maybe")).toBe("all");
    expect(parseCustomerOrdering("-first_name")).toBe("-first_name");
    expect(parseCustomerOrdering("nope")).toBe(DEFAULT_CUSTOMER_ORDERING);
  });

  it("builds compact hrefs and reads filters from search params", () => {
    expect(customersHref()).toBe(ROUTES.customers);
    expect(
      customersHref({
        search: "Ada",
        page: 2,
        newClient: true,
        gender: "Female",
        activeStatus: "active",
        ordering: "first_name",
      }),
    ).toBe(
      `${ROUTES.customers}?q=Ada&page=2&new=1&gender=Female&status=active&order=first_name`,
    );

    expect(
      filtersFromCustomerSearchParams(
        new URLSearchParams("gender=Male&status=inactive&order=last_name"),
      ),
    ).toEqual({
      gender: "Male",
      activeStatus: "inactive",
      ordering: "last_name",
      tags: [],
    });
  });
});
