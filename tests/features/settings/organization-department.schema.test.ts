import { describe, expect, it } from "vitest";

import {
  toCreateOrganizationDepartmentPayload,
  createOrganizationDepartmentSchema,
} from "@/features/settings/schemas/organization-department.schema";

describe("createOrganizationDepartmentSchema", () => {
  it("requires clinic and department type", () => {
    const result = createOrganizationDepartmentSchema.safeParse({
      name: "OPD",
      code: "opd-01",
      clinic: "",
      department_type: "",
      requires_appointment: false,
      walk_in_allowed: true,
      default_appointment_duration_minutes: 30,
    });

    expect(result.success).toBe(false);
  });

  it("normalizes department code to uppercase", () => {
    const payload = toCreateOrganizationDepartmentPayload({
      name: "Outpatient",
      code: "opd-01",
      clinic: "1",
      department_type: "opd",
      description: "General outpatient",
      requires_appointment: true,
      walk_in_allowed: false,
      default_appointment_duration_minutes: 45,
    });

    expect(payload.code).toBe("OPD-01");
    expect(payload.clinic).toBe(1);
    expect(payload.department_type).toBe("opd");
    expect(payload.requires_appointment).toBe(true);
    expect(payload.default_appointment_duration_minutes).toBe(45);
  });
});
