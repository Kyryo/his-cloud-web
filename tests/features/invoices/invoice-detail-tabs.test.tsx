import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { InvoiceDetailTabs } from "@/features/invoices/components/detail/InvoiceDetailTabs";
import type { Invoice } from "@/features/invoices/types/invoice.types";
import { INVOICE_DETAIL_TABS } from "@/features/invoices/utils/invoice-detail-tabs";

vi.mock("@/features/invoices/components/detail/InvoiceDetailLinesTab", () => ({
  InvoiceDetailLinesTab: () => <div>Lines tab</div>,
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

vi.mock("@/features/invoices/components/detail/InvoiceSummaryPanel", () => ({
  InvoiceSummaryPanel: () => null,
}));

const invoice = {
  id: 81,
  uuid: "c356dab6-4349-408b-bc23-dd98d08b9dbf",
  name: "INV/2026/0001",
  state: "posted",
  lines: [{ id: 1, name: "Consultation" }],
} as unknown as Invoice;

describe("invoice detail tabs", () => {
  it("defines icons for every section", () => {
    expect(INVOICE_DETAIL_TABS.map((tab) => tab.icon)).toEqual([
      "clipboard",
      "user",
      "shield",
      "wallet",
      "stethoscope",
      "activity",
    ]);
  });

  it("renders underline tab labels with line count", () => {
    render(<InvoiceDetailTabs invoice={invoice} />);

    expect(screen.getByRole("button", { name: /Line items/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Line items/ })).toHaveTextContent("1");
    expect(screen.getByRole("button", { name: "Client" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Payments" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Diagnoses" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Activity" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Claim/ })).not.toBeInTheDocument();
  });
});
