import { describe, expect, it } from "vitest";

import {
  formatVisitPaymentLabel,
  formatVisitSchemeLabel,
} from "@/features/customers/utils/format-visit-scheme";
import type { CustomerVisit } from "@/features/customers/types/customer-visit.types";

function buildVisit(
  overrides: Partial<CustomerVisit> = {},
): CustomerVisit {
  return {
    id: 1,
    uuid: "visit-1",
    appointment: null,
    consultation_service: null,
    consultation_service_name: null,
    customer: "customer-1",
    customer_name: "Jane Doe",
    customer_identifier: "P-001",
    visit_date: "2026-08-01T10:00:00.000Z",
    status: "in_progress",
    mark_for_completion: false,
    mode_of_payment: "cash",
    insurance_scheme: null,
    insurance_scheme_name: null,
    insurance_company_name: null,
    linked_sales_order_state: null,
    can_edit_mode_of_payment: true,
    mode_of_payment_edit_block_reason: null,
    requires_pre_authorization: false,
    pre_authorization_number: "",
    pre_authorization_comments: "",
    is_walk_in: false,
    is_active: true,
    clinic: "clinic-1",
    clinic_name: "Main Clinic",
    closed_by: null,
    created_by: null,
    created_by_name: null,
    encounters: [],
    created_at: "2026-08-01T10:00:00.000Z",
    updated_at: "2026-08-01T10:00:00.000Z",
    ...overrides,
  };
}

describe("formatVisitSchemeLabel", () => {
  it("formats payer and scheme for insurance visits", () => {
    expect(
      formatVisitSchemeLabel(
        buildVisit({
          mode_of_payment: "insurance",
          insurance_company_name: "MASM",
          insurance_scheme_name: "VIP",
        }),
      ),
    ).toBe("MASM - VIP");
  });

  it("returns dash for cash visits", () => {
    expect(formatVisitSchemeLabel(buildVisit())).toBe("—");
  });
});

describe("formatVisitPaymentLabel", () => {
  it("labels payment mode", () => {
    expect(formatVisitPaymentLabel(buildVisit())).toBe("Cash");
    expect(
      formatVisitPaymentLabel(buildVisit({ mode_of_payment: "insurance" })),
    ).toBe("Insurance");
  });
});
