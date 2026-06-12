import { describe, expect, it } from "vitest";

import { BFF_INVENTORY_ROUTES } from "@/constants/api";

describe("internal order action BFF routes", () => {
  const uuid = "54124ef3-615b-4516-b386-efd6354b666e";

  it("maps submit to a static action segment", () => {
    expect(BFF_INVENTORY_ROUTES.internalOrders.action(uuid, "submit")).toBe(
      `/api/inventory/internal-orders/${uuid}/submit`,
    );
  });

  it("maps workflow actions to static action segments", () => {
    expect(BFF_INVENTORY_ROUTES.internalOrders.action(uuid, "approve")).toBe(
      `/api/inventory/internal-orders/${uuid}/approve`,
    );
    expect(BFF_INVENTORY_ROUTES.internalOrders.action(uuid, "dispatch")).toBe(
      `/api/inventory/internal-orders/${uuid}/dispatch`,
    );
  });
});
