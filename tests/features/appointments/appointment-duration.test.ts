import { describe, expect, it } from "vitest";

import {
  addMinutesToLocalDateTime,
  formatAppointmentDurationLabel,
  formatAppointmentScheduleRange,
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

  it("formats duration labels for presets and hours", () => {
    expect(formatAppointmentDurationLabel(15)).toBe("15 minutes");
    expect(formatAppointmentDurationLabel(60)).toBe("1 hour");
    expect(formatAppointmentDurationLabel(120)).toBe("2 hours");
  });

  it("formats a locked schedule range", () => {
    const range = formatAppointmentScheduleRange(
      "2026-07-15T09:00",
      "2026-07-15T09:30",
    );

    expect(range).not.toBeNull();
    expect(range?.dateLabel).toContain("15");
    expect(range?.dateLabel).toContain("Jul");
    expect(range?.timeLabel).toContain("09:00");
    expect(range?.timeLabel).toContain("09:30");
    expect(range?.durationLabel).toBe("30 minutes");
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
