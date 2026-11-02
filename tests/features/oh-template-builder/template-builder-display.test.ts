import { describe, expect, it } from "vitest";

import { formatEditedAgo } from "@/features/oh-template-builder/lib/formatEdited";
import {
  previewProgress,
  togglePreviewPick,
} from "@/features/oh-template-builder/lib/previewAnswers";
import type { BuilderAttachment } from "@/features/oh-template-builder/template-builder.types";
import {
  employerInitials,
  monogramToneIndex,
} from "@/features/settings/components/modules/occupational-health/employerMonogram";

function attachment(uuid: string, isMandatory: boolean): BuilderAttachment {
  return {
    uuid,
    sectionUuid: `s-${uuid}`,
    sortOrder: 0,
    itemCount: null,
    section: {
      uuid: `s-${uuid}`,
      code: uuid,
      name: uuid,
      isMandatory,
      selectionMode: "inclusive",
      isSystem: false,
      active: true,
      contentMode: "items",
      defaultResponseFields: [],
    },
  } as BuilderAttachment;
}

describe("employerInitials", () => {
  it("uses the first two meaningful words", () => {
    expect(employerInitials("Anglo Platinum (Pty) Ltd")).toBe("AP");
    expect(employerInitials("The Mining Company")).toBe("MC");
  });

  it("falls back to the first two letters of a single word", () => {
    expect(employerInitials("Sasol")).toBe("SA");
    expect(employerInitials("Ltd")).toBe("LT");
    expect(employerInitials("  ")).toBe("?");
  });

  it("strips accents", () => {
    expect(employerInitials("Éclat Énergie")).toBe("EE");
  });
});

describe("monogramToneIndex", () => {
  it("is stable and within range", () => {
    const first = monogramToneIndex("2f6c0b1e-uuid", 3);
    expect(monogramToneIndex("2f6c0b1e-uuid", 3)).toBe(first);
    expect(first).toBeGreaterThanOrEqual(0);
    expect(first).toBeLessThan(3);
    expect(monogramToneIndex("anything", 0)).toBe(0);
  });
});

describe("formatEditedAgo", () => {
  const now = new Date("2026-11-01T12:00:00Z");

  it("returns null for missing or invalid dates", () => {
    expect(formatEditedAgo(null, now)).toBeNull();
    expect(formatEditedAgo("not a date", now)).toBeNull();
  });

  it("treats recent and future timestamps as just now", () => {
    expect(formatEditedAgo("2026-11-01T11:59:30Z", now)).toBe("just now");
    expect(formatEditedAgo("2026-11-01T12:05:00Z", now)).toBe("just now");
  });

  it("formats older edits relative to now", () => {
    expect(formatEditedAgo("2026-10-29T12:00:00Z", now)).toBe("3 days ago");
  });
});

describe("preview answers", () => {
  it("keeps one pick for pick-one sections and toggles it off", () => {
    expect(togglePreviewPick([], "a", "exclusive")).toEqual(["a"]);
    expect(togglePreviewPick(["a"], "b", "exclusive")).toEqual(["b"]);
    expect(togglePreviewPick(["a"], "a", "exclusive")).toEqual([]);
  });

  it("toggles independently for pick-any sections", () => {
    expect(togglePreviewPick(["a"], "b", "inclusive")).toEqual(["a", "b"]);
    expect(togglePreviewPick(["a", "b"], "a", "inclusive")).toEqual(["b"]);
  });

  it("counts only required sections towards progress", () => {
    const attachments = [attachment("x", true), attachment("y", true), attachment("z", false)];
    expect(previewProgress(attachments, { x: ["i1"], z: ["i2"] })).toEqual({
      answered: 1,
      total: 2,
    });
  });
});
