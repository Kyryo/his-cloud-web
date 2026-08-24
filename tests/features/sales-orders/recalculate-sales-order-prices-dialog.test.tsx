import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { RecalculateSalesOrderPricesDialog } from "@/features/sales-orders/components/detail/RecalculateSalesOrderPricesDialog";

afterEach(() => {
  cleanup();
});

describe("RecalculateSalesOrderPricesDialog", () => {
  it("defaults to the current pricelist when the order has one", () => {
    const onConfirm = vi.fn();

    render(
      <RecalculateSalesOrderPricesDialog
        open
        pricelistName="MASM Gold"
        onOpenChange={vi.fn()}
        onConfirm={onConfirm}
      />,
    );

    expect(screen.getByTestId("recalculate-prices-source-pricelist")).toBeChecked();
    expect(screen.getByTestId("recalculate-prices-source-list-price")).not.toBeChecked();
    expect(screen.getByText(/MASM Gold/)).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("recalculate-sales-order-prices-confirm"));
    expect(onConfirm).toHaveBeenCalledWith("pricelist");
  });

  it("disables the pricelist option when the order has no pricelist", () => {
    const onConfirm = vi.fn();

    render(
      <RecalculateSalesOrderPricesDialog
        open
        pricelistName={null}
        onOpenChange={vi.fn()}
        onConfirm={onConfirm}
      />,
    );

    expect(screen.getByTestId("recalculate-prices-source-pricelist")).toBeDisabled();
    expect(screen.getByTestId("recalculate-prices-source-list-price")).toBeChecked();
    expect(screen.getByText("This order has no pricelist.")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("recalculate-sales-order-prices-confirm"));
    expect(onConfirm).toHaveBeenCalledWith("list_price");
  });

  it("lets the user switch to list price when a pricelist is present", () => {
    const onConfirm = vi.fn();

    render(
      <RecalculateSalesOrderPricesDialog
        open
        pricelistName="Standard"
        onOpenChange={vi.fn()}
        onConfirm={onConfirm}
      />,
    );

    fireEvent.click(screen.getByTestId("recalculate-prices-source-list-price"));
    fireEvent.click(screen.getByTestId("recalculate-sales-order-prices-confirm"));

    expect(onConfirm).toHaveBeenCalledWith("list_price");
  });
});
