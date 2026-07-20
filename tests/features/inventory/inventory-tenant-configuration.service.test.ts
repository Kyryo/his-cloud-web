import { beforeEach, describe, expect, it, vi } from "vitest";

import { BFF_INVENTORY_ROUTES } from "@/constants/api";

const bffRequest = vi.fn();

vi.mock("@/lib/bff-client", () => ({
  bffRequest: (...args: unknown[]) => bffRequest(...args),
}));

describe("inventory tenant configuration service", () => {
  beforeEach(() => {
    bffRequest.mockReset();
  });

  it("loads and updates the approval policy with default-off payload shape", async () => {
    const {
      fetchTenantConfiguration,
      updateTenantConfiguration,
    } = await import("@/features/inventory/services/inventory-settings.service");

    bffRequest.mockResolvedValueOnce({
      uuid: "cfg-1",
      tenant: 1,
      allow_self_approval: false,
      created_at: "2026-07-18",
      updated_at: "2026-07-18",
    });

    const loaded = await fetchTenantConfiguration();
    expect(bffRequest).toHaveBeenCalledWith(BFF_INVENTORY_ROUTES.tenantConfiguration);
    expect(loaded.allow_self_approval).toBe(false);

    bffRequest.mockResolvedValueOnce({
      uuid: "cfg-1",
      tenant: 1,
      allow_self_approval: true,
      created_at: "2026-07-18",
      updated_at: "2026-07-19",
    });

    const updated = await updateTenantConfiguration(true);
    expect(bffRequest).toHaveBeenLastCalledWith(
      BFF_INVENTORY_ROUTES.tenantConfiguration,
      {
        method: "PATCH",
        body: { allow_self_approval: true },
      },
    );
    expect(updated.allow_self_approval).toBe(true);
  });
});
