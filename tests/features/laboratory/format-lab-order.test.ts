import { describe, expect, it } from "vitest";

import {
  formatLabOrderItemStatusLabel,
  formatLabResultStatusLabel,
  formatLabSpecimenStatusLabel,
} from "@/features/laboratory/utils/format-lab-order";

describe("lab order status labels", () => {
  it("formats item, result, and specimen statuses for display", () => {
    expect(formatLabOrderItemStatusLabel("SPECIMEN_PENDING")).toBe(
      "Specimen pending",
    );
    expect(formatLabResultStatusLabel("VERIFIED")).toBe("Verified");
    expect(formatLabResultStatusLabel(null)).toBe("—");
    expect(formatLabSpecimenStatusLabel("ACCESSIONED")).toBe("Accessioned");
  });
});
