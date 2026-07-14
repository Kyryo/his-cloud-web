import { describe, expect, it } from "vitest";

import {
  editVisitPaymentSchema,
  toUpdateVisitPaymentModePayload,
} from "@/features/visits/schemas/edit-visit-payment.schema";

describe("edit-visit-payment.schema", () => {
  it("requires insurance scheme when mode is insurance", () => {
    const result = editVisitPaymentSchema.safeParse({
      mode_of_payment: "insurance",
      insurance_scheme: "",
    });

    expect(result.success).toBe(false);
  });

  it("allows cash without insurance scheme", () => {
    const result = editVisitPaymentSchema.safeParse({
      mode_of_payment: "cash",
      insurance_scheme: "",
    });

    expect(result.success).toBe(true);
  });

  it("allows cash with explicit null insurance scheme", () => {
    const result = editVisitPaymentSchema.safeParse({
      mode_of_payment: "cash",
      insurance_scheme: null,
    });

    expect(result.success).toBe(true);
  });

  it("clears insurance scheme in update payload for cash", () => {
    const payload = toUpdateVisitPaymentModePayload({
      mode_of_payment: "cash",
      insurance_scheme: "00000000-0000-0000-0000-000000000001",
    });

    expect(payload).toEqual({
      mode_of_payment: "cash",
      insurance_scheme: null,
    });
  });
});
