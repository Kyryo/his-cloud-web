import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CreateAppointmentDialog } from "@/features/appointments/components/CreateAppointmentDialog";
import type { Customer } from "@/features/customers/types/customer.types";

const createAppointmentMock = vi.hoisted(() => vi.fn());
const fetchCareProvidersMock = vi.hoisted(() => vi.fn());
const fetchClinicsMock = vi.hoisted(() => vi.fn());
const fetchDepartmentsMock = vi.hoisted(() => vi.fn());

vi.mock("@/features/appointments/services/appointments.service", () => ({
  createAppointment: createAppointmentMock,
  fetchCareProviders: fetchCareProvidersMock,
}));

vi.mock("@/features/clinical/services/clinical-catalog.service", () => ({
  fetchClinicalClinics: fetchClinicsMock,
  fetchClinicalDepartments: fetchDepartmentsMock,
}));

vi.mock("@/providers/user-provider", () => ({
  useUser: () => ({
    userData: { primary_clinic: { id: 1, name: "Main Clinic" } },
    isLoading: false,
    refreshUser: vi.fn(),
  }),
}));

vi.mock("@/providers/toast-provider", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

vi.mock("@/features/customers/components/CustomerAppointmentPicker", () => ({
  CustomerAppointmentPicker: ({
    onCustomerChange,
  }: {
    onCustomerChange: (customer: unknown) => void;
  }) => (
    <button type="button" onClick={() => onCustomerChange(customer)}>
      Pick Jane Doe
    </button>
  ),
}));

const customer = {
  uuid: "customer-uuid",
  first_name: "Jane",
  last_name: "Doe",
  full_name: "Jane Doe",
} as unknown as Customer;

describe("CreateAppointmentDialog calendar slot prefill", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchClinicsMock.mockResolvedValue([
      { id: 1, uuid: "clinic-uuid", name: "Main Clinic", code: "MC" },
    ]);
    fetchDepartmentsMock.mockResolvedValue([
      { id: 5, uuid: "department-uuid", name: "Physio", code: "PHY" },
    ]);
    fetchCareProvidersMock.mockResolvedValue([
      { id: 10, name: "Dr Strange", user_role: "physician" },
    ]);
    createAppointmentMock.mockResolvedValue({
      uuid: "appt-uuid",
      scheduled_start: "2026-07-15T09:00:00Z",
    });
  });

  it("submits the prefilled clinician from a calendar slot", async () => {
    render(
      <CreateAppointmentDialog
        customer={customer}
        open
        onOpenChange={vi.fn()}
        onCreated={vi.fn()}
        initialSchedule={{
          clinic: "clinic-uuid",
          department: "department-uuid",
          clinician: 10,
          clinicianName: "Dr Strange",
          scheduled_start: "2026-07-15T09:00",
          scheduled_end: "2026-07-15T09:30",
        }}
      />,
    );

    await waitFor(() => {
      expect(fetchClinicsMock).toHaveBeenCalled();
    });

    const continueButton = await screen.findByRole("button", {
      name: "Continue",
    });
    fireEvent.click(continueButton);

    const submitButton = await screen.findByRole("button", {
      name: "Schedule appointment",
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(createAppointmentMock).toHaveBeenCalledTimes(1);
    });

    const payload = createAppointmentMock.mock.calls[0][0];
    expect(payload.clinician).toBe(10);
    expect(payload.clinic).toBe("clinic-uuid");
    expect(payload.department).toBe("department-uuid");
  });

  it("keeps the prefilled clinician when the client is picked in the dialog", async () => {
    render(
      <CreateAppointmentDialog
        open
        onOpenChange={vi.fn()}
        onCreated={vi.fn()}
        initialSchedule={{
          clinic: "clinic-uuid",
          department: "department-uuid",
          clinician: 10,
          clinicianName: "Dr Strange",
          scheduled_start: "2026-07-15T09:00",
          scheduled_end: "2026-07-15T09:30",
        }}
      />,
    );

    await waitFor(() => {
      expect(fetchClinicsMock).toHaveBeenCalled();
    });

    fireEvent.click(await screen.findByRole("button", { name: "Pick Jane Doe" }));
    fireEvent.click(await screen.findByRole("button", { name: "Continue" }));

    expect(
      (await screen.findAllByText("Dr Strange · Physician")).length,
    ).toBeGreaterThan(0);

    fireEvent.click(await screen.findByRole("button", { name: "Continue" }));
    fireEvent.click(
      await screen.findByRole("button", { name: "Schedule appointment" }),
    );

    await waitFor(() => {
      expect(createAppointmentMock).toHaveBeenCalledTimes(1);
    });

    const payload = createAppointmentMock.mock.calls[0][0];
    expect(payload.clinician).toBe(10);
  });
});
