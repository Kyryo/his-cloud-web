import { describe, expect, it } from "vitest";

import { ACTIONS } from "@/constants/copy";
import { ROUTES } from "@/constants/routes";
import { buildCommandPaletteActions } from "@/features/app-shell/utils/build-command-palette-actions";

describe("buildCommandPaletteActions", () => {
  it("returns create actions the user can start", () => {
    expect(
      buildCommandPaletteActions({
        canCreateClients: true,
        canCreateAppointments: true,
        canCreateOrders: false,
      }),
    ).toEqual([
      expect.objectContaining({
        title: ACTIONS.newClient,
        href: `${ROUTES.customers}?new=1`,
      }),
      expect.objectContaining({
        title: ACTIONS.newAppointment,
        href: `${ROUTES.appointments}?new=1`,
      }),
    ]);
  });

  it("includes a sales order action for billing users", () => {
    expect(
      buildCommandPaletteActions({
        canCreateClients: false,
        canCreateAppointments: false,
        canCreateOrders: true,
      }),
    ).toEqual([
      expect.objectContaining({
        title: ACTIONS.newSalesOrder,
        href: `${ROUTES.salesOrders}?new=1`,
      }),
    ]);
  });
});
