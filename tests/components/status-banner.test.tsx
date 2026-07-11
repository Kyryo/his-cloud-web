import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { StatusBanner } from "@/components/ui/status-banner";

afterEach(() => {
  cleanup();
});

describe("StatusBanner", () => {
  it("renders error variant with message and description", () => {
    render(
      <StatusBanner
        variant="error"
        message="Could not close visit"
        description="All encounters must be completed first."
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent("Could not close visit");
    expect(screen.getByText("All encounters must be completed first.")).toBeInTheDocument();
  });

  it("renders success variant as status", () => {
    render(<StatusBanner variant="success" message="Visit closed" />);
    expect(screen.getByRole("status")).toHaveTextContent("Visit closed");
  });
});
