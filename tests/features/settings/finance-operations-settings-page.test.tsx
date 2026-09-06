import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { FinanceOperationsSettingsPage } from "@/features/settings/pages/FinanceOperationsSettingsPage";

const useUser = vi.fn();
const fetchOrganizationPayers = vi.fn();
const fetchOrganizationPayerSchemes = vi.fn();
const fetchOrganizationPricelists = vi.fn();
const fetchOrganizationDefaultPricelist = vi.fn();

vi.mock("@/providers/user-provider", () => ({
  useUser: () => useUser(),
}));

vi.mock("@/providers/toast-provider", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

vi.mock("@/features/settings/services/settings.service", () => ({
  fetchOrganizationPayers: (...args: unknown[]) =>
    fetchOrganizationPayers(...args),
  fetchOrganizationPayerSchemes: (...args: unknown[]) =>
    fetchOrganizationPayerSchemes(...args),
  fetchOrganizationPricelists: (...args: unknown[]) =>
    fetchOrganizationPricelists(...args),
  fetchOrganizationDefaultPricelist: (...args: unknown[]) =>
    fetchOrganizationDefaultPricelist(...args),
  createOrganizationPayer: vi.fn(),
  createOrganizationPayerScheme: vi.fn(),
  createOrganizationPricelist: vi.fn(),
  updateOrganizationPayerScheme: vi.fn(),
  updateOrganizationPricelist: vi.fn(),
  archiveOrganizationPricelist: vi.fn(),
  setOrganizationDefaultPricelist: vi.fn(),
}));

afterEach(() => {
  cleanup();
  useUser.mockReset();
  fetchOrganizationPayers.mockReset();
  fetchOrganizationPayerSchemes.mockReset();
  fetchOrganizationPricelists.mockReset();
  fetchOrganizationDefaultPricelist.mockReset();
});

describe("FinanceOperationsSettingsPage", () => {
  it("restricts the page for non-admins", () => {
    useUser.mockReturnValue({
      userData: { is_admin: false },
      isLoading: false,
    });

    render(<FinanceOperationsSettingsPage />);

    expect(screen.getByText("Access restricted")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Back to account settings" }),
    ).toBeInTheDocument();
  });

  it("lists payers as rows and switches to schemes", async () => {
    useUser.mockReturnValue({
      userData: { is_admin: true },
      isLoading: false,
    });
    fetchOrganizationPayers.mockResolvedValue({
      results: [
        {
          id: 1,
          uuid: "payer-1",
          name: "MASM",
          code: "MAS",
          description: "Medical Aid Society of Malawi",
          phone_number: "012345",
          email: "masm@example.com",
          address: "",
          is_active: true,
          created_at: "2026-01-01T00:00:00Z",
        },
      ],
    });
    fetchOrganizationPayerSchemes.mockResolvedValue({ results: [] });
    fetchOrganizationPricelists.mockResolvedValue({ results: [] });
    fetchOrganizationDefaultPricelist.mockResolvedValue({
      default_pricelist_uuid: null,
    });

    render(<FinanceOperationsSettingsPage />);

    await waitFor(() => {
      expect(screen.getByText("MASM")).toBeInTheDocument();
    });
    expect(screen.getByText("Medical Aid Society of Malawi")).toBeInTheDocument();
    expect(screen.getByText("MAS · masm@example.com · 012345")).toBeInTheDocument();
    expect(screen.queryByRole("columnheader")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Payer schemes" }));

    await waitFor(() => {
      expect(
        screen.getByText(
          "No schemes yet. Add a plan for a payer to use on visits and invoices.",
        ),
      ).toBeInTheDocument();
    });
  });
});
