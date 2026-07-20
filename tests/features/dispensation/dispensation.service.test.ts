import { beforeEach, describe, expect, it, vi } from "vitest";

import { BFF_DISPENSATION_ROUTES } from "@/constants/api";
import {
  createDispensation,
  createDispensationsBatch,
} from "@/features/dispensation/services/dispensation.service";
import { bffRequest } from "@/lib/bff-client";

vi.mock("@/lib/bff-client", () => ({
  bffRequest: vi.fn(),
}));

describe("dispensation.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a single dispensation via the BFF", async () => {
    vi.mocked(bffRequest).mockResolvedValue({ id: 81, quantity: "2.0000" });

    await createDispensation({
      sales_order_line: 3,
      location: 5,
      quantity: "2.0000",
    });

    expect(bffRequest).toHaveBeenCalledWith(BFF_DISPENSATION_ROUTES.list, {
      method: "POST",
      body: {
        sales_order_line: 3,
        location: 5,
        quantity: "2.0000",
      },
    });
  });

  it("creates a batch dispensation via the BFF", async () => {
    vi.mocked(bffRequest).mockResolvedValue({ count: 2, results: [] });

    await createDispensationsBatch({
      location: 5,
      items: [
        { sales_order_line: 3, quantity: "2.0000" },
        { sales_order_line: 4, quantity: "1.0000" },
      ],
    });

    expect(bffRequest).toHaveBeenCalledWith(BFF_DISPENSATION_ROUTES.batch, {
      method: "POST",
      body: {
        location: 5,
        items: [
          { sales_order_line: 3, quantity: "2.0000" },
          { sales_order_line: 4, quantity: "1.0000" },
        ],
      },
    });
  });
});
