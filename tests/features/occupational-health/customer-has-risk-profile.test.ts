import { describe, expect, it } from "vitest";

import type { EmploymentEpisode } from "@/features/occupational-health/types";
import {
  customerHasActiveRiskProfile,
  isActiveEmploymentEpisode,
} from "@/features/occupational-health/utils/customer-has-risk-profile";

function episode(
  overrides: Partial<EmploymentEpisode> = {},
): EmploymentEpisode {
  return {
    id: 1,
    uuid: "ep-1",
    customer: 10,
    employer: 20,
    job_title: 30,
    site: "",
    department_name: "",
    employment_type: "employee",
    employee_number: "",
    start_date: "2026-01-01",
    end_date: null,
    requires_fitness: false,
    hazard_profile: null,
    job_profile: null,
    is_active: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

describe("customerHasActiveRiskProfile", () => {
  it("requires an open episode with a risk profile", () => {
    expect(customerHasActiveRiskProfile([])).toBe(false);
    expect(
      customerHasActiveRiskProfile([episode({ hazard_profile: null })]),
    ).toBe(false);
    expect(
      customerHasActiveRiskProfile([
        episode({ hazard_profile: 9, end_date: "2025-01-01" }),
      ]),
    ).toBe(false);
    expect(
      customerHasActiveRiskProfile([episode({ hazard_profile: 9 })]),
    ).toBe(true);
  });

  it("treats future end dates as active", () => {
    expect(
      isActiveEmploymentEpisode(
        episode({ end_date: "2099-12-31" }),
        "2026-11-02",
      ),
    ).toBe(true);
  });
});
