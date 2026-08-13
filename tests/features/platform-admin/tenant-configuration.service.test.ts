import { beforeEach, describe, expect, it, vi } from "vitest";

import { BFF_PLATFORM_ADMIN_ROUTES } from "@/constants/api";

const bffRequest = vi.fn();

vi.mock("@/lib/bff-client", () => ({
  bffRequest: (...args: unknown[]) => bffRequest(...args),
}));

describe("platform-admin tenant configuration service", () => {
  beforeEach(() => {
    bffRequest.mockReset();
  });

  it("patches max_clinics on tenant configuration", async () => {
    const { updatePlatformAdminTenantConfiguration } = await import(
      "@/features/platform-admin/services/platform-admin.service"
    );

    bffRequest.mockResolvedValueOnce({
      max_clinics: 3,
      currency_code: "MWK",
    });

    const updated = await updatePlatformAdminTenantConfiguration("tenant-1", {
      max_clinics: 3,
    });

    expect(bffRequest).toHaveBeenCalledWith(
      BFF_PLATFORM_ADMIN_ROUTES.tenantConfiguration("tenant-1"),
      {
        method: "PATCH",
        body: { max_clinics: 3 },
      },
    );
    expect(updated.max_clinics).toBe(3);
  });
});
