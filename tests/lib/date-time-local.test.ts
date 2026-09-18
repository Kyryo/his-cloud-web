import { describe, expect, it } from "vitest";

import {
  applyDatePart,
  applyTimePart,
  buildMinuteOptions,
  formatDateTimeLocal,
  formatDateTimePickerDate,
  formatDateTimePickerLabel,
  formatDateTimePickerTime,
  parseDateTimeLocal,
} from "@/lib/date-time-local";

describe("date-time-local", () => {
  it("parses and formats local datetime values", () => {
    const parsed = parseDateTimeLocal("2026-09-18T15:47");

    expect(parsed).not.toBeNull();
    expect(formatDateTimeLocal(parsed!)).toBe("2026-09-18T15:47");
    expect(formatDateTimePickerLabel(parsed!)).toBe("18 Sep 2026, 15:47");
    expect(formatDateTimePickerDate(parsed!)).toBe("Fri 18 Sep");
    expect(formatDateTimePickerTime(parsed!)).toBe("15:47");
    expect(parseDateTimeLocal("not-a-date")).toBeNull();
  });

  it("keeps irregular minutes in the picker list", () => {
    expect(buildMinuteOptions(47)).toEqual([
      0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 47, 50, 55,
    ]);
    expect(buildMinuteOptions(15)).toEqual([
      0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55,
    ]);
  });

  it("applies date and time parts independently", () => {
    const base = parseDateTimeLocal("2026-09-18T15:47")!;

    expect(formatDateTimeLocal(applyDatePart(base, new Date(2026, 8, 20)))).toBe(
      "2026-09-20T15:47",
    );
    expect(formatDateTimeLocal(applyTimePart(base, 9, 5))).toBe("2026-09-18T09:05");
  });
});
