import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { InvoiceDetailTabs } from "@/features/invoices/components/detail/InvoiceDetailTabs";
import type { Invoice } from "@/features/invoices/types/invoice.types";
import { INVOICE_DETAIL_TABS } from "@/features/invoices/utils/invoice-detail-tabs";

vi.mock("@/features/invoices/components/detail/InvoiceDetailLinesTab", () => ({
  InvoiceDetailLinesTab: () => <div>Lines on invoice</div>,
}));

vi.mock("@/features/invoices/components/detail/InvoiceDetailClientTab", () => ({
  InvoiceDetailClientTab: () => null,
}));

vi.mock("@/features/invoices/components/detail/InvoiceClaimsTab", () => ({
  InvoiceClaimsTab: () => null,
}));

vi.mock("@/features/invoices/components/detail/InvoiceDetailPaymentsTab", () => ({
  InvoiceDetailPaymentsTab: () => null,
}));

vi.mock("@/features/invoices/components/detail/InvoiceDiagnosesTab", () => ({
  InvoiceDiagnosesTab: () => null,
}));

vi.mock("@/features/invoices/components/detail/InvoiceDetailActivityTab", () => ({
  InvoiceDetailActivityTab: () => null,
}));

const invoice = {
  id: 81,
  uuid: "c356dab6-4349-408b-bc23-dd98d08b9dbf",
  name: "INV/2026/0001",
  state: "posted",
  lines: [{ id: 1, name: "Consultation" }],
} as unknown as Invoice;

describe("invoice detail tabs", () => {
  it("defines icons for every secondary section", () => {
    expect(INVOICE_DETAIL_TABS.map((tab) => tab.icon)).toEqual([
      "user",
      "shield",
      "wallet",
      "stethoscope",
      "activity",
    ]);
  });

  it("keeps line items on the page and tabs for the rest", () => {
    render(<InvoiceDetailTabs invoice={invoice} />);

    expect(screen.getByText("Items")).toBeInTheDocument();
    expect(screen.getByText("1 line")).toBeInTheDocument();
    expect(screen.getByText("Lines on invoice")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Client" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Payments" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Diagnoses" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Activity" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Line items/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Claim/ })).not.toBeInTheDocument();
  });
});
