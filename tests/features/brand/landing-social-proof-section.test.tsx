import { render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it } from "vitest";

import { LandingSocialProofSection } from "@/features/brand/components/landing/LandingSocialProofSection";

beforeAll(() => {
  class IntersectionObserverMock {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
    root = null;
    rootMargin = "";
    thresholds = [];
  }

  Object.defineProperty(globalThis, "IntersectionObserver", {
    writable: true,
    configurable: true,
    value: IntersectionObserverMock,
  });
});

describe("LandingSocialProofSection", () => {
  it("renders the headline, clinic logos, and supporting line", () => {
    render(<LandingSocialProofSection />);

    expect(
      screen.getByRole("heading", {
        name: "Every claim, tracked until it's paid.",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "From a children's therapy clinic to a national mediclinic network.",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("list", { name: "Clinics using Sigma" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "MASM MediClinics" })).toHaveAttribute(
      "src",
      expect.stringContaining("social-proof-logos%2Fmasm.jpeg"),
    );
    expect(
      screen.getByRole("img", {
        name: "Warm Hands Children's Therapy & Wellness Center",
      }),
    ).toHaveAttribute(
      "src",
      expect.stringContaining("social-proof-logos%2Fwarm_hands.png"),
    );
    expect(screen.getByRole("img", { name: "Dental Implant" })).toHaveAttribute(
      "src",
      expect.stringContaining("social-proof-logos%2FDental-Implant.avif"),
    );
  });
});
