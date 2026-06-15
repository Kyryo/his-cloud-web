import { describe, expect, it } from "vitest";

import { BFF_INVENTORY_ROUTES } from "@/constants/api";

describe("purchase order action BFF routes", () => {
  const uuid = "042ff0e4-a0d4-445b-9ae0-35c728145841";

  it("maps submit to a static action segment", () => {
    expect(BFF_INVENTORY_ROUTES.purchaseOrders.action(uuid, "submit")).toBe(
      `/api/inventory/purchase-orders/${uuid}/submit`,
    );
  });

  it("maps workflow actions to static action segments", () => {
    expect(BFF_INVENTORY_ROUTES.purchaseOrders.action(uuid, "approve")).toBe(
      `/api/inventory/purchase-orders/${uuid}/approve`,
    );
    expect(BFF_INVENTORY_ROUTES.purchaseOrders.action(uuid, "cancel")).toBe(
      `/api/inventory/purchase-orders/${uuid}/cancel`,
    );
  });
});
