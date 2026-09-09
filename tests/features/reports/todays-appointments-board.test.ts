import { describe, expect, it } from "vitest";

import type { Appointment } from "@/features/appointments/types/appointment.types";
import {
  buildBoardMetrics,
  buildTimeBoardItems,
  filterBoardAppointments,
  formatAppointmentTimeRange,
  formatBoardClock,
  formatHourHeading,
  groupBoardAppointments,
  localTodayIso,
  matchesBoardSearch,
  parseOutstandingBalance,
} from "@/features/reports/utils/todays-appointments-board";

function makeAppointment(overrides: Partial<Appointment> = {}): Appointment {
  return {
    id: 1,
    uuid: "appt-1",
    patient: "patient-1",
    patient_name: "Amina Banda",
    clinic: "clinic-1",
    clinic_name: "Main Clinic",
    department: "dept-1",
    department_name: "Physio",
    department_type: "therapy",
    location: null,
    location_name: null,
    clinician: 10,
    clinician_name: "Dr. Phiri",
    scheduled_start: new Date(2026, 8, 9, 8, 0).toISOString(),
    scheduled_end: new Date(2026, 8, 9, 8, 20).toISOString(),
    status: "scheduled",
    reason: "Follow up",
    notes: "",
    is_active: true,
    outstanding_balance: "0.00",
    created_at: new Date(2026, 8, 9, 7, 0).toISOString(),
    updated_at: new Date(2026, 8, 9, 7, 0).toISOString(),
    ...overrides,
  };
}

describe("todays-appointments-board", () => {
  it("formats a local ISO date and appointment time range", () => {
    const now = new Date(2026, 8, 9, 11, 30);
    expect(localTodayIso(now)).toBe("2026-09-09");

    const start = new Date(2026, 8, 9, 8, 0);
    const end = new Date(2026, 8, 9, 8, 20);
    expect(formatAppointmentTimeRange(start.toISOString(), end.toISOString())).toBe(
      `${formatBoardClock(start)}-${formatBoardClock(end)}`,
    );
  });

  it("builds metrics including outstanding balances", () => {
    const metrics = buildBoardMetrics([
      makeAppointment({ uuid: "a", status: "confirmed" }),
      makeAppointment({ uuid: "b", status: "in_progress" }),
      makeAppointment({ uuid: "c", status: "completed" }),
      makeAppointment({ uuid: "d", status: "no_show" }),
      makeAppointment({
        uuid: "e",
        status: "scheduled",
        outstanding_balance: "150.50",
      }),
    ]);

    expect(metrics).toMatchObject({
      total: 5,
      live: 1,
      upcoming: 2,
      done: 1,
      missed: 1,
      dueCount: 1,
    });
    expect(metrics.dueAmount).toBeCloseTo(150.5);
    expect(parseOutstandingBalance("not-a-number")).toBe(0);
  });

  it("filters by status, due balance, and search", () => {
    const appointments = [
      makeAppointment({
        uuid: "live",
        status: "in_progress",
        patient_name: "Mercy Phiri",
      }),
      makeAppointment({
        uuid: "due",
        status: "confirmed",
        patient_name: "John Mwale",
        outstanding_balance: "80",
      }),
      makeAppointment({
        uuid: "done",
        status: "completed",
        clinician_name: "Dr. Banda",
      }),
    ];

    expect(filterBoardAppointments(appointments, "live", "").map((item) => item.uuid)).toEqual([
      "live",
    ]);
    expect(filterBoardAppointments(appointments, "due", "").map((item) => item.uuid)).toEqual([
      "due",
    ]);
    expect(
      filterBoardAppointments(appointments, "all", "banda").map((item) => item.uuid),
    ).toEqual(["done"]);
    expect(matchesBoardSearch(appointments[0], "mercy")).toBe(true);
  });

  it("groups by provider and clinic, sending unassigned last", () => {
    const appointments = [
      makeAppointment({
        uuid: "open",
        clinician_name: null,
        clinic_name: "",
      }),
      makeAppointment({
        uuid: "named",
        clinician_name: "Dr. Banda",
        clinic_name: "City Clinic",
      }),
    ];

    expect(groupBoardAppointments(appointments, "provider").map((group) => group.label)).toEqual([
      "Dr. Banda",
      "Unassigned",
    ]);
    expect(groupBoardAppointments(appointments, "clinic").map((group) => group.label)).toEqual([
      "City Clinic",
      "No clinic",
    ]);
    expect(groupBoardAppointments(appointments, "time")).toEqual([]);
  });

  it("inserts a now marker between past and upcoming hour groups", () => {
    const morning = new Date(2026, 8, 9, 8, 15);
    const afternoon = new Date(2026, 8, 9, 14, 0);
    const now = new Date(2026, 8, 9, 11, 0);

    const items = buildTimeBoardItems(
      [
        makeAppointment({
          uuid: "morning",
          scheduled_start: morning.toISOString(),
          scheduled_end: new Date(2026, 8, 9, 8, 35).toISOString(),
        }),
        makeAppointment({
          uuid: "afternoon",
          scheduled_start: afternoon.toISOString(),
          scheduled_end: new Date(2026, 8, 9, 14, 20).toISOString(),
        }),
      ],
      now,
    );

    const types = items.map((item) =>
      item.type === "row" ? item.appointment.uuid : item.type,
    );

    expect(types).toEqual([
      "heading",
      "morning",
      "now",
      "heading",
      "afternoon",
    ]);
    expect(items[0]).toMatchObject({
      type: "heading",
      label: formatHourHeading(morning),
    });
  });
});
