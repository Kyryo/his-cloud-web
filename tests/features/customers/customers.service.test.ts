import { beforeEach, describe, expect, it, vi } from "vitest";

import { BFF_CUSTOMERS_ROUTES } from "@/constants/api";
import {
  createCustomer,
  fetchCustomers,
  updateCustomer,
} from "@/features/customers/services/customers.service";
import { bffRequest } from "@/lib/bff-client";

vi.mock("@/lib/bff-client", () => ({
  bffRequest: vi.fn(),
}));

describe("customers.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches customers with query params via the BFF", async () => {
    vi.mocked(bffRequest).mockResolvedValue({
      results: [],
      pagination: { count: 0, next: null, previous: null },
    });

    await fetchCustomers({
      search: "Ada",
      page: 2,
      pageSize: 20,
      gender: "Female",
      hasSyncedToOdoo: true,
      isActive: true,
      ordering: "-created_at",
    });

    expect(bffRequest).toHaveBeenCalledWith(
      `${BFF_CUSTOMERS_ROUTES.list}?search=Ada&page=2&page_size=20&gender=Female&has_synced_to_odoo=true&is_active=true&ordering=-created_at`,
    );
  });

  it("creates a customer via the BFF", async () => {
    const payload = {
      first_name: "Jane",
      last_name: "Doe",
      gender: "Female" as const,
    };

    vi.mocked(bffRequest).mockResolvedValue({
      uuid: "customer-uuid",
      first_name: "Jane",
      last_name: "Doe",
    });

    await createCustomer(payload);

    expect(bffRequest).toHaveBeenCalledWith(BFF_CUSTOMERS_ROUTES.list, {
      method: "POST",
      body: payload,
    });
  });

  it("updates a customer via the BFF", async () => {
    const payload = {
      first_name: "Jane",
      last_name: "Smith",
      gender: "Female" as const,
    };

    vi.mocked(bffRequest).mockResolvedValue({
      uuid: "customer-uuid",
      first_name: "Jane",
      last_name: "Smith",
    });

    await updateCustomer("customer-uuid", payload);

    expect(bffRequest).toHaveBeenCalledWith(
      BFF_CUSTOMERS_ROUTES.detail("customer-uuid"),
      {
        method: "PATCH",
        body: payload,
      },
    );
  });
});
