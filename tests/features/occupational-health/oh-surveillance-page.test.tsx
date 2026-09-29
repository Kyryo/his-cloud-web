import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { OhSurveillancePage } from "@/features/occupational-health/pages/OhSurveillancePage";

vi.mock("@/providers/user-provider", () => ({
  useUser: () => ({
    isLoading: false,
    userData: { groups: ["OccupationalHealth"] },
  }),
}));

vi.mock("@/features/occupational-health/hooks/use-occupational-health", () => ({
  useOhSurveillanceRequirements: () => ({
    data: [
      {
        id: 1,
        uuid: "req-1",
        employment_episode: 10,
        exam_battery_rule: 2,
        due_date: "2026-04-01",
        status: "due",
        completed_examination: null,
        created_at: "",
        updated_at: "",
      },
    ],
    isLoading: false,
    error: null,
    refetch: vi.fn(),
  }),
  useOhCampaignQueue: () => ({
    data: [
      {
        customer_uuid: "cust-1",
        customer_identifier: "E001",
        customer_name: "Jane Doe",
        employer: "Acme",
        job_title: "Operator",
        site: "Plant A",
        component_code: "audiometry",
        exam_type: "periodic",
        due_date: "2026-04-01",
        status: "due",
      },
    ],
    isLoading: false,
    error: null,
    refetch: vi.fn(),
  }),
}));

afterEach(() => {
  cleanup();
});

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <OhSurveillancePage />
    </QueryClientProvider>,
  );
}

describe("OhSurveillancePage", () => {
  it("renders surveillance sections", () => {
    renderPage();

    expect(screen.getByTestId("oh-surveillance-page")).toBeInTheDocument();
    expect(screen.getByText("Due & overdue requirements")).toBeInTheDocument();
    expect(screen.getByTestId("oh-campaign-queue-section")).toBeInTheDocument();
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
  });
});
