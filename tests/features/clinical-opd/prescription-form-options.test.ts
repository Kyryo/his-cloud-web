import { describe, expect, it } from "vitest";

import {
  calculatePrescribedQuantity,
  formatPrescriptionDuration,
  PRESCRIPTION_DURATION_UNIT_OPTIONS,
  PRESCRIPTION_FREQUENCY_OPTIONS,
  PRESCRIPTION_ROUTE_OPTIONS,
  PRESCRIPTION_UOM_OPTIONS,
  parsePrescriptionDoseQuantity,
} from "@/features/clinical-opd/utils/prescription-form-options";

describe("prescription form options", () => {
  it("includes expected frequency, route, duration, and unit choices", () => {
    expect(PRESCRIPTION_FREQUENCY_OPTIONS).toContain("Once a day");
    expect(PRESCRIPTION_FREQUENCY_OPTIONS).toContain("Twice a week");
    expect(PRESCRIPTION_FREQUENCY_OPTIONS).toContain("Quarterly");
    expect(PRESCRIPTION_ROUTE_OPTIONS).toContain("Oral");
    expect(PRESCRIPTION_ROUTE_OPTIONS).toContain("Intravenous");
    expect(PRESCRIPTION_DURATION_UNIT_OPTIONS).toEqual([
      "Day",
      "Weeks",
      "Months",
    ]);
    expect(PRESCRIPTION_UOM_OPTIONS).toContain("Tablet");
    expect(PRESCRIPTION_UOM_OPTIONS).toContain("Capsule");
    expect(PRESCRIPTION_UOM_OPTIONS).toContain("ml");
    expect(PRESCRIPTION_UOM_OPTIONS).toContain("Application");
  });

  it("formats duration from value and unit", () => {
    expect(formatPrescriptionDuration("5", "Day")).toBe("5 Day");
    expect(formatPrescriptionDuration("2", "Weeks")).toBe("2 Weeks");
    expect(formatPrescriptionDuration("", "Day")).toBeUndefined();
    expect(formatPrescriptionDuration("3", "")).toBeUndefined();
  });

  it("parses leading dose quantity", () => {
    expect(parsePrescriptionDoseQuantity("2")).toBe(2);
    expect(parsePrescriptionDoseQuantity("5ml")).toBe(5);
    expect(parsePrescriptionDoseQuantity("")).toBe(1);
  });

  it("calculates amount prescribed from dose, frequency, and duration", () => {
    expect(
      calculatePrescribedQuantity({
        dose: "1",
        frequency: "Twice a day",
        durationValue: "5",
        durationUnit: "Day",
      }),
    ).toBe(10);
    expect(
      calculatePrescribedQuantity({
        dose: "5ml",
        frequency: "Thrice a day",
        durationValue: "5",
        durationUnit: "Day",
      }),
    ).toBe(75);
    expect(
      calculatePrescribedQuantity({
        dose: "1",
        frequency: "Once a week",
        durationValue: "4",
        durationUnit: "Weeks",
      }),
    ).toBe(4);
    expect(
      calculatePrescribedQuantity({
        dose: "1",
        frequency: "Twice a day",
        durationValue: "",
        durationUnit: "Day",
      }),
    ).toBeNull();
  });
});
