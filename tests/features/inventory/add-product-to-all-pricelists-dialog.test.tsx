import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AddProductToAllPricelistsDialog } from "@/features/inventory/components/detail/AddProductToAllPricelistsDialog";

afterEach(() => {
  cleanup();
});

describe("AddProductToAllPricelistsDialog", () => {
  it("defaults to list price and confirms that source", () => {
    const onConfirm = vi.fn();

    render(
      <AddProductToAllPricelistsDialog
        open
        listPrice="25.00"
        remainingCount={2}
        onOpenChange={vi.fn()}
        onConfirm={onConfirm}
      />,
    );

    expect(screen.getByTestId("add-to-all-pricelists-source-list-price")).toBeChecked();
    expect(screen.getByTestId("add-to-all-pricelists-source-zero")).not.toBeChecked();
    expect(screen.getByText(/2 remaining active pricelists/)).toBeInTheDocument();
    expect(screen.getByText(/current list price/)).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("add-to-all-pricelists-confirm"));
    expect(onConfirm).toHaveBeenCalledWith("list_price");
  });

  it("lets the user switch to a zero price", () => {
    const onConfirm = vi.fn();

    render(
      <AddProductToAllPricelistsDialog
        open
        listPrice="25.00"
        onOpenChange={vi.fn()}
        onConfirm={onConfirm}
      />,
    );

    fireEvent.click(screen.getByTestId("add-to-all-pricelists-source-zero"));
    fireEvent.click(screen.getByTestId("add-to-all-pricelists-confirm"));

    expect(onConfirm).toHaveBeenCalledWith("zero");
  });
});
