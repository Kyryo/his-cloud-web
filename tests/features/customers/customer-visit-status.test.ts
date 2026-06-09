import { describe, expect, it } from "vitest";

import {
  formatCustomerVisitStatusLabel,
  isCustomerVisitActive,
  normalizeCustomerVisitStatus,
} from "@/features/customers/utils/customer-visit-status";

describe("customer visit status utils", () => {
  it("detects active visits", () => {
    expect(isCustomerVisitActive("active")).toBe(true);
    expect(isCustomerVisitActive("completed")).toBe(false);
    expect(isCustomerVisitActive(undefined)).toBe(false);
  });

  it("formats visit status labels", () => {
    expect(formatCustomerVisitStatusLabel("active")).toBe("Active");
    expect(formatCustomerVisitStatusLabel("not_started")).toBe("Not started");
    expect(formatCustomerVisitStatusLabel("completed")).toBe("Completed");
    expect(formatCustomerVisitStatusLabel("cancelled")).toBe("Cancelled");
  });

  it("normalizes unknown statuses to not_started", () => {
    expect(normalizeCustomerVisitStatus("active")).toBe("active");
    expect(normalizeCustomerVisitStatus("unknown")).toBe("not_started");
    expect(normalizeCustomerVisitStatus(undefined)).toBe("not_started");
  });
});
