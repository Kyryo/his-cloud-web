import { beforeEach, describe, expect, it, vi } from "vitest";

import { BFF_CUSTOMERS_ROUTES, BFF_VISITS_ROUTES } from "@/constants/api";
import {
  closeCustomerVisit,
  countActiveCustomerVisits,
  countCompletedCustomerVisits,
  createCustomerVisit,
  fetchCustomerVisits,
  fetchVisit,
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
      consultation_service: "service-uuid",
      customer: "customer-uuid",
      department: "department-uuid",
      clinic: "clinic-uuid",
      mode_of_payment: "cash",
    });

    expect(bffRequest).toHaveBeenCalledWith(BFF_VISITS_ROUTES.create, {
      method: "POST",
      body: {
        consultation_service: "service-uuid",
        customer: "customer-uuid",
        department: "department-uuid",
        clinic: "clinic-uuid",
        mode_of_payment: "cash",
      },
    });
  });

  it("fetches a visit by uuid", async () => {
    vi.mocked(bffRequest).mockResolvedValueOnce({ uuid: "visit-1" });

    await fetchVisit("visit-1");

    expect(bffRequest).toHaveBeenCalledWith(BFF_VISITS_ROUTES.detail("visit-1"));
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

  it("fetches consultation service catalog", async () => {
    vi.mocked(bffRequest).mockResolvedValueOnce({
      results: [{ uuid: "service-1", name: "Consultation" }],
    });

    const results = await fetchVisitTypeCatalog();

    expect(bffRequest).toHaveBeenCalledWith(
      BFF_VISITS_ROUTES.consultationServicesCatalog,
    );
    expect(results).toHaveLength(1);
  });
});
