import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { Appointment } from "@/features/appointments/types/appointment.types";
import { TodaysAppointmentsReportPage } from "@/features/reports/pages/TodaysAppointmentsReportPage";

const { appointments, reload } = vi.hoisted(() => {
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
      status: "confirmed",
      reason: "Follow up",
      notes: "",
      is_active: true,
      outstanding_balance: "120.00",
      created_at: new Date(2026, 8, 9, 7, 0).toISOString(),
      updated_at: new Date(2026, 8, 9, 7, 0).toISOString(),
      ...overrides,
    };
  }

  return {
    reload: vi.fn(),
    appointments: [
      makeAppointment(),
      makeAppointment({
        uuid: "appt-2",
        patient_name: "John Mwale",
        status: "in_progress",
        outstanding_balance: "0.00",
        scheduled_start: new Date(2026, 8, 9, 10, 0).toISOString(),
        scheduled_end: new Date(2026, 8, 9, 10, 30).toISOString(),
      }),
    ],
  };
});

vi.mock("@/features/appointments/hooks/use-user-associated-clinics", () => ({
  useUserAssociatedClinics: () => ({
    clinics: [{ uuid: "clinic-1", name: "Main Clinic" }],
    isLoading: false,
  }),
}));

vi.mock("@/features/appointments/hooks/use-appointments-list", () => ({
  useAppointmentsList: () => ({
    items: appointments,
    totalCount: appointments.length,
    page: 1,
    pageSize: 200,
    isLoading: false,
    isRefreshing: false,
    error: null,
    isUnauthorized: false,
    hasNext: false,
    hasPrevious: false,
    hasNoRecords: false,
    isFilteredEmpty: false,
    reload,
    handlePageChange: vi.fn(),
    resetPage: vi.fn(),
  }),
}));

vi.mock("@/features/appointments/components/AppointmentDetailDialog", () => ({
  AppointmentDetailDialog: () => null,
}));

afterEach(() => {
  cleanup();
});

describe("TodaysAppointmentsReportPage", () => {
  it("renders a cardless day board instead of a table", () => {
    render(<TodaysAppointmentsReportPage />);

    expect(screen.getByTestId("todays-appointments-report-page")).toBeInTheDocument();
    expect(screen.getByTestId("todays-appointments-toolbar")).toBeInTheDocument();
    expect(screen.getByTestId("todays-appointments-search")).toBeInTheDocument();
    expect(screen.getByTestId("todays-appointments-board")).toBeInTheDocument();
    expect(screen.getByText("Amina Banda")).toBeInTheDocument();
    expect(screen.getByText("John Mwale")).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(screen.queryByText("Outstanding balance")).not.toBeInTheDocument();
  });

  it("filters the board from the metrics strip", () => {
    render(<TodaysAppointmentsReportPage />);

    fireEvent.click(screen.getByTestId("todays-appointments-metric-due"));

    expect(screen.getByText("Amina Banda")).toBeInTheDocument();
    expect(screen.queryByText("John Mwale")).not.toBeInTheDocument();
  });

  it("groups the board by provider", () => {
    render(<TodaysAppointmentsReportPage />);

    fireEvent.click(screen.getByTestId("todays-appointments-group-provider"));

    expect(screen.getByTestId("todays-appointments-grouped-board")).toBeInTheDocument();
    expect(screen.getAllByText("Dr. Phiri").length).toBeGreaterThan(0);
  });
});
