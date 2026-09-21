import { describe, expect, it } from "vitest";

import {
  encodeHpiBody,
  formatHpiDuration,
  parseHpiBody,
} from "@/features/clinical-opd/utils/hpi-duration";

describe("hpi-duration", () => {
  it("formats singular and plural units", () => {
    expect(formatHpiDuration({ value: 1, unit: "days" })).toBe("1 day");
    expect(formatHpiDuration({ value: 3, unit: "days" })).toBe("3 days");
    expect(formatHpiDuration({ value: 2, unit: "hours" })).toBe("2 hours");
  });

  it("encodes duration above the narrative", () => {
    expect(encodeHpiBody({ value: 3, unit: "days" }, "Dry cough")).toBe(
      "Duration: 3 days\n\nDry cough",
    );
    expect(encodeHpiBody({ value: 6, unit: "hours" }, "")).toBe(
      "Duration: 6 hours",
    );
    expect(encodeHpiBody(null, "Dry cough")).toBe("Dry cough");
  });

  it("parses a stored duration line back into fields", () => {
    expect(parseHpiBody("Duration: 3 days\n\nDry cough, no fever.")).toEqual({
      duration: { value: 3, unit: "days" },
      narrative: "Dry cough, no fever.",
    });
    expect(parseHpiBody("Dry cough, no fever.")).toEqual({
      duration: null,
      narrative: "Dry cough, no fever.",
    });
  });
});
