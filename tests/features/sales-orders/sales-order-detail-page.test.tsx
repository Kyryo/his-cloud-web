import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { SalesOrderDetailPage } from "@/features/sales-orders/pages/SalesOrderDetailPage";

const fetchSalesOrder = vi.fn();

vi.mock("@/features/app-shell/hooks/use-app-breadcrumb", () => ({
  useAppBreadcrumb: vi.fn(),
}));

vi.mock("@/features/sales-orders/services/sales-orders.service", () => ({
  fetchSalesOrder: (...args: unknown[]) => fetchSalesOrder(...args),
}));

afterEach(() => {
  cleanup();
});

describe("SalesOrderDetailPage", () => {
  it("shows a detail skeleton while the order is loading", () => {
    fetchSalesOrder.mockReturnValue(new Promise(() => undefined));

    render(<SalesOrderDetailPage orderId="81" />);

    expect(screen.getByTestId("sales-order-detail-skeleton")).toBeInTheDocument();
  });
});
