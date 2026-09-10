import { describe, expect, it } from "vitest";

import { ROUTES } from "@/constants/routes";
import {
  appointmentsCalendarHref,
  appointmentsViewHref,
  parseAppointmentsCalendarView,
  parseAppointmentsViewFromPath,
} from "@/features/appointments/utils/appointment-views";

describe("appointment view URLs", () => {
  it("maps table, board, and calendar paths", () => {
    expect(parseAppointmentsViewFromPath(ROUTES.appointments)).toBe("list");
    expect(parseAppointmentsViewFromPath(ROUTES.appointmentsBoard)).toBe("board");
    expect(parseAppointmentsViewFromPath(ROUTES.appointmentsCalendar)).toBe(
      "calendar",
    );
    expect(appointmentsViewHref("list")).toBe(ROUTES.appointments);
    expect(appointmentsViewHref("board")).toBe(ROUTES.appointmentsBoard);
    expect(appointmentsViewHref("calendar")).toBe(ROUTES.appointmentsCalendar);
  });

  it("defaults invalid calendar views to month and omits the default query", () => {
    expect(parseAppointmentsCalendarView(null)).toBe("month");
    expect(parseAppointmentsCalendarView("agenda")).toBe("month");
    expect(parseAppointmentsCalendarView("week")).toBe("week");
    expect(appointmentsCalendarHref("month")).toBe(ROUTES.appointmentsCalendar);
    expect(appointmentsCalendarHref("week")).toBe(
      `${ROUTES.appointmentsCalendar}?view=week`,
    );
    expect(appointmentsCalendarHref("day")).toBe(
      `${ROUTES.appointmentsCalendar}?view=day`,
    );
  });
});
