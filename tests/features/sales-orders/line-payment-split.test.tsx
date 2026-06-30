import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { LineExcessBadge } from "@/features/sales-orders/components/detail/LineExcessBadge";
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

    expect(screen.getByText("Pricing breakdown")).toBeInTheDocument();
    expect(screen.getByText(/Snapshot · Corporate co-pay ·/)).toBeInTheDocument();
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

  it("degrades gracefully for list-price-only lines", () => {
    const listPriceLine: SalesOrderLine = {
      id: 2,
      name: "Sundry item",
      product_id: 10,
      quantity: "1",
      price_unit: "50.00",
      price_total: "50.00",
      is_payable: false,
      list_price_at_order: "50.00",
      insurer_due: "0.00",
      client_due: "50.00",
      pricing_rule_snapshot: {},
    };

    render(
      <LinePricingBreakdownDialog
        line={listPriceLine}
        open
        onOpenChange={() => undefined}
      />,
    );

    expect(screen.getByText(/Snapshot · List price/)).toBeInTheDocument();
    expect(screen.getByText("List price")).toBeInTheDocument();
    expect(screen.queryByText("Insurer due")).not.toBeInTheDocument();
    expect(screen.getByText("Client due")).toBeInTheDocument();
    expect(screen.getAllByText("50.00").length).toBeGreaterThanOrEqual(1);
  });
});
