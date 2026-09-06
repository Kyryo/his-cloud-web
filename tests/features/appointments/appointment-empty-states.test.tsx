import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AppointmentClinicEmptyState } from "@/features/appointments/components/AppointmentClinicEmptyState";
import { AppointmentsEmptyState } from "@/features/appointments/components/AppointmentsEmptyState";

describe("appointment empty states", () => {
  it("explains clinic assignment and links to user management", () => {
    render(<AppointmentClinicEmptyState />);

    expect(screen.getByTestId("schedule-appointment-clinic-empty")).toBeInTheDocument();
    expect(screen.getByText("No clinic assigned")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Open user management" }),
    ).toHaveAttribute("href", "/settings/user-management");
  });

  it("offers a schedule action when the list is empty", () => {
    const onNewAppointment = vi.fn();
    render(<AppointmentsEmptyState onNewAppointment={onNewAppointment} />);

    expect(screen.getByTestId("appointments-empty-state")).toBeInTheDocument();
    expect(screen.getByText("No appointments yet")).toBeInTheDocument();
    screen.getByTestId("schedule-first-appointment-button").click();
    expect(onNewAppointment).toHaveBeenCalledTimes(1);
  });
});
