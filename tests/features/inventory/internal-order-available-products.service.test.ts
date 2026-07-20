import { beforeEach, describe, expect, it, vi } from "vitest";

import { BFF_INVENTORY_ROUTES } from "@/constants/api";

const bffRequest = vi.fn();

vi.mock("@/lib/bff-client", () => ({
  bffRequest: (...args: unknown[]) => bffRequest(...args),
}));

describe("searchInternalOrderAvailableProducts", () => {
  beforeEach(() => {
    bffRequest.mockReset();
  });

  it("searches within the order source-location endpoint", async () => {
    bffRequest.mockResolvedValueOnce([]);
    const { searchInternalOrderAvailableProducts } = await import(
      "@/features/inventory/services/internal-orders.service"
    );

    await searchInternalOrderAvailableProducts("order-1", "gloves");

    expect(bffRequest).toHaveBeenCalledWith(
      `${BFF_INVENTORY_ROUTES.internalOrders.availableProducts("order-1")}?q=gloves`,
    );
  });
});
