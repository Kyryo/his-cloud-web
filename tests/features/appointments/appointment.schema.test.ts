import { describe, expect, it } from "vitest";

import {
  createAppointmentDefaultValues,
  createAppointmentSchema,
  toCreateAppointmentPayload,
} from "@/features/appointments/schemas/appointment.schema";

describe("createAppointmentSchema", () => {
  it("accepts optional clinician and notes", () => {
    const values = createAppointmentDefaultValues({
      clinic: "clinic-uuid",
      department: "department-uuid",
      clinician: 42,
      notes: "Patient prefers morning slots.",
    });

    const parsed = createAppointmentSchema.parse(values);
    expect(parsed.clinician).toBe(42);
    expect(parsed.notes).toBe("Patient prefers morning slots.");
  });

  it("maps clinician into the create payload", () => {
    const values = createAppointmentDefaultValues({
      clinic: "clinic-uuid",
      department: "department-uuid",
      clinician: 7,
    });

    expect(toCreateAppointmentPayload("patient-uuid", values)).toMatchObject({
      patient: "patient-uuid",
      clinician: 7,
    });
  });
});
