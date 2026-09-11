import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { HeroProductStage } from "@/features/brand/components/landing/HeroProductStage";

describe("HeroProductStage", () => {
  it("renders the Yoco-style collage of clinic photo cards", () => {
    render(<HeroProductStage />);

    expect(
      screen.getByRole("img", {
        name: "A receptionist reviewing the clinic schedule at the front desk",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("img", {
        name: "A physician reviewing patient records on a laptop",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("img", {
        name: "A clinic finance officer reviewing insurance claims and payments at a desk",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("img", {
        name: "A clinician reviewing visit notes with a patient",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("img", {
        name: "A clinic front desk taking a patient card payment",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("Claim ready")).toBeInTheDocument();
    expect(screen.getByText("All checks passed")).toBeInTheDocument();
  });
});
