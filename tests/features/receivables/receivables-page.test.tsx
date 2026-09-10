import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ReceivablesPage } from "@/features/receivables/pages/ReceivablesPage";

const {
  fetchReceivablesDebtors,
  fetchReceivablesInvoices,
  fetchReceivablesSummaryStats,
  searchParamsGet,
} = vi.hoisted(() => ({
  fetchReceivablesDebtors: vi.fn(),
  fetchReceivablesInvoices: vi.fn(),
  fetchReceivablesSummaryStats: vi.fn(),
  searchParamsGet: vi.fn((key: string) => {
    if (key === "view") {
      return null;
    }
    return null;
  }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => ({
    get: searchParamsGet,
  }),
}));

vi.mock("@/features/receivables/services/receivables.service", () => ({
  fetchReceivablesDebtors,
  fetchReceivablesInvoices,
  fetchReceivablesSummaryStats,
}));

afterEach(() => {
  cleanup();
});

describe("ReceivablesPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    searchParamsGet.mockImplementation(() => null);
    fetchReceivablesDebtors.mockResolvedValue({
      results: [
        {
          customer_uuid: "cust-1",
          customer_identifier: "CLINIC-000101",
          customer_name: "Tahir Mussa",
          opening_balance: "6800000.00",
          total_invoiced: "0.00",
          total_paid: "0.00",
          total_due: "6800000.00",
        },
      ],
      pagination: { count: 213, next: null, previous: null },
    });
    fetchReceivablesInvoices.mockResolvedValue({
      results: [],
      pagination: { count: 183, next: null, previous: null },
    });
    fetchReceivablesSummaryStats.mockResolvedValue({
      debtors_count: 213,
      total_receivable: "111285739.00",
      open_invoice_count: 183,
      aging: {
        "0-30": { count: 70, total: "5885830.00" },
        "31-60": { count: 113, total: "17681290.00" },
        "61-90": { count: 0, total: "0.00" },
        "90+": { count: 0, total: "0.00" },
      },
    });
  });

  it("renders debtors and summary totals", async () => {
    render(<ReceivablesPage />);

    await waitFor(() => {
      expect(screen.getByText("Tahir Mussa")).toBeInTheDocument();
    });

    expect(screen.getByText("000101")).toBeInTheDocument();
    expect(screen.getByText("Opening balance")).toBeInTheDocument();
    expect(screen.getByText("Outstanding")).toBeInTheDocument();
    expect(fetchReceivablesDebtors).toHaveBeenCalledTimes(1);
    expect(fetchReceivablesInvoices).not.toHaveBeenCalled();
  });

  it("loads open invoices when the view param is set", async () => {
    searchParamsGet.mockImplementation((key: string) =>
      key === "view" ? "invoices" : null,
    );
    fetchReceivablesInvoices.mockResolvedValue({
      results: [
        {
          invoice_uuid: "inv-1",
          invoice_number: "INV/00193",
          invoice_date: "2026-09-10",
          customer_uuid: "cust-2",
          customer_identifier: "CLINIC-001323",
          customer_name: "Chinelo Kanynji",
          amount_total: "43400.00",
          amount_paid: "0.00",
          balance: "43400.00",
          days_outstanding: 0,
          aging_bucket: "0-30",
          currency: "MWK",
        },
      ],
      pagination: { count: 183, next: null, previous: null },
    });

    render(<ReceivablesPage />);

    await waitFor(() => {
      expect(screen.getByText("INV/00193")).toBeInTheDocument();
    });

    expect(screen.getByText("Chinelo Kanynji")).toBeInTheDocument();
    expect(screen.getAllByText("0–30 days").length).toBeGreaterThan(0);
    expect(fetchReceivablesInvoices).toHaveBeenCalledTimes(1);
    expect(fetchReceivablesDebtors).not.toHaveBeenCalled();
  });
});
