import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { LinePricelistCell } from "@/features/sales-orders/components/detail/LinePricelistCell";

afterEach(() => {
  cleanup();
});

describe("LinePricelistCell", () => {
  it("shows the pricelist name when the line is payable", () => {
    render(<LinePricelistCell isPayable pricelistName="Corporate" />);

    expect(screen.getByText("Corporate")).toBeInTheDocument();
    expect(screen.queryByText("List price")).not.toBeInTheDocument();
  });

  it("shows a list price indicator when the line is not payable", () => {
    render(<LinePricelistCell isPayable={false} pricelistName="Corporate" />);

    expect(screen.getByText("List price")).toBeInTheDocument();
    expect(screen.queryByText("Corporate")).not.toBeInTheDocument();
  });
});
