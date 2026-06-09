import { describe, expect, it } from "vitest";

import { ROUTES } from "@/constants/routes";
import {
  applyPageLabelToCrumbs,
  buildAppBreadcrumbs,
} from "@/features/app-shell/utils/build-app-breadcrumbs";

describe("buildAppBreadcrumbs", () => {
  it("returns front desk and clients for the customers list", () => {
    expect(buildAppBreadcrumbs(ROUTES.customers)).toEqual([
      { label: "Front Desk" },
      { label: "Clients" },
    ]);
  });

  it("returns front desk, clients link, and detail label for a customer page", () => {
    expect(buildAppBreadcrumbs("/customers/abc-123")).toEqual([
      { label: "Front Desk" },
      { label: "Clients", href: ROUTES.customers },
      { label: "Client details" },
    ]);
  });

  it("returns billing and sales orders for the sales orders list", () => {
    expect(buildAppBreadcrumbs(ROUTES.salesOrders)).toEqual([
      { label: "Billing" },
      { label: "Sales Orders" },
    ]);
  });

  it("returns billing, sales orders link, and detail label for an order page", () => {
    expect(buildAppBreadcrumbs("/sales-orders/81")).toEqual([
      { label: "Billing" },
      { label: "Sales Orders", href: ROUTES.salesOrders },
      { label: "Order details" },
    ]);
  });
});

describe("applyPageLabelToCrumbs", () => {
  it("replaces the last crumb label when a page label is provided", () => {
    const crumbs = buildAppBreadcrumbs("/customers/abc-123");

    expect(applyPageLabelToCrumbs(crumbs, "Jane Doe")).toEqual([
      { label: "Front Desk" },
      { label: "Clients", href: ROUTES.customers },
      { label: "Jane Doe" },
    ]);
  });

  it("returns the original crumbs when page label is empty", () => {
    const crumbs = buildAppBreadcrumbs("/customers/abc-123");

    expect(applyPageLabelToCrumbs(crumbs, null)).toEqual(crumbs);
    expect(applyPageLabelToCrumbs(crumbs, "   ")).toEqual(crumbs);
  });
});
