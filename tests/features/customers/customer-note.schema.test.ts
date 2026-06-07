import { describe, expect, it } from "vitest";

import {
  createCustomerNoteDefaultValues,
  createCustomerNoteSchema,
  toCustomerNotePayload,
} from "@/features/customers/schemas/customer-note.schema";

describe("customer-note.schema", () => {
  it("requires note body", () => {
    const result = createCustomerNoteSchema.safeParse(
      createCustomerNoteDefaultValues,
    );

    expect(result.success).toBe(false);
  });

  it("maps form values to API payload", () => {
    const values = {
      ...createCustomerNoteDefaultValues,
      note_type: "ADMINISTRATIVE" as const,
      title: "Front desk note",
      body: "Customer prefers SMS reminders.",
      is_pinned: true,
    };

    expect(toCustomerNotePayload(42, values)).toEqual({
      customer: 42,
      note_type: "ADMINISTRATIVE",
      title: "Front desk note",
      body: "Customer prefers SMS reminders.",
      is_pinned: true,
      is_active: true,
    });
  });
});
