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

  it("returns front desk and appointments for the appointments list", () => {
    expect(buildAppBreadcrumbs(ROUTES.appointments)).toEqual([
      { label: "Front Desk" },
      { label: "Appointments" },
    ]);
  });

  it("returns front desk and active visits for the active visits list", () => {
    expect(buildAppBreadcrumbs(ROUTES.activeVisits)).toEqual([
      { label: "Front Desk" },
      { label: "Active Visits" },
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

  it("returns inventory and stock for the stock list", () => {
    expect(buildAppBreadcrumbs(ROUTES.inventoryStock)).toEqual([
      { label: "Inventory" },
      { label: "Stock" },
    ]);
  });

  it("returns inventory, stock link, and detail label for a stock detail page", () => {
    expect(buildAppBreadcrumbs("/inventory/stock/abc-123")).toEqual([
      { label: "Inventory" },
      { label: "Stock", href: ROUTES.inventoryStock },
      { label: "Details" },
    ]);
  });

  it("returns settings modules crumbs", () => {
    expect(buildAppBreadcrumbs(ROUTES.settingsModules)).toEqual([
      { label: "Settings" },
      { label: "Modules" },
    ]);
  });

  it("returns settings modules inventory crumbs", () => {
    expect(buildAppBreadcrumbs(ROUTES.settingsModuleInventory)).toEqual([
      { label: "Settings" },
      { label: "Modules", href: ROUTES.settingsModules },
      { label: "Inventory" },
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
