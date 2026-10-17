import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ROUTES } from "@/constants/routes";
import { SalesOrderDetailHeader } from "@/features/sales-orders/components/detail/SalesOrderDetailHeader";
import { SalesOrderLinesEditor } from "@/features/sales-orders/components/detail/SalesOrderLinesEditor";
import { splitSalesOrderLines } from "@/features/sales-orders/services/sales-orders.service";
import type { SalesOrder, SalesOrderLine } from "@/features/sales-orders/types/sales-order.types";

const push = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

vi.mock("@/providers/toast-provider", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

vi.mock("@/features/sales-orders/services/sales-orders.service", async () => {
  const actual = await vi.importActual<
    typeof import("@/features/sales-orders/services/sales-orders.service")
  >("@/features/sales-orders/services/sales-orders.service");
  return {
    ...actual,
    splitSalesOrderLines: vi.fn(),
    mergeSalesOrderLines: vi.fn(),
  };
});

const filling = (id: number, quantity = 1): SalesOrderLine => ({
  id,
  name: "FCB (3 Part)",
  product_id: 10,
  product_name: "FCB (3 Part)",
  quantity,
  price_unit: "75.00",
  price_total: String(75 * quantity),
  is_payable: true,
  payability_overridden: false,
  provider_id: null,
});

const consultation: SalesOrderLine = {
  id: 3,
  name: "Consultation",
  product_id: 11,
  product_name: "Consultation",
  quantity: 1,
  price_unit: "25.00",
  price_total: "25.00",
  is_payable: true,
  payability_overridden: false,
  provider_id: null,
};

function buildOrder(overrides: Partial<SalesOrder> = {}): SalesOrder {
  return {
    id: 81,
    uuid: "234ab87e-7831-4ba6-af32-f98ef80e3127",
    name: "SO00081",
    date_order: null,
    state: "draft",
    invoice_status: "no",
    customer_id: 1,
    customer_uuid: null,
    customer_name: "Ada Lovelace",
    amount_untaxed: "175",
    amount_tax: "0",
    amount_total: "175",
    lines: [filling(1), filling(2), consultation],
    ...overrides,
  } as SalesOrder;
}

afterEach(() => {
  cleanup();
  push.mockReset();
  vi.mocked(splitSalesOrderLines).mockReset();
});

describe("sales order line toolbar", () => {
  it("keeps assign provider on the left and enables actions from the selection", async () => {
    render(
      <SalesOrderLinesEditor
        order={buildOrder()}
        isActive
        onOrderUpdated={vi.fn()}
      />,
    );

    const assignProvider = screen.getByRole("button", { name: /Assign provider/ });
    const newOrder = screen.getByTestId("sales-order-new-order");
    const merge = screen.getByTestId("sales-order-merge-lines");

    expect(assignProvider.closest("div")?.className).toContain("justify-start");
    expect(
      assignProvider.compareDocumentPosition(newOrder) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(newOrder).toBeDisabled();
    expect(merge).toBeDisabled();

    fireEvent.click(screen.getAllByRole("checkbox", { name: "Select FCB (3 Part)" })[0]!);
    expect(newOrder).toBeEnabled();
    expect(merge).toBeDisabled();

    fireEvent.click(newOrder);
    expect(screen.getByTestId("sales-order-line-action-dialog")).toHaveTextContent(
      "FCB (3 Part)",
    );
    expect(screen.getByText(/will move to a new sales order/)).toBeInTheDocument();

    vi.mocked(splitSalesOrderLines).mockResolvedValue(
      buildOrder({
        id: 90,
        uuid: "90fdb886-02b0-410a-a30e-14d801eeeaa9",
        name: "SO00090",
      }),
    );
    fireEvent.click(screen.getByTestId("sales-order-line-action-confirm"));
    await waitFor(() => {
      expect(push).toHaveBeenCalledWith(
        ROUTES.salesOrderDetail("90fdb886-02b0-410a-a30e-14d801eeeaa9"),
      );
    });
  });

  it("confirms a merge with the combined quantity and repricing note", () => {
    render(
      <SalesOrderLinesEditor
        order={buildOrder()}
        isActive
        onOrderUpdated={vi.fn()}
      />,
    );

    for (const checkbox of screen.getAllByRole("checkbox", {
      name: "Select FCB (3 Part)",
    })) {
      fireEvent.click(checkbox);
    }

    fireEvent.click(screen.getByTestId("sales-order-merge-lines"));

    expect(screen.getByTestId("sales-order-line-action-dialog")).toHaveTextContent(
      "Merge 2 FCB (3 Part) into one line. Pricing will be recalculated.",
    );
  });

  it("keeps a new line's product search in the item column", () => {
    render(
      <SalesOrderLinesEditor
        order={buildOrder()}
        isActive
        onOrderUpdated={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Add line item/ }));

    const productField = screen.getByText("Select a product").closest("td");
    const row = productField?.closest("tr");
    const cells = row ? Array.from(row.querySelectorAll("td")) : [];

    expect(cells).toHaveLength(7);
    expect(cells[0]).not.toBe(productField);
    expect(cells[1]).toBe(productField);
    expect(cells[0]?.querySelector("input[type='checkbox']")).toBeNull();
  });

  it("disables line actions on an invoiced order and hides them when locked", () => {
    const { unmount } = render(
      <SalesOrderLinesEditor
        order={buildOrder({ invoice_status: "invoiced" })}
        isActive
        onOrderUpdated={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("checkbox", { name: "Select all line items" }));
    expect(screen.getByTestId("sales-order-new-order")).toBeDisabled();
    expect(screen.getByTestId("sales-order-merge-lines")).toBeDisabled();
    unmount();

    render(
      <SalesOrderLinesEditor
        order={buildOrder({ state: "sale" })}
        isActive
        onOrderUpdated={vi.fn()}
      />,
    );

    expect(screen.queryByTestId("sales-order-new-order")).not.toBeInTheDocument();
    expect(screen.queryByTestId("sales-order-merge-lines")).not.toBeInTheDocument();
  });
});

describe("sales order source link", () => {
  it("links a derived order to the order it came from", () => {
    render(
      <SalesOrderDetailHeader
        order={buildOrder({
          source_sales_order_id: 12,
          source_sales_order_uuid: "80fdb886-02b0-410a-a30e-14d801eeeaa9",
          source_sales_order_name: "SO00012",
        })}
      />,
    );

    expect(screen.getByRole("link", { name: "From SO00012" })).toHaveAttribute(
      "href",
      ROUTES.salesOrderDetail("80fdb886-02b0-410a-a30e-14d801eeeaa9"),
    );
  });
});
