import { describe, expect, it } from "vitest";

import {
  EXAM_TYPES,
  MEDICAL_EXAM_START_TYPES,
  formatExamTypeLabel,
} from "@/features/occupational-health/utils/oh-labels";

describe("oh exam type labels", () => {
  it("uses SA occupational health display names", () => {
    expect(formatExamTypeLabel("pre_employment")).toBe("Admission exam");
    expect(formatExamTypeLabel("periodic")).toBe("Periodic exam");
    expect(formatExamTypeLabel("transfer")).toBe("Change of function exam");
    expect(formatExamTypeLabel("rtw")).toBe("Return to work exam");
    expect(formatExamTypeLabel("exit")).toBe("Demissional exam");
  });

  it("omits post_incident from medical exam start options", () => {
    expect(MEDICAL_EXAM_START_TYPES.map((row) => row.value)).toEqual([
      "pre_employment",
      "periodic",
      "transfer",
      "rtw",
      "exit",
    ]);
    expect(EXAM_TYPES.some((row) => row.value === "post_incident")).toBe(true);
  });
});
