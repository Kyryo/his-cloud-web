import { beforeEach, describe, expect, it, vi } from "vitest";

import { BFF_CUSTOMERS_ROUTES, BFF_TAGS_ROUTES } from "@/constants/api";
import { syncCustomerTags } from "@/features/tags/services/customer-tags.service";
import { fetchTags } from "@/features/tags/services/tags.service";
import { bffRequest } from "@/lib/bff-client";

vi.mock("@/lib/bff-client", () => ({
  bffRequest: vi.fn(),
}));

describe("tags services", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches tags with target type filter", async () => {
    vi.mocked(bffRequest).mockResolvedValue({
      results: [],
      pagination: null,
    });

    await fetchTags({
      target_type: "sales.Customer",
      is_active: true,
      pageSize: 200,
    });

    expect(bffRequest).toHaveBeenCalledWith(
      `${BFF_TAGS_ROUTES.list}?target_type=sales.Customer&is_active=true&page_size=200`,
    );
  });

  it("syncs customer tags via the BFF", async () => {
    vi.mocked(bffRequest).mockResolvedValue([]);

    await syncCustomerTags("customer-uuid", ["tag-a", "tag-b"]);

    expect(bffRequest).toHaveBeenCalledWith(
      BFF_CUSTOMERS_ROUTES.tags("customer-uuid"),
      {
        method: "PUT",
        body: { tag_uuids: ["tag-a", "tag-b"] },
      },
    );
  });
});
