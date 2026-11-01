import { describe, expect, it } from "vitest";

import { AUTH_ROUTES, PROTECTED_ROUTES, ROUTES } from "@/constants/routes";
import { toSectionCode, toUpperCode } from "@/features/oh-template-builder/lib/templateCodes";
import {
  buildItemAttributes,
  buildItemNames,
  cleanResponses,
  cleanSchedule,
} from "@/features/oh-template-builder/lib/templateItems";
import {
  isTemplateKind,
  templateGalleryHref,
  templateQueryKeys,
} from "@/features/oh-template-builder/lib/templateKinds";
import { moveAttachment } from "@/features/oh-template-builder/lib/templateOrder";
import type { BuilderAttachment } from "@/features/oh-template-builder/template-builder.types";
import { matchesRoute } from "@/lib/route-matching";

function attachment(uuid: string, sortOrder: number): BuilderAttachment {
  return { uuid, sectionUuid: `s-${uuid}`, sortOrder, itemCount: null, section: null };
}

describe("template codes", () => {
  it("builds UPPER_SNAKE codes from free text", () => {
    expect(toUpperCode("Pre-employment medical")).toBe("PRE_EMPLOYMENT_MEDICAL");
    expect(toUpperCode("  Blood pressure (mmHg) ")).toBe("BLOOD_PRESSURE_MMHG");
    expect(toUpperCode("Électrocardiogramme")).toBe("ELECTROCARDIOGRAMME");
  });

  it("builds lower_snake section codes", () => {
    expect(toSectionCode("Vital Signs")).toBe("vital_signs");
    expect(toSectionCode("--")).toBe("");
  });
});

describe("item attribute building", () => {
  it("drops empty responses and fills missing codes from labels", () => {
    expect(
      cleanResponses([
        { label: " Normal ", code: "" },
        { label: "", code: "" },
        { label: "Abnormal", code: "abn" },
      ]),
    ).toEqual([
      { label: "Normal", code: "NORMAL" },
      { label: "Abnormal", code: "ABN" },
    ]);
  });

  it("clamps schedule intervals to positive integers", () => {
    expect(
      cleanSchedule([
        { interval: 0, unit: "year", notes: " annual " },
        { interval: 2.7, unit: "month", notes: "" },
      ]),
    ).toEqual([
      { interval: 1, unit: "year", notes: "annual" },
      { interval: 2, unit: "month", notes: "" },
    ]);
  });

  it("keeps unknown keys and removes the legacy item selection mode", () => {
    const result = buildItemAttributes(
      { selection_mode: "single", reference_range: "120/80" },
      {
        name: "BP",
        code: "BP",
        isMandatory: true,
        schedule: [],
        responses: [{ label: "Normal", code: "" }],
      },
    );
    expect(result).toEqual({
      reference_range: "120/80",
      possible_responses: [{ label: "Normal", code: "NORMAL" }],
      is_mandatory: true,
      schedule: [],
    });
  });

  it("only sends an English name when one is given", () => {
    expect(buildItemNames("  Audiometry ")).toEqual({ en: "Audiometry" });
    expect(buildItemNames("   ")).toEqual({});
  });
});

describe("moveAttachment", () => {
  const rows = [attachment("a", 0), attachment("b", 1), attachment("c", 2)];

  it("swaps neighbours and reports only changed positions", () => {
    const result = moveAttachment(rows, "c", "up");
    expect(result?.attachments.map((row) => row.uuid)).toEqual(["a", "c", "b"]);
    expect(result?.changes).toEqual([
      { uuid: "c", sortOrder: 1 },
      { uuid: "b", sortOrder: 2 },
    ]);
  });

  it("returns null at the edges or for unknown rows", () => {
    expect(moveAttachment(rows, "a", "up")).toBeNull();
    expect(moveAttachment(rows, "c", "down")).toBeNull();
    expect(moveAttachment(rows, "missing", "down")).toBeNull();
  });

  it("normalises duplicate sort orders from older data", () => {
    const legacy = [attachment("a", 5), attachment("b", 5), attachment("c", 9)];
    const result = moveAttachment(legacy, "a", "down");
    expect(result?.attachments.map((row) => [row.uuid, row.sortOrder])).toEqual([
      ["b", 0],
      ["a", 1],
      ["c", 2],
    ]);
    expect(result?.changes).toHaveLength(3);
  });

  it("does not mutate the input", () => {
    moveAttachment(rows, "b", "up");
    expect(rows.map((row) => row.uuid)).toEqual(["a", "b", "c"]);
  });
});

describe("template kinds and routes", () => {
  it("accepts only known kinds", () => {
    expect(isTemplateKind("exam")).toBe(true);
    expect(isTemplateKind("certificate")).toBe(true);
    expect(isTemplateKind("catalog")).toBe(false);
  });

  it("links back to the matching settings tab", () => {
    expect(templateGalleryHref("exam")).toBe(
      "/settings/modules/occupational-health?tab=exam-templates",
    );
    expect(templateGalleryHref("certificate")).toBe(
      "/settings/modules/occupational-health?tab=catalog",
    );
  });

  it("keeps the list query key from prefixing detail keys", () => {
    const list = templateQueryKeys.list("exam");
    const detail = templateQueryKeys.detail("exam", "u1");
    expect(detail.slice(0, list.length)).not.toEqual(list);
  });

  it("opens the builder outside settings behind auth", () => {
    const href = ROUTES.ohTemplateBuilder("exam", "abc-123");
    expect(href).toBe("/templates/exam/abc-123");
    expect(matchesRoute(href, PROTECTED_ROUTES)).toBe(true);
    expect(matchesRoute(href, AUTH_ROUTES)).toBe(false);
  });
});
