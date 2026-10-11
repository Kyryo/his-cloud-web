import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { CustomersListPage } from "@/features/customers/pages/CustomersListPage";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/providers/user-provider", () => ({
  useUser: () => ({
    userData: { groups: [], primary_clinic: { id: 1 } },
    isLoading: false,
  }),
}));

vi.mock("@/providers/toast-provider", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

vi.mock("@/state/workspace.store", () => ({
  useWorkspaceStore: (
    selector: (state: { activeClinicId: number | null }) => unknown,
  ) => selector({ activeClinicId: 1 }),
}));

vi.mock("@/features/claims/hooks/use-masm-integration-enabled", () => ({
  useMasmIntegrationEnabled: () => false,
}));

vi.mock("@/features/customers/services/customers.service", () => ({
  fetchCustomers: vi.fn().mockResolvedValue({
    results: [],
    pagination: { count: 0, next: null, previous: null },
  }),
}));

vi.mock("@/features/settings/services/settings.service", () => ({
  fetchOrganizationPayers: vi.fn().mockResolvedValue({
    results: [
      {
        id: 1,
        uuid: "payer-1",
        name: "MASM",
        code: "MASM",
        is_active: true,
        registry_payer_detail: {
          uuid: "registry-masm",
          display_name: "MASM",
          status: "approved",
          integration_code: "MASM",
          code: "MASM",
          capabilities: ["member_search"],
          is_active: true,
        },
      },
    ],
    pagination: null,
  }),
}));

vi.mock("@/features/customers/utils/customer-stats", () => ({
  fetchCustomerSummaryStats: vi.fn().mockResolvedValue(null),
}));

afterEach(() => {
  cleanup();
});

describe("CustomersListPage empty state", () => {
  it("hides header actions and centers the empty state when there are no clients", async () => {
    render(<CustomersListPage />);

    expect(await screen.findByTestId("customers-empty-state")).toBeInTheDocument();
    expect(screen.getByTestId("add-first-client-button")).toBeInTheDocument();
    expect(screen.queryByTestId("customers-search")).not.toBeInTheDocument();
    expect(screen.queryByTestId("customers-search-submit")).not.toBeInTheDocument();
    expect(screen.queryByTestId("customers-filters-button")).not.toBeInTheDocument();
    expect(screen.queryByTestId("membership-search-button")).not.toBeInTheDocument();
    expect(screen.queryByTestId("add-client-button")).not.toBeInTheDocument();

    const emptyState = screen.getByTestId("customers-empty-state");
    expect(emptyState.parentElement).toHaveClass(
      "flex-1",
      "items-center",
      "justify-center",
    );

    await waitFor(() => {
      expect(screen.queryByTestId("customers-search")).not.toBeInTheDocument();
    });
  });
});
