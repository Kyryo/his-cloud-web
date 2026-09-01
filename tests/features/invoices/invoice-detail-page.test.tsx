import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { InvoiceDetailPage } from "@/features/invoices/pages/InvoiceDetailPage";

const fetchInvoice = vi.fn();

vi.mock("@/features/app-shell/hooks/use-app-breadcrumb", () => ({
  useAppBreadcrumb: vi.fn(),
}));

vi.mock("@/features/invoices/services/invoices.service", () => ({
  fetchInvoice: (...args: unknown[]) => fetchInvoice(...args),
}));

afterEach(() => {
  cleanup();
});

describe("InvoiceDetailPage", () => {
  it("shows a detail skeleton while the invoice is loading", () => {
    fetchInvoice.mockReturnValue(new Promise(() => undefined));

    render(<InvoiceDetailPage invoiceId="81" />);

    expect(screen.getByTestId("invoice-detail-skeleton")).toBeInTheDocument();
  });
});
