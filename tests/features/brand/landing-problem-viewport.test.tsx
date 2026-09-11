import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LandingProblemViewport } from "@/features/brand/components/landing/LandingProblemViewport";

describe("LandingProblemViewport", () => {
  it("renders the problem headline and four leak points", () => {
    render(<LandingProblemViewport />);

    expect(
      screen.getByRole("heading", {
        name: /Your clinic treated the patient\.\s*Did you collect what you earned\?/,
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Claims get rejected" })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Payments lose their trail" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Staff chase spreadsheets" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Managers fly blind" })).toBeInTheDocument();
    expect(
      screen.getByRole("img", {
        name: "A clinic finance officer reviewing a rejected insurance claim",
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Book a demo" })).toBeInTheDocument();
  });
});
