import { formatCustomerIdentifierPreview } from "@/features/settings/utils/format-customer-identifier-preview";

describe("formatCustomerIdentifierPreview", () => {
  it("builds a padded identifier with separator and suffix", () => {
    expect(
      formatCustomerIdentifierPreview({
        prefix: "PAT",
        fallbackPrefix: "SIGMA",
        separator: "/",
        digits: 4,
        startNumber: 25,
        suffix: "MW",
      }),
    ).toBe("PAT/0025MW");
  });

  it("falls back to organization code when prefix is blank", () => {
    expect(
      formatCustomerIdentifierPreview({
        prefix: "  ",
        fallbackPrefix: "SIGMA",
        separator: "-",
        digits: 6,
        startNumber: 1,
        suffix: "",
      }),
    ).toBe("SIGMA-000001");
  });
});
