import { beforeEach, describe, expect, it, vi } from "vitest";

import { BFF_CUSTOMER_NOTES_ROUTES } from "@/constants/api";
import { createCustomerNote } from "@/features/customers/services/customer-notes.service";
import { bffRequest } from "@/lib/bff-client";

vi.mock("@/lib/bff-client", () => ({
  bffRequest: vi.fn(),
}));

describe("customer-notes.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a customer note via the BFF", async () => {
    const payload = {
      customer: 42,
      body: "Customer prefers SMS reminders.",
    };

    vi.mocked(bffRequest).mockResolvedValue({ uuid: "note-uuid" });

    await createCustomerNote(payload);

    expect(bffRequest).toHaveBeenCalledWith(BFF_CUSTOMER_NOTES_ROUTES.list, {
      method: "POST",
      body: payload,
    });
  });
});
