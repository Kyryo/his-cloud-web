import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { LineExcessBadge } from "@/features/sales-orders/components/detail/LineExcessBadge";
import { LineNonPayableBadge } from "@/features/sales-orders/components/detail/LineNonPayableBadge";
import { LinePricingBreakdownDialog } from "@/features/sales-orders/components/detail/LinePricingBreakdownDialog";
import type { SalesOrderLine } from "@/features/sales-orders/types/sales-order.types";

afterEach(() => {
  cleanup();
});

describe("LineExcessBadge", () => {
  it("shows an excess badge when hasExcess is true", () => {
    render(<LineExcessBadge hasExcess />);
    expect(screen.getByText("Excess")).toBeInTheDocument();
  });

  it("shows a dash when hasExcess is false", () => {
    render(<LineExcessBadge hasExcess={false} />);
    expect(screen.getByText("—")).toBeInTheDocument();
  });
});

describe("LineNonPayableBadge", () => {
  it("shows a non-payable badge", () => {
    render(<LineNonPayableBadge />);
    expect(screen.getByLabelText(/Non-payable/)).toHaveTextContent("NP");
  });
});

describe("LinePricingBreakdownDialog", () => {
  const line: SalesOrderLine = {
    id: 1,
    name: "Consultation",
    product_id: 9,
    quantity: "1",
    price_unit: "108.00",
    price_total: "108.00",
    is_payable: true,
    list_price_at_order: "100.00",
    pricelist_amount_at_order: "80.00",
    insurer_due: "80.00",
    client_due: "28.00",
    has_excess: false,
    excess_amount: "0.00",
    pricing_rule_snapshot: {
      rule_name: "Corporate co-pay",
      rule_types: ["CO_PAYMENT", "FORMULA"],
      client_liability_formula: "(list_price - pricelist_amount) + (pricelist_amount * 0.10)",
    },
  };

  it("renders grouped pricing inputs and payment split without duplicate co-payment", () => {
    render(
      <LinePricingBreakdownDialog
        line={line}
        capturedAt="2026-06-27T10:30:00Z"
        open
        onOpenChange={() => undefined}
      />,
    );

    expect(screen.getByText("Consultation")).toBeInTheDocument();
    expect(screen.getByText(/Snapshot · Corporate co-pay ·/)).toBeInTheDocument();
    expect(screen.getByTestId("tabbed-dialog-tab-pricing")).toBeInTheDocument();
    expect(screen.getByTestId("tabbed-dialog-tab-tariff-code")).toBeInTheDocument();
    expect(screen.getByText("Pricing inputs")).toBeInTheDocument();
    expect(screen.getByText("Payment split")).toBeInTheDocument();
    expect(screen.queryByText("Co-payment")).not.toBeInTheDocument();
    expect(screen.getByText("Corporate co-pay")).toBeInTheDocument();
    expect(screen.getByText("Co-payment, Formula")).toBeInTheDocument();
    expect(
      screen.getByText("(list_price - pricelist_amount) + (pricelist_amount * 0.10)"),
    ).toBeInTheDocument();
    expect(screen.getByText("Insurer due")).toBeInTheDocument();
    expect(screen.getByText("Client due")).toBeInTheDocument();
    expect(screen.getByText("Line total")).toBeInTheDocument();
    expect(screen.getAllByText("80.00").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("28.00")).toBeInTheDocument();
    expect(screen.getByText("108.00")).toBeInTheDocument();
    expect(screen.queryByText("Excess")).not.toBeInTheDocument();
  });

  it("shows sync when a tariff code already exists", () => {
    const onSync = vi.fn();
    const lineWithTariff: SalesOrderLine = {
      ...line,
      tariff_code: "21129",
    };

    render(
      <LinePricingBreakdownDialog
        line={lineWithTariff}
        open
        onOpenChange={() => undefined}
        onSyncTariffCode={onSync}
      />,
    );

    fireEvent.click(screen.getByTestId("tabbed-dialog-tab-tariff-code"));
    expect(screen.getByTestId("line-tariff-code-input")).toHaveValue("21129");
    fireEvent.click(screen.getByTestId("sync-line-tariff-code-button"));
    expect(onSync).toHaveBeenCalledTimes(1);
  });

  it("shows an odontogram tab for dental procedure lines", () => {
    const dentalProcedure: SalesOrderLine = {
      ...line,
      is_procedure: true,
      dental: [{ id: 1, tooth_number: 16 }],
    };

    render(
      <LinePricingBreakdownDialog
        line={dentalProcedure}
        open
        onOpenChange={() => undefined}
        showOdontogramTab
        canEditTeeth
        onSaveTeeth={async () => undefined}
      />,
    );

    expect(screen.getByTestId("tabbed-dialog-tab-odontogram")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("tabbed-dialog-tab-odontogram"));
    expect(screen.getByTestId("line-odontogram-tab")).toBeInTheDocument();
    expect(screen.getByTestId("line-odontogram-save-button")).toBeDisabled();
  });
});
