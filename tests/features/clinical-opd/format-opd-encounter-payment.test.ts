import { describe, expect, it } from "vitest";

import { formatOpdEncounterPaymentLabel } from "@/features/clinical-opd/utils/format-opd-encounter-payment";
import { hasRichTextContent } from "@/features/clinical-opd/utils/rich-text";

describe("format-opd-encounter-payment", () => {
  it("formats cash visits", () => {
    expect(
      formatOpdEncounterPaymentLabel({
        mode_of_payment: "cash",
        insurance_scheme_name: null,
      }),
    ).toBe("Cash");
  });

  it("formats insurance visits with scheme", () => {
    expect(
      formatOpdEncounterPaymentLabel({
        mode_of_payment: "insurance",
        insurance_scheme_name: "MASM Essential",
      }),
    ).toBe("Insurance · MASM Essential");
  });
});

describe("rich-text", () => {
  it("detects empty rich text", () => {
    expect(hasRichTextContent("<p><br></p>")).toBe(false);
    expect(hasRichTextContent("<p>Findings noted</p>")).toBe(true);
  });
});
