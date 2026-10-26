import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { OhQueuePage } from "@/features/occupational-health/pages/OhQueuePage";

const AUTHORIZED_USER = {
  isLoading: false,
  userData: {
    groups: ["OccupationalHealth"],
    enabled_modules: ["OccupationalHealth"],
  },
};

const useUserMock = vi.fn(() => AUTHORIZED_USER);

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

vi.mock("@/providers/user-provider", () => ({
  useUser: () => useUserMock(),
}));

vi.mock("@/features/occupational-health/hooks/use-occupational-health", () => ({
  useOhEncounters: () => ({
    data: [
      {
        id: 1,
        uuid: "enc-1",
        visit: "visit-1",
        customer_uuid: "cust-1",
        customer_name: "Jane Doe",
        department: "dept-1",
        department_name: "Occupational Health",
        department_type: "occupational_health",
        location: null,
        location_name: null,
        clinician: null,
        clinician_name: "Dr OH",
        status: "waiting",
        billing_mode: null,
        started_at: "2026-01-01T10:00:00Z",
        ended_at: null,
        notes: "",
        is_active: true,
        created_at: "2026-01-01T10:00:00Z",
        updated_at: "2026-01-01T10:00:00Z",
      },
    ],
    isLoading: false,
    isFetching: false,
    error: null,
    refetch: vi.fn(),
  }),
}));

afterEach(() => {
  cleanup();
  useUserMock.mockReturnValue(AUTHORIZED_USER);
});

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <OhQueuePage />
    </QueryClientProvider>,
  );
}

describe("OhQueuePage", () => {
  it("renders OH queue rows for authorized users", async () => {
    renderPage();

    expect(screen.getByTestId("oh-queue-page")).toBeInTheDocument();
    expect(screen.getByTestId("oh-queue-search")).toBeInTheDocument();
    expect(await screen.findByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open" })).toHaveAttribute(
      "href",
      "/occupational-health/visit-1/enc-1",
    );
  });

  it("shows a modern access denied blank state without OccupationalHealth", () => {
    useUserMock.mockReturnValue({
      isLoading: false,
      userData: { groups: ["Clinical"] },
    });

    renderPage();

    expect(screen.getByTestId("oh-queue-page")).toBeInTheDocument();
    expect(screen.getByText("Access denied")).toBeInTheDocument();
    expect(
      screen.getByText(/OccupationalHealth group/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Back to overview" }),
    ).toHaveAttribute("href", "/overview");
  });
});
