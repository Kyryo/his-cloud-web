import { describe, expect, it } from "vitest";

import { shouldOfferPrepareClaimAfterInvoice } from "@/features/invoices/utils/should-offer-prepare-claim";

describe("shouldOfferPrepareClaimAfterInvoice", () => {
  it("offers the claim flow only when payer integration is configured", () => {
    expect(
      shouldOfferPrepareClaimAfterInvoice({ payer_integration_configured: true }),
    ).toBe(true);
    expect(
      shouldOfferPrepareClaimAfterInvoice({ payer_integration_configured: false }),
    ).toBe(false);
    expect(shouldOfferPrepareClaimAfterInvoice({})).toBe(false);
  });
});
