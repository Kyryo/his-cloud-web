import { describe, expect, it } from "vitest";

import {
  addMinutesToLocalDateTime,
  getDurationMinutesBetween,
  parseCustomDurationMinutes,
  resolveDurationSelectValue,
} from "@/features/appointments/utils/appointment-duration";

describe("appointment-duration", () => {
  it("adds minutes to a local datetime string", () => {
    expect(addMinutesToLocalDateTime("2026-07-15T09:00", 30)).toBe(
      "2026-07-15T09:30",
    );
    expect(addMinutesToLocalDateTime("2026-07-15T09:00", 15)).toBe(
      "2026-07-15T09:15",
    );
    expect(addMinutesToLocalDateTime("2026-07-15T23:45", 30)).toBe(
      "2026-07-16T00:15",
    );
  });

  it("returns null duration when end is not after start", () => {
    expect(getDurationMinutesBetween("2026-07-15T09:00", "2026-07-15T09:00")).toBeNull();
    expect(getDurationMinutesBetween("2026-07-15T09:00", "2026-07-15T08:00")).toBeNull();
    expect(getDurationMinutesBetween("", "2026-07-15T09:30")).toBeNull();
  });

  it("computes whole-minute duration between start and end", () => {
    expect(getDurationMinutesBetween("2026-07-15T09:00", "2026-07-15T09:45")).toBe(45);
    expect(getDurationMinutesBetween("2026-07-15T09:00", "2026-07-15T10:00")).toBe(60);
  });

  it("resolves preset select values and falls back to other", () => {
    expect(resolveDurationSelectValue("2026-07-15T09:00", "2026-07-15T09:30")).toBe(
      "30",
    );
    expect(resolveDurationSelectValue("2026-07-15T09:00", "2026-07-15T09:20")).toBe(
      "other",
    );
    expect(
      resolveDurationSelectValue("2026-07-15T09:00", "2026-07-15T09:30", true),
    ).toBe("other");
  });

  it("parses custom duration minutes within 1–1440", () => {
    expect(parseCustomDurationMinutes("25")).toBe(25);
    expect(parseCustomDurationMinutes(" 90 ")).toBe(90);
    expect(parseCustomDurationMinutes("")).toBeNull();
    expect(parseCustomDurationMinutes("0")).toBeNull();
    expect(parseCustomDurationMinutes("1441")).toBeNull();
    expect(parseCustomDurationMinutes("abc")).toBeNull();
  });
});
