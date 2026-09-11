import { describe, expect, it } from "vitest";

import { ROUTES } from "@/constants/routes";
import { appointmentsHref } from "@/features/appointments/utils/appointment-list-url";

describe("appointment list URL", () => {
  it("adds new=1 on the current appointments path", () => {
    expect(appointmentsHref()).toBe(ROUTES.appointments);
    expect(appointmentsHref({ newAppointment: true })).toBe(
      `${ROUTES.appointments}?new=1`,
    );
    expect(
      appointmentsHref({
        pathname: ROUTES.appointmentsCalendar,
        newAppointment: true,
      }),
    ).toBe(`${ROUTES.appointmentsCalendar}?new=1`);
  });
});
