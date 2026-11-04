import { describe, expect, it } from "vitest";

import { ROUTES } from "@/constants/routes";
import { DEFAULT_CUSTOMER_ORDERING } from "@/features/customers/utils/customer-list-filters";
import {
  filtersFromOhEmployeeSearchParams,
  ohEmployeesHref,
  parseCustomerGender,
  parseCustomerOrdering,
  parseCustomerStatus,
  parseListPage,
} from "@/features/occupational-health/utils/oh-employee-list-url";

describe("OH employee list URL", () => {
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
    expect(ohEmployeesHref()).toBe(ROUTES.occupationalHealthEmployees);
    expect(
      ohEmployeesHref({
        search: "Ada",
        page: 2,
        gender: "Female",
        activeStatus: "active",
        ordering: "first_name",
      }),
    ).toBe(
      `${ROUTES.occupationalHealthEmployees}?q=Ada&page=2&gender=Female&status=active&order=first_name`,
    );

    expect(
      filtersFromOhEmployeeSearchParams(
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
