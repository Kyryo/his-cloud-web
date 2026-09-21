import { describe, expect, it } from "vitest";

import type { CustomerEncounter } from "@/features/customers/types/customer-encounter.types";
import { formatCustomerActivityCopy } from "@/features/customers/utils/format-customer-activity-copy";

function encounter(
  overrides: Partial<CustomerEncounter> &
    Pick<CustomerEncounter, "action" | "action_display" | "summary">,
): CustomerEncounter {
  return {
    id: 1,
    uuid: "enc-1",
    tenant: 1,
    customer: 10,
    customer_name: "Jane Doe",
    customer_identifier: "MRN-1",
    occurred_at: "2026-09-03T10:00:00Z",
    actor: 1,
    actor_name: "John Doe",
    actor_email: "john@example.com",
    details: {},
    source: "api",
    related_object_type: "",
    related_object_id: null,
    related_object_uuid: null,
    is_active: true,
    created_at: "2026-09-03T10:00:00Z",
    updated_at: "2026-09-03T10:00:00Z",
    ...overrides,
  };
}

describe("formatCustomerActivityCopy", () => {
  it("expands terse claim created wording", () => {
    const copy = formatCustomerActivityCopy(
      encounter({
        action: "CLAIM_CREATED",
        action_display: "Claim created",
        summary: "Claim created",
        details: { claim_id: 42, payer_code: "MASM" },
      }),
    );

    expect(copy.title).toContain("Insurance claim created");
    expect(copy.title).toContain("#42");
    expect(copy.summary.toLowerCase()).toContain("draft");
    expect(copy.summary).toContain("MASM");
  });

  it("keeps advisory evaluation details when present", () => {
    const copy = formatCustomerActivityCopy(
      encounter({
        action: "CLAIM_ADVISORIES_EVALUATED",
        action_display: "Claim advisories evaluated",
        summary: "Claim advisories evaluated",
        details: { claim_id: 7, finding_count: 3, ai_count: 1 },
      }),
    );

    expect(copy.title).toContain("#7");
    expect(copy.summary).toContain("3 finding");
  });

  it("redacts lab order product names from client activity", () => {
    const copy = formatCustomerActivityCopy(
      encounter({
        action: "CLINICAL_ORDER_PLACED",
        action_display: "Clinical order placed",
        summary: "Clinical order placed: FCB",
        details: { item_type: "LABORATORY", description: "FCB" },
      }),
    );

    expect(copy.title).toBe("Lab order placed");
    expect(copy.summary).toBe("A lab order was placed for this client.");
    expect(copy.summary).not.toContain("FCB");
    expect(copy.title).not.toContain("FCB");
  });

  it("uses generic copy for clinical notes", () => {
    const copy = formatCustomerActivityCopy(
      encounter({
        action: "CLINICAL_NOTE_ADDED",
        action_display: "Clinical note added",
        summary: "Clinical note added",
        details: { body: "Patient reports chest pain" },
      }),
    );

    expect(copy.title).toBe("Clinical note added");
    expect(copy.summary).toBe("A clinical note was added to the chart.");
    expect(copy.summary).not.toContain("chest pain");
  });

  it("redacts HPI excerpts from activity summaries", () => {
    const copy = formatCustomerActivityCopy(
      encounter({
        action: "HPI_RECORDED",
        action_display: "HPI recorded",
        summary: "HPI recorded for OPD: Patient reports fever…",
        details: {},
      }),
    );

    expect(copy.title).toBe("History of present illness recorded");
    expect(copy.summary).not.toContain("fever");
  });
});
