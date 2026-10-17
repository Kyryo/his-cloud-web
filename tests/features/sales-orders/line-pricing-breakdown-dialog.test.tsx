import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { LinePricingBreakdownDialog } from "@/features/sales-orders/components/detail/LinePricingBreakdownDialog";
import type { SalesOrderLine } from "@/features/sales-orders/types/sales-order.types";

const line: SalesOrderLine = {
  id: 4,
  name: "FCB (3 Part)",
  product_id: 10,
  quantity: 1,
  price_unit: "75.00",
  price_total: "80.00",
  is_payable: true,
  insurer_due: "75.00",
  client_due: "5.00",
  has_excess: true,
  excess_amount: "5.00",
  list_price_at_order: "100.00",
  pricelist_amount_at_order: "75.00",
  pricing_rule_snapshot: {
    rule_name: "Gold cap",
    rule_types: ["CO_PAYMENT", "EXCESS"],
    client_liability_formula: "list_price - pricelist_amount",
  },
};

afterEach(() => {
  cleanup();
});

describe("line pricing breakdown dialog", () => {
  it("shows the payment split table and keeps pricing inputs on their own tab", () => {
    const onSetPayability = vi.fn();

    render(
      <LinePricingBreakdownDialog
        open
        line={line}
        onOpenChange={vi.fn()}
        canChangePayability
        onSetPayability={onSetPayability}
      />,
    );

    const table = screen.getByTestId("line-payment-split-table");
    expect(table).toHaveTextContent("Insurer due");
    expect(table).toHaveTextContent("Client due");
    expect(table).toHaveTextContent("Payable");
    expect(screen.getByText("Excess")).toBeInTheDocument();
    expect(screen.getByText("Line total")).toBeInTheDocument();
    expect(screen.queryByText("List price")).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId("line-payability-toggle"));
    expect(onSetPayability).toHaveBeenCalledWith(false);

    fireEvent.click(screen.getByRole("button", { name: "Inputs" }));
    expect(screen.getByText("List price")).toBeInTheDocument();
    expect(screen.getByText("Pricelist amount")).toBeInTheDocument();
    expect(screen.getByText("Rule name")).toBeInTheDocument();
    expect(screen.getByText("Gold cap")).toBeInTheDocument();
    expect(screen.getByText("Rule types")).toBeInTheDocument();
    expect(screen.getByText("Co-payment, Excess")).toBeInTheDocument();
    expect(screen.getByText("list_price - pricelist_amount")).toBeInTheDocument();
    expect(screen.queryByTestId("line-payment-split-table")).not.toBeInTheDocument();
  });

  it("keeps payability display-only when editing is not offered", () => {
    render(
      <LinePricingBreakdownDialog open line={line} onOpenChange={vi.fn()} />,
    );

    expect(screen.getAllByText("Payable").length).toBeGreaterThan(0);
    expect(screen.queryByTestId("line-payability-toggle")).not.toBeInTheDocument();
  });
});
