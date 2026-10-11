import { cleanup, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AppointmentsListPage } from "@/features/appointments/pages/AppointmentsListPage";
import { IncomingReferralsListPage } from "@/features/referrals/pages/IncomingReferralsListPage";
import { ActiveVisitsEmptyState } from "@/features/visits/components/ActiveVisitsEmptyState";
import { IncomingReferralsEmptyState } from "@/features/referrals/components/IncomingReferralsEmptyState";
import { ActiveVisitsListPage } from "@/features/visits/pages/ActiveVisitsListPage";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/appointments",
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/providers/user-provider", () => ({
  useUser: () => ({
    userData: { groups: [], clinics: [], primary_clinic: { id: 1 } },
    isLoading: false,
  }),
}));

vi.mock("@/providers/toast-provider", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

vi.mock("@/features/visits/services/visits.service", async () => {
  const actual = await vi.importActual<
    typeof import("@/features/visits/services/visits.service")
  >("@/features/visits/services/visits.service");
  return {
    ...actual,
    fetchVisits: vi.fn().mockResolvedValue({
      results: [],
      pagination: { count: 0, next: null, previous: null },
    }),
    fetchVisitQueueSummary: vi.fn().mockResolvedValue(null),
  };
});

vi.mock("@/features/clinical-opd/services/clinical-opd.service", async () => {
  const actual = await vi.importActual<
    typeof import("@/features/clinical-opd/services/clinical-opd.service")
  >("@/features/clinical-opd/services/clinical-opd.service");
  return {
    ...actual,
    fetchIncomingReferralsAwaitingStart: vi.fn().mockResolvedValue([]),
    fetchMyClinicalCapabilities: vi.fn().mockResolvedValue({ capabilities: [] }),
  };
});

vi.mock("@/features/appointments/services/appointments.service", async () => {
  const actual = await vi.importActual<
    typeof import("@/features/appointments/services/appointments.service")
  >("@/features/appointments/services/appointments.service");
  return {
    ...actual,
    fetchAppointments: vi.fn().mockResolvedValue({
      results: [],
      pagination: { count: 0, next: null, previous: null },
    }),
    fetchAppointmentSummaryStats: vi.fn().mockResolvedValue(null),
  };
});

vi.mock("@/features/clinical/services/clinical-catalog.service", () => ({
  fetchClinicalClinics: vi.fn().mockResolvedValue([]),
}));

afterEach(() => {
  cleanup();
});

describe("list empty states", () => {
  it("uses the clients empty-state type size for visits and referrals", () => {
    render(
      <>
        <ActiveVisitsEmptyState />
        <IncomingReferralsEmptyState />
      </>,
    );

    expect(screen.getByRole("heading", { name: "No active visits" })).toHaveClass(
      "text-base",
    );
    expect(
      screen.getByRole("heading", { name: "No pending referrals" }),
    ).toHaveClass("text-base");
  });

  it("hides active visit header actions when the queue is empty", async () => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    render(
      <QueryClientProvider client={client}>
        <ActiveVisitsListPage />
      </QueryClientProvider>,
    );

    expect(await screen.findByTestId("active-visits-empty-state")).toBeInTheDocument();
    expect(screen.queryByTestId("active-visits-search")).not.toBeInTheDocument();
    expect(screen.queryByTestId("active-visits-search-submit")).not.toBeInTheDocument();
    expect(screen.queryByTestId("active-visits-filters-button")).not.toBeInTheDocument();
  });

  it("hides referral header actions when there are no referrals", async () => {
    render(<IncomingReferralsListPage />);

    expect(
      await screen.findByTestId("incoming-referrals-empty-state"),
    ).toBeInTheDocument();
    expect(screen.queryByTestId("incoming-referrals-search")).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("incoming-referrals-search-submit"),
    ).not.toBeInTheDocument();
  });

  it("hides appointment header actions when there are no appointments", async () => {
    render(<AppointmentsListPage />);

    expect(await screen.findByTestId("appointments-empty-state")).toBeInTheDocument();
    expect(screen.queryByTestId("appointments-search")).not.toBeInTheDocument();
    expect(screen.queryByTestId("new-appointment-button")).not.toBeInTheDocument();
    expect(screen.queryByTestId("appointments-filters-button")).not.toBeInTheDocument();
  });
});
