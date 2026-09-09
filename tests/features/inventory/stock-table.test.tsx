import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { StockTable } from "@/features/inventory/components/tables/stock-table";
import type { InventoryStock } from "@/features/inventory/types/inventory.types";

afterEach(() => {
  cleanup();
});

function createStock(
  overrides: Partial<InventoryStock> = {},
): InventoryStock {
  return {
    id: 1,
    uuid: "stock-1",
    tenant: 1,
    location: 2,
    location_name: "Main store",
    product_id: 44,
    product_name: "Paracetamol 500mg",
    batch: 3,
    batch_number: "LOT-88",
    quantity_on_hand: 24,
    average_unit_cost: 2.5,
    is_active: true,
    created_at: "2026-09-01T00:00:00Z",
    updated_at: "2026-09-01T00:00:00Z",
    ...overrides,
  };
}

describe("StockTable", () => {
  it("renders product identity, location, batch, and line value", () => {
    render(<StockTable items={[createStock()]} />);

    expect(screen.getByText("Paracetamol 500mg")).toBeInTheDocument();
    expect(screen.getByText("ID 44")).toBeInTheDocument();
    expect(screen.getByText("Main store")).toBeInTheDocument();
    expect(screen.getByText("LOT-88")).toBeInTheDocument();
    expect(screen.getByText("In stock")).toBeInTheDocument();
    expect(screen.getByText("24")).toBeInTheDocument();
    expect(screen.getByText("60")).toBeInTheDocument();
    expect(screen.getByText("2.5 / unit")).toBeInTheDocument();
  });

  it("flags low and empty quantities and missing batches", () => {
    render(
      <StockTable
        items={[
          createStock({
            uuid: "low",
            product_name: "Amoxicillin 250mg",
            quantity_on_hand: 4,
            batch_number: null,
            batch: null,
          }),
          createStock({
            uuid: "out",
            product_name: "ORS sachets",
            quantity_on_hand: 0,
            is_active: false,
          }),
        ]}
      />,
    );

    expect(screen.getByText("Low stock")).toBeInTheDocument();
    expect(screen.getByText("Out of stock")).toBeInTheDocument();
    expect(screen.getByText("No batch")).toBeInTheDocument();
    expect(screen.getByText("Inactive")).toBeInTheDocument();
  });
});
