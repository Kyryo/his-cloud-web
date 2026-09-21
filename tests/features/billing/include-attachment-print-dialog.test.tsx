import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { IncludeAttachmentPrintDialog } from "@/features/billing/components/IncludeAttachmentPrintDialog";

afterEach(() => {
  cleanup();
});

describe("IncludeAttachmentPrintDialog", () => {
  it("offers include, without, and cancel actions", () => {
    const onInclude = vi.fn();
    const onWithout = vi.fn();
    const onOpenChange = vi.fn();

    render(
      <IncludeAttachmentPrintDialog
        open
        onOpenChange={onOpenChange}
        documentLabel="Sales Order"
        isWorking={false}
        onInclude={onInclude}
        onWithout={onWithout}
      />,
    );

    expect(
      screen.getByTestId("include-attachment-print-dialog"),
    ).toBeInTheDocument();
    expect(screen.getByText("Include attachment?")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("include-attachment-confirm"));
    expect(onInclude).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByTestId("include-attachment-skip"));
    expect(onWithout).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByTestId("include-attachment-cancel"));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("disables actions while working", () => {
    render(
      <IncludeAttachmentPrintDialog
        open
        onOpenChange={vi.fn()}
        documentLabel="Invoice"
        isWorking
        onInclude={vi.fn()}
        onWithout={vi.fn()}
      />,
    );

    expect(screen.getByTestId("include-attachment-confirm")).toBeDisabled();
    expect(screen.getByTestId("include-attachment-skip")).toBeDisabled();
    expect(screen.getByTestId("include-attachment-cancel")).toBeDisabled();
  });
});
