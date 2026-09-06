import { describe, expect, it, vi } from "vitest";

import {
  changeVisitEncounterBillingMode,
  createVisitEncounter,
  fetchVisits,
  updateVisitPaymentMode,
} from "@/features/visits/services/visits.service";
import { bffRequest } from "@/lib/bff-client";

vi.mock("@/lib/bff-client", () => ({
  bffRequest: vi.fn(),
}));

describe("visits.service", () => {
  it("creates encounters with billing_mode via BFF", async () => {
    vi.mocked(bffRequest).mockResolvedValue({
      uuid: "enc-uuid",
      billing_mode: "separate_department",
    });

    await createVisitEncounter("visit-uuid", {
      department: "dept-uuid",
      billing_mode: "separate_department",
    });

    expect(bffRequest).toHaveBeenCalledWith("/api/visits/visit-uuid/encounters", {
      method: "POST",
      body: {
        department: "dept-uuid",
        billing_mode: "separate_department",
      },
    });
  });

  it("changes encounter billing mode via BFF", async () => {
    vi.mocked(bffRequest).mockResolvedValue({
      uuid: "enc-uuid",
      billing_mode: "shared_visit",
    });

    await changeVisitEncounterBillingMode("visit-uuid", "enc-uuid", {
      billing_mode: "shared_visit",
    });

    expect(bffRequest).toHaveBeenCalledWith(
      "/api/visits/visit-uuid/encounters/enc-uuid/billing-mode",
      {
        method: "POST",
        body: { billing_mode: "shared_visit" },
      },
    );
  });

  it("updates visit payment mode via BFF route", async () => {
    vi.mocked(bffRequest).mockResolvedValue({
      uuid: "visit-uuid",
      mode_of_payment: "insurance",
    });

    await updateVisitPaymentMode("visit-uuid", {
      mode_of_payment: "insurance",
      insurance_scheme: "00000000-0000-0000-0000-000000000001",
    });

    expect(bffRequest).toHaveBeenCalledWith(
      "/api/visits/visit-uuid/mode-of-payment",
      {
        method: "PATCH",
        body: {
          mode_of_payment: "insurance",
          insurance_scheme: "00000000-0000-0000-0000-000000000001",
        },
      },
    );
  });

  it("forwards clinicUuid as clinic_uuid on the visits list query", async () => {
    vi.mocked(bffRequest).mockResolvedValue({
      results: [],
      pagination: null,
    });

    await fetchVisits({
      page: 1,
      clinicUuid: "clinic-uuid",
      status: "active",
      isActive: true,
    });

    expect(bffRequest).toHaveBeenCalledWith(
      "/api/visits?page=1&status=active&is_active=true&clinic_uuid=clinic-uuid",
    );
  });
});
