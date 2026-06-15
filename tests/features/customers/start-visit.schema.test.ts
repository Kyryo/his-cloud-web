import { describe, expect, it } from "vitest";

import {
  startVisitSchema,
  toCreateVisitPayload,
} from "@/features/customers/schemas/start-visit.schema";

describe("startVisitSchema", () => {
  it("requires insurance scheme when payment mode is insurance", () => {
    const result = startVisitSchema.safeParse({
      consultation_service: "service-uuid",
      clinic: "clinic-uuid",
      department: "department-uuid",
      visit_date: "2026-06-05T10:00",
      mode_of_payment: "insurance",
      requires_pre_authorization: false,
      pre_authorization_number: "",
      pre_authorization_comments: "",
    });

    expect(result.success).toBe(false);
  });

  it("maps form values to create visit payload", () => {
    const payload = toCreateVisitPayload("customer-uuid", {
      consultation_service: "service-uuid",
      clinic: "clinic-uuid",
      department: "department-uuid",
      visit_date: "2026-06-05T10:00",
      mode_of_payment: "insurance",
      insurance_scheme: "insurance-uuid",
      requires_pre_authorization: true,
      pre_authorization_number: "AUTH123",
      pre_authorization_comments: "Approved",
    });

    expect(payload.customer).toBe("customer-uuid");
    expect(payload.consultation_service).toBe("service-uuid");
    expect(payload.insurance_scheme).toBe("insurance-uuid");
    expect(payload.pre_authorization_number).toBe("AUTH123");
    expect(payload.visit_date).toContain("2026");
    expect("location" in payload).toBe(false);
  });
});
