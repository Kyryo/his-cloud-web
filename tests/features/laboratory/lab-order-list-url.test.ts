import { describe, expect, it } from "vitest";

import { ROUTES } from "@/constants/routes";
import {
  buildLabOrderListFilters,
  countActiveLabOrderFilters,
  filtersFromLabOrderSearchParams,
  labOrdersHref,
  parseLabOrderPage,
  parseLabOrderPriority,
  parseLabOrderStatus,
} from "@/features/laboratory/utils/lab-order-list-url";

describe("lab order list URL", () => {
  it("parses page, status, and priority defaults", () => {
    expect(parseLabOrderPage("0")).toBe(1);
    expect(parseLabOrderPage("4")).toBe(4);
    expect(parseLabOrderStatus("IN_LAB")).toBe("IN_LAB");
    expect(parseLabOrderStatus("nope")).toBe("all");
    expect(parseLabOrderPriority("STAT")).toBe("STAT");
    expect(parseLabOrderPriority("maybe")).toBe("all");
  });

  it("builds compact hrefs and reads filters from search params", () => {
    expect(labOrdersHref()).toBe(ROUTES.labOrders);
    expect(
      labOrdersHref({
        page: 2,
        status: "ORDERED",
        priority: "URGENT",
        accession: "A-1",
        clinic: "clinic-uuid",
        patient: "patient-uuid",
      }),
    ).toBe(
      `${ROUTES.labOrders}?page=2&status=ORDERED&priority=URGENT&clinic=clinic-uuid&patient=patient-uuid&accession=A-1`,
    );

    expect(
      filtersFromLabOrderSearchParams(
        new URLSearchParams(
          "status=PARTIAL&priority=ROUTINE&page=3&accession=ACC",
        ),
      ),
    ).toEqual({
      page: 3,
      status: "PARTIAL",
      priority: "ROUTINE",
      clinic: "",
      patient: "",
      dateFrom: "",
      dateTo: "",
      accession: "ACC",
    });
  });

  it("builds API filters and counts active filters", () => {
    expect(
      buildLabOrderListFilters({
        page: 2,
        status: "all",
        priority: "STAT",
        clinic: "  ",
        patient: "p1",
        pageSize: 20,
      }),
    ).toEqual({
      page: 2,
      pageSize: 20,
      status: "all",
      priority: "STAT",
      clinic: undefined,
      patient: "p1",
      dateFrom: undefined,
      dateTo: undefined,
      accession: undefined,
    });

    expect(
      countActiveLabOrderFilters({
        status: "ORDERED",
        priority: "all",
        clinic: "c1",
        patient: "",
      }),
    ).toBe(2);
  });
});
