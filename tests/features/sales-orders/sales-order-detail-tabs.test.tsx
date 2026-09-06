import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

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
  SalesOrderSummaryPanel: () => (
    <aside data-testid="sales-order-summary-panel">Order summary</aside>
  ),
}));

const order = {
  id: 81,
  uuid: "234ab87e-7831-4ba6-af32-f98ef80e3127",
  name: "SO00081",
  state: "draft",
  lines: [{ id: 1, name: "Consultation" }],
} as unknown as SalesOrder;

afterEach(() => {
  cleanup();
});

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

  it("places the order summary after the main content", () => {
    render(
      <SalesOrderDetailTabs order={order} onOrderUpdated={vi.fn()} />,
    );

    const tabs = screen.getByTestId("sales-order-detail-tabs");
    const main = tabs.querySelector("main");
    const summary = screen.getByTestId("sales-order-summary-panel");

    expect(main).toBeTruthy();
    expect(
      Boolean(main && main.compareDocumentPosition(summary) & Node.DOCUMENT_POSITION_FOLLOWING),
    ).toBe(true);
  });
});
