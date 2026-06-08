import { beforeEach, describe, expect, it, vi } from "vitest";

import { BFF_CUSTOMERS_ROUTES, BFF_VISITS_ROUTES } from "@/constants/api";
import {
  closeCustomerVisit,
  countActiveCustomerVisits,
  countCompletedCustomerVisits,
  createCustomerVisit,
  fetchCustomerVisits,
  findActiveCustomerVisit,
} from "@/features/customers/services/customer-visits.service";
import { fetchVisitTypeCatalog } from "@/features/customers/services/visit-types.service";
import { bffRequest } from "@/lib/bff-client";

vi.mock("@/lib/bff-client", () => ({
  bffRequest: vi.fn(),
}));

describe("customer visits services", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches customer visits with optional limit", async () => {
    vi.mocked(bffRequest).mockResolvedValueOnce([]);

    await fetchCustomerVisits("customer-uuid", { limit: 100 });

    expect(bffRequest).toHaveBeenCalledWith(
      `${BFF_CUSTOMERS_ROUTES.visits("customer-uuid")}?limit=100`,
    );
  });

  it("creates a customer visit", async () => {
    vi.mocked(bffRequest).mockResolvedValueOnce({ uuid: "visit-1" });

    await createCustomerVisit({
      visit_type: "type-uuid",
      customer: "customer-uuid",
      mode_of_payment: "cash",
    });

    expect(bffRequest).toHaveBeenCalledWith(BFF_VISITS_ROUTES.create, {
      method: "POST",
      body: {
        visit_type: "type-uuid",
        customer: "customer-uuid",
        mode_of_payment: "cash",
      },
    });
  });

  it("closes a customer visit", async () => {
    vi.mocked(bffRequest).mockResolvedValueOnce({ uuid: "visit-1" });

    await closeCustomerVisit("visit-1");

    expect(bffRequest).toHaveBeenCalledWith(BFF_VISITS_ROUTES.end("visit-1"), {
      method: "POST",
    });
  });

  it("counts active and completed visits", () => {
    const visits = [
      { status: "active" },
      { status: "completed" },
      { status: "completed" },
    ] as Array<{ status: string }>;

    expect(countActiveCustomerVisits(visits as never)).toBe(1);
    expect(countCompletedCustomerVisits(visits as never)).toBe(2);
    expect(findActiveCustomerVisit(visits as never)?.status).toBe("active");
  });

  it("fetches visit type catalog", async () => {
    vi.mocked(bffRequest).mockResolvedValueOnce({
      results: [{ uuid: "type-1", name: "Consultation" }],
    });

    const results = await fetchVisitTypeCatalog();

    expect(bffRequest).toHaveBeenCalledWith(BFF_VISITS_ROUTES.visitTypesCatalog);
    expect(results).toHaveLength(1);
  });
});
