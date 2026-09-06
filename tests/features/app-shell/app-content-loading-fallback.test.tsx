import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AppContentLoadingFallback } from "@/features/app-shell/components/AppContentLoadingFallback";

describe("AppContentLoadingFallback", () => {
  it("renders a content-pane skeleton instead of a full-screen loader", () => {
    render(<AppContentLoadingFallback />);

    expect(screen.getByTestId("app-content-loading")).toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});
