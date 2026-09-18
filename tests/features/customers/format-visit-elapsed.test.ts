import { describe, expect, it } from "vitest";

import { formatVisitElapsed } from "@/features/customers/utils/format-visit-elapsed";

describe("formatVisitElapsed", () => {
  const now = new Date("2026-09-18T16:00:00.000Z");

  it("returns just now for visits under a minute", () => {
    expect(formatVisitElapsed("2026-09-18T15:59:30.000Z", now)).toBe("Just now");
  });

  it("returns minutes under an hour", () => {
    expect(formatVisitElapsed("2026-09-18T15:18:00.000Z", now)).toBe("42 min");
  });

  it("returns hours and leftover minutes", () => {
    expect(formatVisitElapsed("2026-09-18T13:20:00.000Z", now)).toBe("2h 40m");
  });

  it("returns null for invalid dates", () => {
    expect(formatVisitElapsed("not-a-date", now)).toBeNull();
  });
});
