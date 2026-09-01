import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { TagBadge } from "@/features/tags/components/TagBadge";

describe("TagBadge", () => {
  it("renders the tag name and applies custom color styling", () => {
    render(<TagBadge tag={{ name: "VIP", color: "#2563eb" }} />);

    const badge = screen.getByText("VIP");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveStyle({
      backgroundColor: "#2563eb",
      color: "#ffffff",
    });
  });

  it("uses dark text for light tag colors", () => {
    render(<TagBadge tag={{ name: "Caution", color: "#fef08a" }} />);

    const badge = screen.getByText("Caution");
    expect(badge).toHaveStyle({
      backgroundColor: "#fef08a",
      color: "#1e293b",
    });
  });
});
