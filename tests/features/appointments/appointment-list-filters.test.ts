import { describe, expect, it } from "vitest";

import {
  buildAppointmentListFilters,
  countActiveAppointmentFilters,
  DEFAULT_APPOINTMENT_FILTERS,
} from "@/features/appointments/utils/appointment-list-filters";

describe("appointment-list-filters", () => {
  it("counts clinician filter as active", () => {
    const filters = {
      ...DEFAULT_APPOINTMENT_FILTERS,
      clinicianId: 10,
    };

    expect(countActiveAppointmentFilters(filters)).toBe(1);
  });

  it("builds clinicianId into fetch options", () => {
    const filters = {
      ...DEFAULT_APPOINTMENT_FILTERS,
      clinicianId: 42,
      clinicUuid: "clinic-uuid",
    };

    expect(
      buildAppointmentListFilters(filters, { page: 1, pageSize: 20 }),
    ).toMatchObject({
      clinicianId: 42,
      clinicUuid: "clinic-uuid",
      page: 1,
      pageSize: 20,
    });
  });

  it("omits clinicianId when not set", () => {
    expect(
      buildAppointmentListFilters(DEFAULT_APPOINTMENT_FILTERS, {
        page: 1,
        pageSize: 20,
      }),
    ).not.toHaveProperty("clinicianId");
  });
});
