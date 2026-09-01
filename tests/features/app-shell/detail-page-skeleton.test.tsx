import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { DetailPageSkeleton } from "@/features/app-shell/components/page-layout";

afterEach(() => {
  cleanup();
});

describe("DetailPageSkeleton", () => {
  it("renders header, tabs, and table placeholders", () => {
    render(<DetailPageSkeleton tabCount={4} />);

    expect(screen.getByTestId("detail-page-skeleton")).toBeInTheDocument();
    expect(screen.getByLabelText("Loading sections")).toBeInTheDocument();
  });
});
