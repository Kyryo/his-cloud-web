import { describe, expect, it } from "vitest";

import {
  formatDisplayDate,
  formatDisplayDateTime,
} from "@/features/customers/utils/format-customer";

describe("formatDisplayDateTime", () => {
  it("formats ISO timestamps for display", () => {
    const formatted = formatDisplayDateTime("2024-06-15T14:30:00.000Z");
    expect(formatted).toContain("2024");
    expect(formatted).toContain("Jun");
  });

  it("returns the original value for invalid dates", () => {
    expect(formatDisplayDateTime("not-a-date")).toBe("not-a-date");
    expect(formatDisplayDate("not-a-date")).toBe("not-a-date");
  });
});
