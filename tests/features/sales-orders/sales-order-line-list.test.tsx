import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SalesOrderReadOnlyLineList } from "@/features/sales-orders/components/detail/SalesOrderLineList";
import type { SalesOrder } from "@/features/sales-orders/types/sales-order.types";

const order = {
  id: 81,
  uuid: "234ab87e-7831-4ba6-af32-f98ef80e3127",
  name: "SO00081",
  state: "sale",
  amount_total: "15000",
  currency: "MWK",
  lines: [
    {
      id: 11,
      name: "Consultation",
      quantity: 1,
      price_unit: "15000",
      price_total: "15000",
      tariff_code: "CONS-01",
      is_payable: true,
    },
  ],
} as unknown as SalesOrder;

describe("SalesOrderReadOnlyLineList", () => {
  it("renders line items as a list instead of a table", () => {
    render(<SalesOrderReadOnlyLineList order={order} />);

    expect(screen.getByTestId("sales-order-lines-list")).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(screen.getByText("Consultation")).toBeInTheDocument();
    expect(screen.getByText(/CONS-01/)).toBeInTheDocument();
    expect(screen.getAllByText("15,000.00").length).toBeGreaterThan(0);
  });
});
