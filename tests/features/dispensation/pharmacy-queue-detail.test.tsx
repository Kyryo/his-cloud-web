import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { PharmacyQueueDetailHeader } from "@/features/dispensation/components/PharmacyQueueDetailHeader";
import { PharmacyQueueLineItemsTab } from "@/features/dispensation/components/PharmacyQueueLineItemsTab";
import type { DispensationQueueDetail } from "@/features/dispensation/types/dispensation.types";

afterEach(() => {
  cleanup();
});

const detail: DispensationQueueDetail = {
  uuid: "so-1",
  id: 41,
  name: "SO-104",
  state: "sale",
  invoice_status: "to invoice",
  clinic_id: 2,
  clinic_name: "City Clinic",
  date_order: "2026-09-01T10:00:00Z",
  customer_id: 9,
  customer_name: "Ada Lovelace",
  lines: [
    {
      id: 1,
      uuid: "line-1",
      product_id: 10,
      product_uuid: "prod-1",
      product_name: "Paracetamol 500mg",
      quantity: "10",
      dispensed_quantity: "4",
      remaining_quantity: "6",
    },
    {
      id: 2,
      uuid: "line-2",
      product_id: 11,
      product_uuid: "prod-2",
      product_name: "ORS sachets",
      quantity: "8",
      dispensed_quantity: "8",
      remaining_quantity: "0",
    },
  ],
};

describe("PharmacyQueueDetailHeader", () => {
  it("shows the client, order, and dispensation status", () => {
    render(
      <PharmacyQueueDetailHeader
        detail={detail}
        customerUuid="cust-1"
      />,
    );

    expect(screen.getByRole("link", { name: "Ada Lovelace" })).toHaveAttribute(
      "href",
      "/customers/cust-1",
    );
    expect(screen.getByText("SO-104")).toBeInTheDocument();
    expect(screen.getByText("Partial")).toBeInTheDocument();
    expect(screen.getByText("City Clinic")).toBeInTheDocument();
    expect(screen.getByText("1 of 2 lines waiting")).toBeInTheDocument();
  });
});

describe("PharmacyQueueLineItemsTab", () => {
  it("renders product progress and remaining status", () => {
    render(
      <PharmacyQueueLineItemsTab
        detail={detail}
        isActive
        selectedLineUuids={["line-1"]}
        onSelectedLineUuidsChange={() => undefined}
        canManageLines={false}
        onEdit={() => undefined}
        onDelete={() => undefined}
      />,
    );

    expect(screen.getByText("Paracetamol 500mg")).toBeInTheDocument();
    expect(screen.getByText("ORS sachets")).toBeInTheDocument();
    expect(screen.getByText("Partial")).toBeInTheDocument();
    expect(screen.getByText("Complete")).toBeInTheDocument();
    expect(screen.getByLabelText("Select Paracetamol 500mg")).toBeChecked();
    expect(screen.getByLabelText("Select ORS sachets")).toBeDisabled();
  });
});
