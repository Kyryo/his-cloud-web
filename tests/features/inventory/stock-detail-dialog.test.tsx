import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { StockDetailDialog } from "@/features/inventory/components/StockDetailDialog";
import type { InventoryStock } from "@/features/inventory/types/inventory.types";

afterEach(() => {
  cleanup();
});

const stock: InventoryStock = {
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
};

describe("StockDetailDialog", () => {
  it("renders stock details in a sheet", () => {
    render(
      <StockDetailDialog stock={stock} open onOpenChange={() => undefined} />,
    );

    expect(screen.getByTestId("stock-detail-dialog")).toBeInTheDocument();
    expect(screen.getAllByText("Paracetamol 500mg").length).toBeGreaterThan(0);
    expect(screen.getByText("ID 44")).toBeInTheDocument();
    expect(screen.getByText("On hand")).toBeInTheDocument();
    expect(screen.getByText("24")).toBeInTheDocument();
    expect(screen.getByText("Main store")).toBeInTheDocument();
    expect(screen.getByText("In stock")).toBeInTheDocument();
  });
});
