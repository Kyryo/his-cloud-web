import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import {
  SalesOrderEditableLineList,
  SalesOrderReadOnlyLineList,
} from "@/features/sales-orders/components/detail/SalesOrderLineList";
import type { SalesOrder } from "@/features/sales-orders/types/sales-order.types";
import type { SalesOrderLineDraft } from "@/features/sales-orders/types/sales-order-line-draft";

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

afterEach(() => {
  cleanup();
});

describe("SalesOrderReadOnlyLineList", () => {
  it("aligns each line value under the matching header", () => {
    render(<SalesOrderReadOnlyLineList order={order} />);

    const table = screen.getByRole("table");
    const headers = within(table)
      .getAllByRole("columnheader")
      .map((header) => header.textContent?.trim());
    expect(headers).toEqual(["Item", "Tariff", "Qty", "Price", "Total", "Actions"]);

    const row = within(table).getAllByRole("row")[1];
    const cells = within(row).getAllByRole("cell");
    expect(cells[0]).toHaveTextContent("Consultation");
    expect(cells[1]).toHaveTextContent("CONS-01");
    expect(cells[2]).toHaveTextContent("1");
    expect(cells[3]).toHaveTextContent("15,000.00");
    expect(cells[4]).toHaveTextContent("15,000.00");
  });
});

describe("SalesOrderEditableLineList", () => {
  it("renders the add action below the last row", () => {
    const lines = [
      {
        key: "line-1",
        productName: "Consultation",
        tariff_code: "CONS-01",
        quantity: "1",
        price_unit: "15000",
        price_total: "15000",
        product_id: 3,
      },
    ] as SalesOrderLineDraft[];

    render(
      <SalesOrderEditableLineList
        order={order}
        lines={lines}
        editingRowKey={null}
        activeRowKey={null}
        isSaving={false}
        footerAction={<button type="button">Add line item</button>}
        onEdit={() => undefined}
        onActivate={() => undefined}
        onUpdate={() => undefined}
        onSelectProduct={() => undefined}
        onRemove={() => undefined}
        onViewDetails={() => undefined}
        onPriceBlur={() => undefined}
      />,
    );

    const table = screen.getByTestId("sales-order-lines-list");
    const add = screen.getByRole("button", { name: "Add line item" });
    expect(table.contains(add)).toBe(true);
    expect(add.closest("tfoot")).toBeTruthy();
  });
});
