import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { OhEmployeesListPage } from "@/features/occupational-health/pages/OhEmployeesListPage";

const fetchCustomersMock = vi.hoisted(() =>
  vi.fn().mockResolvedValue({
    results: [],
    pagination: { count: 0, next: null, previous: null },
  }),
);

const fetchCustomerSummaryStatsMock = vi.hoisted(() =>
  vi.fn().mockResolvedValue(null),
);

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/providers/user-provider", () => ({
  useUser: () => ({
    userData: {
      groups: ["OccupationalHealth"],
      enabled_modules: ["OccupationalHealth", "Registration"],
      primary_clinic: { id: 1 },
    },
    isLoading: false,
  }),
}));

vi.mock("@/providers/toast-provider", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

vi.mock("@/features/customers/services/customers.service", () => ({
  fetchCustomers: fetchCustomersMock,
}));

vi.mock("@/features/customers/utils/customer-stats", () => ({
  fetchCustomerSummaryStats: fetchCustomerSummaryStatsMock,
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("OhEmployeesListPage empty state", () => {
  it("hides search and filters when there are no employees", async () => {
    render(<OhEmployeesListPage />);

    expect(await screen.findByTestId("oh-employees-empty-state")).toBeInTheDocument();
    expect(screen.queryByTestId("customers-search")).not.toBeInTheDocument();
    expect(screen.queryByTestId("customers-filters-button")).not.toBeInTheDocument();
    expect(screen.queryByTestId("add-client-fab")).not.toBeInTheDocument();

    await waitFor(() => {
      expect(fetchCustomersMock).toHaveBeenCalledWith(
        expect.objectContaining({ hasEmploymentEpisode: true }),
      );
    });
    expect(fetchCustomerSummaryStatsMock).toHaveBeenCalledWith({
      hasEmploymentEpisode: true,
    });
  });
});
