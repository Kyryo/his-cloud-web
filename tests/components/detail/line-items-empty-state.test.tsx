import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { LineItemsEmptyState } from "@/components/detail/line-items-empty-state";
import { SecondaryButton } from "@/components/ui/app-buttons";

afterEach(() => {
  cleanup();
});

describe("LineItemsEmptyState", () => {
  it("renders the default line-items copy", () => {
    render(<LineItemsEmptyState />);

    expect(screen.getByText("No items yet")).toBeInTheDocument();
    expect(
      screen.getByText("Click Add line item to get started."),
    ).toBeInTheDocument();
  });

  it("renders a custom title, description, and action", () => {
    const onAdd = vi.fn();

    render(
      <LineItemsEmptyState
        title="No line items"
        description="This sales order does not have any line items."
        data-testid="sales-order-lines-empty-state"
        action={
          <SecondaryButton type="button" onClick={onAdd}>
            Add line item
          </SecondaryButton>
        }
      />,
    );

    expect(screen.getByTestId("sales-order-lines-empty-state")).toBeInTheDocument();
    expect(screen.getByText("No line items")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Add line item" }));
    expect(onAdd).toHaveBeenCalledTimes(1);
  });
});
