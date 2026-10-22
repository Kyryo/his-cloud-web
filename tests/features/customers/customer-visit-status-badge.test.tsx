import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { CustomerVisitStatusBadge } from "@/features/customers/components/CustomerVisitStatusBadge";

afterEach(() => {
  cleanup();
});

describe("CustomerVisitStatusBadge", () => {
  it("gives the completed badge a visible border like the other statuses", () => {
    render(<CustomerVisitStatusBadge status="completed" />);

    const badge = screen.getByText("Completed");
    expect(badge.className).toContain("border-brand-primary/20");
    expect(badge.className).not.toContain("border-transparent");
  });
});
