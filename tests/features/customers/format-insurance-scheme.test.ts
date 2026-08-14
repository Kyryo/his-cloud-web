import { describe, expect, it } from "vitest";

import {
  formatInsuranceSchemeLabel,
  formatMorePayersLabel,
  splitVisibleInsurancePayers,
  uniqueInsurancePayers,
} from "@/features/customers/utils/format-insurance-scheme";

describe("formatInsuranceSchemeLabel", () => {
  it("formats payer and scheme as payer-scheme", () => {
    expect(
      formatInsuranceSchemeLabel({
        name: "Gold",
        insurance_company_name: "MASM",
      }),
    ).toBe("MASM-Gold");
  });

  it("shows only the scheme name when payer matches scheme", () => {
    expect(
      formatInsuranceSchemeLabel({
        name: "MASM",
        insurance_company_name: "MASM",
      }),
    ).toBe("MASM");
  });

  it("treats matching names as equal ignoring case and accents", () => {
    expect(
      formatInsuranceSchemeLabel({
        name: "masm",
        insurance_company_name: "MASM",
      }),
    ).toBe("masm");
  });

  it("falls back to scheme name when payer is blank", () => {
    expect(
      formatInsuranceSchemeLabel({
        name: "Cash Plan",
        insurance_company_name: "  ",
      }),
    ).toBe("Cash Plan");
  });
});

describe("uniqueInsurancePayers", () => {
  it("deduplicates payers and sorts by name", () => {
    expect(
      uniqueInsurancePayers([
        { insurance_company: 2, insurance_company_name: "MASM" },
        { insurance_company: 1, insurance_company_name: "CIC" },
        { insurance_company: 2, insurance_company_name: "MASM" },
      ]),
    ).toEqual([
      { id: 1, name: "CIC" },
      { id: 2, name: "MASM" },
    ]);
  });
});

describe("splitVisibleInsurancePayers", () => {
  const payers = [
    { id: 1, name: "Aetna" },
    { id: 2, name: "CIC" },
    { id: 3, name: "Liberty" },
    { id: 4, name: "MASM" },
    { id: 5, name: "NICO" },
    { id: 6, name: "Old Mutual" },
  ];

  it("shows a limited set and remaining overflow payers", () => {
    expect(
      splitVisibleInsurancePayers(payers, {
        expanded: false,
        selectedPayerId: null,
      }),
    ).toEqual({
      visible: payers.slice(0, 4),
      overflow: payers.slice(4),
    });
  });

  it("pins a selected overflow payer into the first row when collapsed", () => {
    const result = splitVisibleInsurancePayers(payers, {
      expanded: false,
      selectedPayerId: 6,
    });

    expect(result.visible.map((payer) => payer.id)).toEqual([1, 2, 3, 6]);
    expect(result.overflow.map((payer) => payer.id)).toEqual([4, 5]);
  });

  it("keeps the first row stable and lists overflow separately when expanded", () => {
    expect(
      splitVisibleInsurancePayers(payers, {
        expanded: true,
        selectedPayerId: null,
      }),
    ).toEqual({
      visible: payers.slice(0, 4),
      overflow: payers.slice(4),
    });
  });
});

describe("formatMorePayersLabel", () => {
  it("pluralizes the overflow label", () => {
    expect(formatMorePayersLabel(1)).toBe("1 more payer");
    expect(formatMorePayersLabel(3)).toBe("3 more payers");
  });
});
