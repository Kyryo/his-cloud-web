import { describe, expect, it } from "vitest";

import type { CustomerVisit } from "@/features/customers/types/customer-visit.types";
import { formatVisitStartedBy } from "@/features/customers/utils/format-visit-started-by";

function createVisit(
  overrides: Partial<CustomerVisit> = {},
): CustomerVisit {
  return {
    id: 1,
    uuid: "visit-1",
    visit_type: "type-1",
    visit_type_name: "Outpatient",
    is_dentist_visit: false,
    customer: "customer-1",
    customer_name: "Ada Lovelace",
    customer_identifier: "P-001",
    visit_date: "2024-01-01T10:00:00Z",
    status: "active",
    mode_of_payment: "cash",
    insurance_scheme: null,
    requires_pre_authorization: false,
    pre_authorization_number: "",
    pre_authorization_comments: "",
    is_active: true,
    clinic: "clinic-uuid-a",
    clinic_name: "Main Clinic",
    created_by: 1,
    created_by_name: null,
    created_at: "2024-01-01T10:00:00Z",
    updated_at: "2024-01-01T10:00:00Z",
    ...overrides,
  };
}

describe("formatVisitStartedBy", () => {
  it("prefers the creator name when available", () => {
    expect(
      formatVisitStartedBy(
        createVisit({ created_by_name: "Dr. Ada Lovelace" }),
      ),
    ).toBe("Dr. Ada Lovelace");
  });

  it("falls back to email when the creator has no name", () => {
    expect(
      formatVisitStartedBy(
        createVisit({
          created_by_name: "",
          created_by_email: "doctor@example.com",
        }),
      ),
    ).toBe("doctor@example.com");
  });

  it("returns a dash when no creator details are available", () => {
    expect(formatVisitStartedBy(createVisit())).toBe("—");
  });
});
