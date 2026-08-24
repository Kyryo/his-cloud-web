import { beforeEach, describe, expect, it, vi } from "vitest";

import { handleInventoryDelete } from "@/lib/server/inventory-bff-handlers";

const hmisApiRequestMock = vi.hoisted(() => vi.fn());
const requireTenantAdminMock = vi.hoisted(() => vi.fn());
const requireAccessTokenMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/server/hmis-api", () => ({
  hmisApiRequest: hmisApiRequestMock,
  hmisApiRequestWithMeta: vi.fn(),
}));

vi.mock("@/lib/server/require-tenant-admin", () => ({
  requireTenantAdmin: requireTenantAdminMock,
}));

vi.mock("@/lib/server/require-access-token", () => ({
  requireAccessToken: requireAccessTokenMock,
}));

describe("handleInventoryDelete", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireTenantAdminMock.mockResolvedValue({ accessToken: "token" });
    requireAccessTokenMock.mockResolvedValue({ accessToken: "token" });
  });

  it("forwards a JSON delete payload such as pricelist removal", async () => {
    hmisApiRequestMock.mockResolvedValue({
      approval_required: false,
      change: { uuid: "change-1", action: "REMOVE" },
    });

    const response = await handleInventoryDelete(
      "/pricelists/pl-1/products/p-1/",
      "admin",
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      approval_required: false,
      change: { uuid: "change-1", action: "REMOVE" },
    });
  });

  it("returns 204 when the upstream delete has no body", async () => {
    hmisApiRequestMock.mockResolvedValue(undefined);

    const response = await handleInventoryDelete("/inventory/batches/1/");

    expect(response.status).toBe(204);
  });
});
