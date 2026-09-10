import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { InternalOrdersTable } from "@/features/inventory/components/tables/internal-orders-table";
import { MovementsTable } from "@/features/inventory/components/tables/movements-table";
import { PurchaseOrdersTable } from "@/features/inventory/components/tables/purchase-orders-table";
import { StockAdjustmentsTable } from "@/features/inventory/components/tables/stock-adjustments-table";
import type {
  InternalOrder,
  InventoryMovement,
  PurchaseOrder,
  StockAdjustment,
} from "@/features/inventory/types/inventory.types";

afterEach(() => {
  cleanup();
});

describe("inventory document tables", () => {
  it("renders purchase order identity, vendor, and status", () => {
    const order: PurchaseOrder = {
      id: 1,
      uuid: "po-1",
      tenant: 1,
      reference_number: "PO-104",
      vendor_name: "MedSupply Ltd",
      vendor_id: 9,
      lpo_number: "LPO-9",
      grn_number: null,
      delivery_date: "2026-09-10",
      invoice_number: null,
      invoice_date: null,
      receiving_location: 2,
      status: "SUBMITTED",
      created_by: 1,
      received_by: null,
      received_at: null,
      confirmed_by: null,
      confirmed_at: null,
      notes: null,
      total_value: 250,
      lines: [],
      is_active: true,
      created_at: "2026-09-01T00:00:00Z",
      updated_at: "2026-09-01T00:00:00Z",
    };

    render(<PurchaseOrdersTable orders={[order]} />);

    expect(screen.getByText("PO-104")).toBeInTheDocument();
    expect(screen.getByText("LPO LPO-9")).toBeInTheDocument();
    expect(screen.getByText("MedSupply Ltd")).toBeInTheDocument();
    expect(screen.getByText("Submitted")).toBeInTheDocument();
    expect(screen.getByText("250")).toBeInTheDocument();
  });

  it("renders internal order route chips", () => {
    const order: InternalOrder = {
      id: 1,
      uuid: "io-1",
      tenant: 1,
      reference_number: "IO-22",
      source_location: 1,
      source_location_name: "Main store",
      destination_location: 2,
      destination_location_name: "Pharmacy",
      status: "DISPATCHED",
      created_by: 1,
      created_by_name: "Ada Lovelace",
      requested_by: null,
      approved_by: null,
      dispatched_by: null,
      received_by: null,
      approved_at: null,
      dispatched_at: null,
      received_at: null,
      notes: "Ward restock",
      lines: [],
      is_active: true,
      created_at: "2026-09-01T00:00:00Z",
      updated_at: "2026-09-01T00:00:00Z",
    };

    render(<InternalOrdersTable orders={[order]} />);

    expect(screen.getByText("IO-22")).toBeInTheDocument();
    expect(screen.getByText("Ward restock")).toBeInTheDocument();
    expect(screen.getByText("Main store")).toBeInTheDocument();
    expect(screen.getByText("Pharmacy")).toBeInTheDocument();
    expect(screen.getByText("Dispatched")).toBeInTheDocument();
    expect(screen.getByText("Ada Lovelace")).toBeInTheDocument();
  });

  it("renders stock adjustment reason and location", () => {
    const adjustment: StockAdjustment = {
      id: 1,
      uuid: "adj-1",
      tenant: 1,
      reference_number: "ADJ-7",
      location: 2,
      location_name: "Cold room",
      adjustment_type: "COST",
      status: "APPLIED",
      reason: "Price correction",
      created_by: 1,
      created_by_name: "Ada",
      approved_by: null,
      applied_by: null,
      approved_at: null,
      applied_at: null,
      notes: null,
      lines: [],
      is_active: true,
      created_at: "2026-09-01T00:00:00Z",
      updated_at: "2026-09-01T00:00:00Z",
    };

    render(<StockAdjustmentsTable adjustments={[adjustment]} />);

    expect(screen.getByText("ADJ-7")).toBeInTheDocument();
    expect(screen.getByText("Price correction")).toBeInTheDocument();
    expect(screen.getByText("Cost")).toBeInTheDocument();
    expect(screen.getByText("Applied")).toBeInTheDocument();
    expect(screen.getByText("Cold room")).toBeInTheDocument();
  });

  it("renders movement product, type, and quantity", () => {
    const movement: InventoryMovement = {
      id: 1,
      uuid: "mv-1",
      tenant: 1,
      movement_type: "PURCHASE_RECEIPT",
      reference_model: "purchase_order",
      reference_id: "1",
      product_id: 44,
      product_name: "ORS sachets",
      batch: 3,
      batch_number: "LOT-2",
      from_location: null,
      from_location_name: null,
      to_location: 2,
      to_location_name: "Main store",
      quantity: 18,
      unit_cost: 1,
      total_cost: 18,
      notes: null,
      created_at: "2026-09-01T00:00:00Z",
    };

    render(<MovementsTable items={[movement]} />);

    expect(screen.getByText("ORS sachets")).toBeInTheDocument();
    expect(screen.getByText("ID 44 · Batch LOT-2")).toBeInTheDocument();
    expect(screen.getByText("Purchase Receipt")).toBeInTheDocument();
    expect(screen.getByText("Main store")).toBeInTheDocument();
    expect(screen.getByText("18")).toBeInTheDocument();
  });
});
