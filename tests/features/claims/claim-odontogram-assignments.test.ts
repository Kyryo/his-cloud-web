import { describe, expect, it } from "vitest";

import {
  computeLineTeethAssignments,
  lineTeethChanged,
} from "@/features/claims/utils/claim-odontogram-assignments";

describe("computeLineTeethAssignments", () => {
  it("adds teeth to the target line and removes them from others", () => {
    const next = computeLineTeethAssignments({
      lines: [
        { id: 1, toothNumbers: [16, 17] },
        { id: 2, toothNumbers: [26] },
      ],
      targetLineId: 2,
      toothNumbers: [16],
      mode: "add",
    });

    expect(next).toEqual([
      { lineId: 1, toothNumbers: [17] },
      { lineId: 2, toothNumbers: [16, 26] },
    ]);
  });

  it("replaces the target line teeth for select-all style assignment", () => {
    const next = computeLineTeethAssignments({
      lines: [
        { id: 1, toothNumbers: [11] },
        { id: 2, toothNumbers: [21, 22] },
      ],
      targetLineId: 1,
      toothNumbers: [11, 12, 13],
      mode: "replace",
    });

    expect(next).toEqual([
      { lineId: 1, toothNumbers: [11, 12, 13] },
      { lineId: 2, toothNumbers: [] },
    ]);
  });

  it("detects tooth list changes", () => {
    expect(lineTeethChanged([16, 26], [16, 26])).toBe(false);
    expect(lineTeethChanged([16], [16, 26])).toBe(true);
  });
});
