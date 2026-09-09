import { describe, expect, it } from "vitest";

import { ROUTES } from "@/constants/routes";
import {
  filterCommandPaletteItems,
  mergeCommandPaletteGroups,
} from "@/features/app-shell/utils/build-command-palette-items";
import {
  canSearchCommandPaletteBilling,
  canSearchCommandPaletteClients,
  mapCustomersToCommandPaletteItems,
  mapInvoicesToCommandPaletteItems,
  mapSalesOrdersToCommandPaletteItems,
} from "@/features/app-shell/utils/command-palette-records";

describe("command palette record mapping", () => {
  it("maps clients, sales orders, and invoices into grouped palette items", () => {
    expect(
      mapCustomersToCommandPaletteItems([
        {
          uuid: "cust-1",
          first_name: "Ada",
          middle_name: null,
          last_name: "Lovelace",
          full_name: "Ada Lovelace",
          customer_identifier: "CL-001",
        },
      ]),
    ).toEqual([
      {
        href: ROUTES.customerDetail("cust-1"),
        title: "Ada Lovelace",
        subtitle: "CL-001",
        group: "Clients",
        icon: "user",
      },
    ]);

    expect(
      mapSalesOrdersToCommandPaletteItems([
        {
          uuid: "so-1",
          name: "SO001",
          customer_name: "Ada Lovelace",
        },
      ]),
    ).toEqual([
      {
        href: ROUTES.salesOrderDetail("so-1"),
        title: "SO001",
        subtitle: "Ada Lovelace",
        group: "Sales orders",
        icon: "file",
      },
    ]);

    expect(
      mapInvoicesToCommandPaletteItems([
        {
          uuid: "inv-1",
          name: "INV/2026/0001",
          customer_name: "Ada Lovelace",
        },
      ]),
    ).toEqual([
      {
        href: ROUTES.invoiceDetail("inv-1"),
        title: "INV/2026/0001",
        subtitle: "Ada Lovelace",
        group: "Invoices",
        icon: "invoice",
      },
    ]);
  });

  it("keeps record groups above matching pages", () => {
    const groups = mergeCommandPaletteGroups(
      [
        {
          href: ROUTES.invoiceDetail("inv-1"),
          title: "INV/2026/0001",
          group: "Invoices",
        },
        {
          href: ROUTES.customerDetail("cust-1"),
          title: "Ada Lovelace",
          group: "Clients",
        },
      ],
      [
        {
          href: ROUTES.customers,
          title: "Clients",
          group: "Registration",
        },
      ],
    );

    expect(groups.map((group) => group.group)).toEqual([
      "Clients",
      "Invoices",
      "Registration",
    ]);
  });

  it("filters pages by title without dropping grouped records", () => {
    expect(
      filterCommandPaletteItems(
        [
          { href: ROUTES.customers, title: "Clients", group: "Registration" },
          { href: ROUTES.overview, title: "Overview", group: "Pages" },
        ],
        "cli",
      ),
    ).toEqual([
      { href: ROUTES.customers, title: "Clients", group: "Registration" },
    ]);
  });

  it("gates client and billing search by group and admin role", () => {
    expect(canSearchCommandPaletteClients(["Registration"])).toBe(true);
    expect(canSearchCommandPaletteBilling(["Registration"])).toBe(false);
    expect(canSearchCommandPaletteBilling(["Billing"])).toBe(true);
    expect(
      canSearchCommandPaletteBilling([], { isTenantAdmin: true }),
    ).toBe(true);
    expect(
      canSearchCommandPaletteClients(["Registration"], {
        isPlatformAdmin: true,
      }),
    ).toBe(false);
  });
});
