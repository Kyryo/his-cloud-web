import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SalesOrderDetailTabs } from "@/features/sales-orders/components/detail/SalesOrderDetailTabs";
import type { SalesOrder } from "@/features/sales-orders/types/sales-order.types";
import { SALES_ORDER_DETAIL_TABS } from "@/features/sales-orders/utils/sales-order-detail-tabs";

vi.mock("@/features/sales-orders/components/detail/SalesOrderDetailLinesTab", () => ({
  SalesOrderDetailLinesTab: () => <div>Lines tab</div>,
}));

vi.mock("@/features/sales-orders/components/detail/SalesOrderDetailVisitTab", () => ({
  SalesOrderDetailVisitTab: () => null,
}));

vi.mock("@/features/sales-orders/components/detail/SalesOrderDetailClientTab", () => ({
  SalesOrderDetailClientTab: () => null,
}));

vi.mock("@/features/sales-orders/components/detail/SalesOrderDetailActivityTab", () => ({
  SalesOrderDetailActivityTab: () => null,
}));

vi.mock("@/features/sales-orders/components/detail/SalesOrderSummaryPanel", () => ({
  SalesOrderSummaryPanel: () => null,
}));

const order = {
  id: 81,
  uuid: "234ab87e-7831-4ba6-af32-f98ef80e3127",
  name: "SO00081",
  state: "draft",
  lines: [{ id: 1, name: "Consultation" }],
} as unknown as SalesOrder;

describe("sales order detail tabs", () => {
  it("defines icons for every section", () => {
    expect(SALES_ORDER_DETAIL_TABS.map((tab) => tab.icon)).toEqual([
      "clipboard",
      "heartPulse",
      "user",
      "activity",
    ]);
  });

  it("renders tab labels with line count", () => {
    render(
      <SalesOrderDetailTabs order={order} onOrderUpdated={vi.fn()} />,
    );

    expect(screen.getByRole("button", { name: /Line items/ })).toHaveTextContent(
      "Line items (1)",
    );
    expect(screen.getByRole("button", { name: "Visit" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Client" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Activity" })).toBeInTheDocument();
  });
});
