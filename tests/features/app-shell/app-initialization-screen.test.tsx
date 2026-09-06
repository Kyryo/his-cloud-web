import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AppInitializationScreen } from "@/features/app-shell/components/AppInitializationScreen";

vi.mock("next/image", () => ({
  default: function MockImage({
    alt,
  }: {
    alt: string;
  }) {
    return <span>{alt}</span>;
  },
}));

describe("AppInitializationScreen", () => {
  it("shows only the animated logo mark, with no visible copy", () => {
    render(<AppInitializationScreen />);

    expect(screen.getByTestId("app-initialization-screen")).toBeInTheDocument();
    expect(screen.getByText("Sigma Health HMIS")).toBeInTheDocument();
    expect(screen.getByText("Loading")).toHaveClass("sr-only");
    expect(screen.queryByText("Preparing your workspace")).not.toBeInTheDocument();
    expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
  });
});
