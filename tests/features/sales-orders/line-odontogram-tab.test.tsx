import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { ExpandableToothNumbersSummary } from "@/features/dental/components/ExpandableToothNumbersSummary";
import { shouldShowLineOdontogramTab } from "@/features/sales-orders/components/detail/LinePricingBreakdownDialog";

afterEach(() => {
  cleanup();
});

describe("ExpandableToothNumbersSummary", () => {
  it("shows all teeth when there are few", () => {
    render(<ExpandableToothNumbersSummary toothNumbers={[11, 12, 13]} />);
    expect(screen.getByTestId("odontogram-teeth-summary")).toHaveTextContent(
      "11, 12, 13",
    );
    expect(screen.queryByTestId("odontogram-teeth-view-more")).not.toBeInTheDocument();
  });

  it("expands and collapses long tooth lists", () => {
    render(
      <ExpandableToothNumbersSummary toothNumbers={[11, 12, 13, 14, 15]} />,
    );
    expect(screen.getByTestId("odontogram-teeth-summary")).toHaveTextContent(
      "11, 12 and 3 more",
    );

    fireEvent.click(screen.getByTestId("odontogram-teeth-view-more"));
    expect(screen.getByTestId("odontogram-teeth-summary")).toHaveTextContent(
      "11, 12, 13, 14, 15",
    );
    expect(screen.getByTestId("odontogram-teeth-view-less")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("odontogram-teeth-view-less"));
    expect(screen.getByTestId("odontogram-teeth-view-more")).toBeInTheDocument();
  });
});

describe("shouldShowLineOdontogramTab", () => {
  it("requires a dental encounter and procedure line", () => {
    expect(
      shouldShowLineOdontogramTab({
        hasDentalEncounter: true,
        line: { is_procedure: true },
      }),
    ).toBe(true);
    expect(
      shouldShowLineOdontogramTab({
        hasDentalEncounter: true,
        line: { is_procedure: false },
      }),
    ).toBe(false);
    expect(
      shouldShowLineOdontogramTab({
        hasDentalEncounter: false,
        line: { is_procedure: true },
      }),
    ).toBe(false);
  });
});
