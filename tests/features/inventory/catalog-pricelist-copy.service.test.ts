import { beforeEach, describe, expect, it, vi } from "vitest";

import { BFF_INVENTORY_ROUTES } from "@/constants/api";
import {
  fetchCatalogPricelistCopyJob,
  fetchCatalogPricelistCopyJobItems,
  startCatalogPricelistCopy,
} from "@/features/catalog/services/catalog.service";
import { bffRequest } from "@/lib/bff-client";

vi.mock("@/lib/bff-client", () => ({
  bffRequest: vi.fn(),
}));

const TARGET_UUID = "22222222-2222-2222-2222-222222222222";
const SOURCE_UUID = "33333333-3333-3333-3333-333333333333";
const JOB_UUID = "44444444-4444-4444-4444-444444444444";

describe("catalog pricelist copy service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("starts a copy job via the BFF", async () => {
    vi.mocked(bffRequest).mockResolvedValue({
      uuid: JOB_UUID,
      status: "queued",
      total_items: 2,
      succeeded_items: 0,
      failed_items: 0,
    });

    await startCatalogPricelistCopy(TARGET_UUID, {
      source_pricelist_uuid: SOURCE_UUID,
    });

    expect(bffRequest).toHaveBeenCalledWith(
      BFF_INVENTORY_ROUTES.pricelists.copyProducts(TARGET_UUID),
      {
        method: "POST",
        body: { source_pricelist_uuid: SOURCE_UUID },
      },
    );
  });

  it("fetches copy job status via the BFF", async () => {
    vi.mocked(bffRequest).mockResolvedValue({
      uuid: JOB_UUID,
      status: "running",
    });

    await fetchCatalogPricelistCopyJob(TARGET_UUID, JOB_UUID);

    expect(bffRequest).toHaveBeenCalledWith(
      BFF_INVENTORY_ROUTES.pricelists.copyProductsJob(TARGET_UUID, JOB_UUID),
    );
  });

  it("fetches failed copy job items via the BFF", async () => {
    vi.mocked(bffRequest).mockResolvedValue({
      results: [],
      pagination: { count: 0, next: null, previous: null },
    });

    await fetchCatalogPricelistCopyJobItems(TARGET_UUID, JOB_UUID, {
      status: "failed",
      pageSize: 200,
    });

    expect(bffRequest).toHaveBeenCalledWith(
      `${BFF_INVENTORY_ROUTES.pricelists.copyProductsJobItems(TARGET_UUID, JOB_UUID)}?page_size=200&status=failed`,
    );
  });
});
