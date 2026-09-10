import { describe, expect, it } from "vitest";

import {
  getClinicianInitials,
  getClinicianTone,
} from "@/features/appointments/utils/appointment-clinician-tones";

describe("appointment clinician tones", () => {
  it("keeps a stable color for the same clinician", () => {
    expect(getClinicianTone("Dr. Vipin Vijayan")).toEqual(
      getClinicianTone("Dr. Vipin Vijayan"),
    );
    expect(getClinicianTone("Dr. Vipin Vijayan").avatar).toMatch(/^bg-/);
    expect(getClinicianTone("Dr. Vipin Vijayan").avatar).toContain("text-white");
  });

  it("uses initials from the first two name parts", () => {
    expect(getClinicianInitials("Dr. Vipin Vijayan")).toBe("DV");
  });
});
