import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { User } from "@/features/auth/types/auth.types";
import { AccountSettingsPage } from "@/features/settings/pages/AccountSettingsPage";

const useUser = vi.fn();

vi.mock("@/providers/user-provider", () => ({
  useUser: () => useUser(),
}));

vi.mock("@/providers/toast-provider", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

vi.mock("@/features/settings/services/settings.service", () => ({
  updateProfile: vi.fn(),
  uploadProfileAvatar: vi.fn(),
  clearProfileAvatar: vi.fn(),
}));

vi.mock("@/features/appointments/services/appointments.service", () => ({
  fetchMyClinicianAppointments: vi.fn().mockResolvedValue({
    results: [
      {
        uuid: "appt-1",
        patient_name: "Ada Lovelace",
        clinic_name: "Main Clinic",
        department_name: "General",
        scheduled_start: "2026-09-07T08:00:00Z",
        status: "scheduled",
      },
    ],
  }),
}));

vi.mock("@/features/notifications/hooks/use-appointments-report-subscription", () => ({
  useAppointmentsReportSubscription: () => ({
    data: { daily_enabled: true, is_active: true },
    isLoading: false,
    isError: false,
  }),
  useUpdateAppointmentsReportSubscription: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}));

vi.mock("@/features/notifications/hooks/use-sales-report-subscription", () => ({
  useSalesReportSubscription: () => ({
    data: {
      daily_enabled: true,
      weekly_enabled: false,
      monthly_enabled: false,
      is_active: true,
    },
    isLoading: false,
    isError: false,
  }),
  useUpdateSalesReportSubscription: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}));

vi.mock("@/features/settings/hooks/use-tenant-email-configuration", () => ({
  useTenantEmailConfiguration: () => ({
    data: {
      appointment_report_emails_enabled: true,
      sales_report_emails_enabled: true,
      is_active: true,
    },
    isLoading: false,
  }),
}));

afterEach(() => {
  cleanup();
  useUser.mockReset();
});

const user: User = {
  id: 12,
  name: "Jane Doe",
  avatar_url: "http://localhost:8000/media/users/12/avatar/photo.png",
  url: "/users/12",
  email: "jane@example.com",
  permissions: {},
  is_admin: false,
  location: null,
  groups: [],
  tenant: {
    id: 1,
    uuid: "tenant-1",
    name: "Sigma Clinic",
    code: "SIG",
    is_active: true,
  },
  clinics: [
    {
      id: 1,
      clinic: 10,
      clinic_name: "Main Clinic",
      clinic_code: "MAIN",
      tenant_name: "Sigma Clinic",
      role: "clinician",
      is_primary: true,
      is_active: true,
    },
  ],
  locations: [
    {
      id: 4,
      location: 20,
      location_name: "Main Pharmacy",
      location_code: "PHARM",
      clinic_name: "Main Clinic",
      clinic_code: "MAIN",
      tenant_name: "Sigma Clinic",
      role: "staff",
      is_primary: true,
      is_active: true,
    },
  ],
  primary_clinic: null,
  primary_location: null,
};

describe("AccountSettingsPage", () => {
  it("shows a load error when the user is missing", () => {
    useUser.mockReturnValue({
      userData: null,
      isLoading: false,
      refreshUser: vi.fn(),
    });

    render(<AccountSettingsPage />);

    expect(
      screen.getByText(
        "We could not load your account details. Try signing in again.",
      ),
    ).toBeInTheDocument();
  });

  it("hides use a gravatar until a photo is uploaded", () => {
    useUser.mockReturnValue({
      userData: { ...user, avatar_url: "" },
      isLoading: false,
      refreshUser: vi.fn(),
    });

    render(<AccountSettingsPage />);

    expect(
      screen.queryByRole("button", { name: "Use a gravatar" }),
    ).not.toBeInTheDocument();
    expect(screen.getByLabelText("Upload avatar")).toBeInTheDocument();
  });

  it("shows profile fields and switches to clinics and appointments", async () => {
    useUser.mockReturnValue({
      userData: user,
      isLoading: false,
      refreshUser: vi.fn(),
    });

    render(<AccountSettingsPage />);

    expect(screen.getByDisplayValue("Jane Doe")).toBeInTheDocument();
    expect(screen.getByText("jane@example.com")).toBeInTheDocument();
    expect(screen.getByLabelText("Upload avatar")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Jane Doe avatar" })).toHaveAttribute(
      "src",
      "http://localhost:8000/media/users/12/avatar/photo.png",
    );
    expect(
      screen.getByRole("button", { name: "Use a gravatar" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save profile" })).toBeInTheDocument();
    expect(screen.queryByText("MAIN · Clinician · Sigma Clinic")).not.toBeInTheDocument();

    expect(
      screen.getByText("English is the only available language for now."),
    ).toBeInTheDocument();
    expect(screen.getByText(/Current time:/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Clinics" }));
    expect(screen.getByText("MAIN · Clinician · Sigma Clinic")).toBeInTheDocument();
    expect(screen.getByText("Primary · Active")).toBeInTheDocument();
    expect(screen.queryByRole("columnheader", { name: "Clinic" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Locations" }));
    expect(screen.getByText("Main Pharmacy")).toBeInTheDocument();
    expect(
      screen.getByText("PHARM · Main Clinic · Staff · Sigma Clinic"),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Appointments" }));
    await waitFor(() => {
      expect(screen.getByText("Ada Lovelace")).toBeInTheDocument();
    });
    expect(screen.getByText("Scheduled")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Notifications" }));
    expect(
      screen.getByText("Receive appointments report emails"),
    ).toBeInTheDocument();
    expect(screen.getByText("Receive sales report emails")).toBeInTheDocument();
  });
});
