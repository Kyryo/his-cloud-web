import { describe, expect, it } from "vitest";

import { formatCountdown } from "@/components/verification-code/use-countdown";

describe("formatCountdown", () => {
  it("formats seconds as MM:SS", () => {
    expect(formatCountdown(59)).toBe("00:59");
    expect(formatCountdown(60)).toBe("01:00");
    expect(formatCountdown(125)).toBe("02:05");
  });

  it("clamps negative values to zero", () => {
    expect(formatCountdown(-5)).toBe("00:00");
  });
});
