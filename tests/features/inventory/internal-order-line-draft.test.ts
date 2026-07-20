import { describe, expect, it } from "vitest";

import {
  createEmptyInternalOrderLineDraft,
  draftHasProduct,
  draftsToInternalOrderLines,
  getZeroSourceAvailabilityLines,
  preserveProductNamesInDrafts,
  validateInternalOrderLinesForSave,
  validateInternalOrderLinesForSubmit,
} from "@/features/inventory/types/internal-order-line-draft";

describe("draftHasProduct", () => {
  it("treats product_uuid as a selected product", () => {
    expect(
      draftHasProduct({
        product_id: null,
        product_uuid: "prod-uuid",
      }),
    ).toBe(true);
  });
});

describe("validateInternalOrderLinesForSave", () => {
  it("allows clearing all product lines on draft save", () => {
    expect(validateInternalOrderLinesForSave([])).toBeNull();
    expect(
      validateInternalOrderLinesForSave([createEmptyInternalOrderLineDraft()]),
    ).toBeNull();
  });

  it("accepts lines selected by product_uuid only", () => {
    expect(
      validateInternalOrderLinesForSave([
        {
          ...createEmptyInternalOrderLineDraft(),
          product_uuid: "prod-1",
          productName: "Gloves",
          quantity: "2",
          isNew: false,
        },
      ]),
    ).toBeNull();
  });

  it("rejects non-positive quantities", () => {
    expect(
      validateInternalOrderLinesForSave([
        {
          ...createEmptyInternalOrderLineDraft(),
          product_id: 12,
          productName: "Gloves",
          quantity: "0",
          isNew: false,
        },
      ]),
    ).toBe("Each line item must have a quantity greater than zero.");
  });

  it("rejects requested quantities above source availability", () => {
    expect(
      validateInternalOrderLinesForSave([
        {
          ...createEmptyInternalOrderLineDraft(),
          product_uuid: "prod-1",
          productName: "Gloves",
          quantity: "6",
          quantityAvailable: "5",
          isNew: false,
        },
      ]),
    ).toBe("Gloves has only 5 available at the source location.");
  });

  it("adds duplicate product lines before comparing availability", () => {
    expect(
      validateInternalOrderLinesForSave([
        {
          ...createEmptyInternalOrderLineDraft(),
          product_uuid: "prod-1",
          productName: "Gloves",
          quantity: "3",
          quantityAvailable: "5",
          isNew: false,
        },
        {
          ...createEmptyInternalOrderLineDraft(),
          product_uuid: "prod-1",
          productName: "Gloves",
          quantity: "3",
          quantityAvailable: "5",
          isNew: false,
        },
      ]),
    ).toBe("Gloves has only 5 available at the source location.");
  });
});

describe("draftsToInternalOrderLines", () => {
  it("prefers product_uuid in the save payload", () => {
    expect(
      draftsToInternalOrderLines([
        {
          key: "a",
          product_id: null,
          product_uuid: "prod-9",
          productName: "Syringe",
          quantity: "3",
        },
        createEmptyInternalOrderLineDraft(),
      ]),
    ).toEqual([
      {
        id: undefined,
        product_uuid: "prod-9",
        quantity: "3",
        batch: null,
        notes: null,
      },
    ]);
  });
});

describe("preserveProductNamesInDrafts", () => {
  it("restores names, uuids, and availability after save omits them", () => {
    const previous = [
      {
        ...createEmptyInternalOrderLineDraft(),
        product_id: 12,
        product_uuid: "prod-uuid",
        productName: "Gloves",
        quantity: "2",
        quantityAvailable: "8",
        isNew: false,
      },
    ];
    const next = [
      {
        ...createEmptyInternalOrderLineDraft(),
        id: 99,
        product_id: 12,
        product_uuid: null,
        productName: null,
        quantity: "2",
        quantityAvailable: null,
        isNew: false,
      },
    ];

    expect(preserveProductNamesInDrafts(next, previous)).toEqual([
      {
        ...next[0],
        productName: "Gloves",
        product_uuid: "prod-uuid",
        quantityAvailable: "8",
      },
    ]);
  });

  it("keeps server-provided names when present", () => {
    const previous = [
      {
        ...createEmptyInternalOrderLineDraft(),
        product_id: 12,
        product_uuid: "prod-uuid",
        productName: "Stale name",
        quantity: "2",
        isNew: false,
      },
    ];
    const next = [
      {
        ...createEmptyInternalOrderLineDraft(),
        product_id: 12,
        productName: "Paracetamol",
        quantity: "2",
        quantityAvailable: "5",
        isNew: false,
      },
    ];

    expect(preserveProductNamesInDrafts(next, previous)[0]?.productName).toBe(
      "Paracetamol",
    );
  });
});

describe("getZeroSourceAvailabilityLines", () => {
  it("returns product lines with zero source availability", () => {
    expect(
      getZeroSourceAvailabilityLines([
        {
          ...createEmptyInternalOrderLineDraft(),
          product_uuid: "prod-1",
          productName: "Gloves",
          quantityAvailable: "0",
        },
        {
          ...createEmptyInternalOrderLineDraft(),
          product_uuid: "prod-2",
          productName: "Syringe",
          quantityAvailable: "4",
        },
      ]).map((line) => line.productName),
    ).toEqual(["Gloves"]);
  });
});

describe("validateInternalOrderLinesForSubmit", () => {
  it("uses submit-specific empty-lines copy", () => {
    expect(validateInternalOrderLinesForSubmit([])).toBe(
      "Add at least one line item before submitting.",
    );
  });
});
