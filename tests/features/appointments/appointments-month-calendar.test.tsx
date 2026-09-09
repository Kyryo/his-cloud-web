import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { ComponentProps } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AppointmentsMonthCalendar } from "@/features/appointments/components/AppointmentsMonthCalendar";
import type { Appointment } from "@/features/appointments/types/appointment.types";
import { getAppointmentDayKey } from "@/features/appointments/utils/appointment-calendar-utils";
import { appointmentsCalendarHref } from "@/features/appointments/utils/appointment-views";

const mockReplace = vi.fn();
let calendarViewParam: string | null = null;

vi.mock("next/navigation", () => ({
  usePathname: () => "/appointments/calendar",
  useRouter: () => ({
    replace: mockReplace,
    push: vi.fn(),
  }),
  useSearchParams: () =>
    new URLSearchParams(
      calendarViewParam ? { view: calendarViewParam } : undefined,
    ),
}));

function buildAppointment(
  overrides: Partial<Appointment> = {},
): Appointment {
  return {
    id: 1,
    uuid: "apt-1",
    patient: "cust-1",
    patient_name: "Habiba Osman",
    clinic: "clinic-1",
    clinic_name: "Main Clinic",
    department: "dept-1",
    department_name: "DENTAL",
    department_type: "opd",
    location: null,
    location_name: null,
    clinician: 9,
    clinician_name: "Dr. Vipin Vijayan",
    scheduled_start: "2026-09-01T12:00:00.000Z",
    scheduled_end: "2026-09-01T12:30:00.000Z",
    status: "scheduled",
    reason: "",
    notes: "",
    is_active: true,
    created_at: "2026-09-01T00:00:00.000Z",
    updated_at: "2026-09-01T00:00:00.000Z",
    ...overrides,
  };
}

function renderCalendar(
  props: Partial<ComponentProps<typeof AppointmentsMonthCalendar>> = {},
) {
  return render(
    <AppointmentsMonthCalendar
      visibleMonth={new Date(2026, 8, 1)}
      appointments={[buildAppointment()]}
      onVisibleMonthChange={vi.fn()}
      onDaySelect={vi.fn()}
      {...props}
    />,
  );
}

afterEach(() => {
  cleanup();
  mockReplace.mockReset();
  calendarViewParam = null;
});

describe("AppointmentsMonthCalendar", () => {
  it("shows visit chips and opens a day or appointment", () => {
    const onDaySelect = vi.fn();
    const onAppointmentSelect = vi.fn();

    renderCalendar({
      onDaySelect,
      onAppointmentSelect,
    });

    expect(screen.getByTestId("appointments-month-calendar")).toBeInTheDocument();
    expect(screen.getByTestId("appointments-calendar-month-grid")).toHaveClass(
      "overflow-auto",
    );
    expect(screen.getByText("September 2026")).toBeInTheDocument();
    expect(screen.queryByText("1 visit")).not.toBeInTheDocument();
    expect(screen.getByText("Habiba")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Habiba"));
    expect(onAppointmentSelect).toHaveBeenCalledWith(
      expect.objectContaining({ uuid: "apt-1" }),
    );

    fireEvent.click(
      screen.getByTestId(
        `appointments-calendar-day-${getAppointmentDayKey("2026-09-01T12:00:00.000Z")}`,
      ),
    );
    expect(screen.getByRole("complementary", { name: "Selected day agenda" })).toHaveTextContent("Habiba Osman");
    expect(onDaySelect).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Find a time" }));
    expect(onDaySelect).toHaveBeenCalled();
  });
});

it("disables appointment and scheduling interactions while refreshing", () => {
  const onAppointmentSelect = vi.fn();
  renderCalendar({
    isLoading: true,
    onAppointmentSelect,
  });
  fireEvent.click(screen.getByText("Habiba"));
  expect(onAppointmentSelect).not.toHaveBeenCalled();
  expect(screen.getByRole("button", { name: "Find a time" })).toBeDisabled();
});

it("selects an adjacent month and supports keyboard day selection", () => {
  const onVisibleMonthChange = vi.fn();
  renderCalendar({
    appointments: [],
    onVisibleMonthChange,
  });
  fireEvent.keyDown(screen.getByTestId("appointments-calendar-day-2026-08-30"), { key: "Enter" });
  expect(onVisibleMonthChange).toHaveBeenCalledWith(new Date(2026, 7, 1));
});

it("links month, week, and day views through the calendar query param", () => {
  const { rerender } = renderCalendar();

  expect(screen.getByRole("group", { name: "Calendar view" })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Week" })).toHaveAttribute(
    "href",
    appointmentsCalendarHref("week"),
  );
  expect(screen.getByRole("link", { name: "Day" })).toHaveAttribute(
    "href",
    appointmentsCalendarHref("day"),
  );

  calendarViewParam = "week";
  rerender(
    <AppointmentsMonthCalendar
      visibleMonth={new Date(2026, 8, 1)}
      appointments={[buildAppointment()]}
      onVisibleMonthChange={vi.fn()}
      onDaySelect={vi.fn()}
    />,
  );
  expect(screen.getByTestId("appointments-week-view")).toBeInTheDocument();

  calendarViewParam = "day";
  rerender(
    <AppointmentsMonthCalendar
      visibleMonth={new Date(2026, 8, 1)}
      appointments={[buildAppointment()]}
      onVisibleMonthChange={vi.fn()}
      onDaySelect={vi.fn()}
    />,
  );
  expect(screen.getByTestId("appointments-day-view")).toBeInTheDocument();

  const currentDayTitle = screen.getByRole("heading", { level: 2 }).textContent;
  fireEvent.click(screen.getByRole("button", { name: "Next day" }));
  expect(screen.getByRole("heading", { level: 2 }).textContent).not.toBe(
    currentDayTitle,
  );
});
