import { cleanup, render, screen } from "@testing-library/react";
import type { ComponentProps } from "react";
import { afterEach, describe, expect, it } from "vitest";

import { Sheet, SheetContent } from "@/components/ui/sheet";
import { CustomerVisitSheetHeader } from "@/features/customers/components/detail/CustomerVisitSheetHeader";

afterEach(() => {
  cleanup();
});

function renderHeader(
  props: ComponentProps<typeof CustomerVisitSheetHeader>,
) {
  return render(
    <Sheet open>
      <SheetContent>
        <CustomerVisitSheetHeader {...props} />
      </SheetContent>
    </Sheet>,
  );
}

describe("CustomerVisitSheetHeader", () => {
  it("shows the client first for a walk-in start", () => {
    renderHeader({
      action: "start",
      customerName: "Chisomo Banda",
      identifier: "CM-1042",
      gender: "Female",
      ageLabel: "34 years",
      clinicName: "City Clinic",
    });

    expect(screen.getByText("Start visit")).toBeInTheDocument();
    expect(screen.getByText("Chisomo Banda")).toBeInTheDocument();
    expect(
      screen.getByText("CM-1042 · Female · 34 years · City Clinic"),
    ).toBeInTheDocument();
  });

  it("uses close copy when the visit is already open", () => {
    renderHeader({
      action: "close",
      customerName: "Chisomo Banda",
      identifier: "CM-1042",
    });

    expect(screen.getByText("Close visit")).toBeInTheDocument();
    expect(screen.getByText("Chisomo Banda")).toBeInTheDocument();
  });
});
