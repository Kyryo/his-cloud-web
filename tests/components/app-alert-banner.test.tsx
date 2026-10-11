import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AppAlertBanner } from "@/components/ui/app-alert-banner";

afterEach(() => {
  cleanup();
});

describe("AppAlertBanner", () => {
  it("renders a full-width warning with the caller's wording", () => {
    render(<AppAlertBanner message="Finish setting up your clinic" />);

    const banner = screen.getByRole("alert");
    expect(banner).toHaveTextContent("Finish setting up your clinic");
    expect(banner.className).toContain("w-full");
    expect(banner.className).toContain("bg-amber-50");
  });

  it("uses the variant for other alert types", () => {
    render(<AppAlertBanner variant="error" message="Billing is paused" showIcon={false} />);

    const banner = screen.getByRole("alert");
    expect(banner).toHaveTextContent("Billing is paused");
    expect(banner.className).toContain("bg-red-50");
  });

  it("becomes a button when the alert has an action", () => {
    const onClick = vi.fn();
    render(
      <AppAlertBanner
        variant="info"
        message="Review the new payer"
        onClick={onClick}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Review the new payer" }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("becomes a link when the alert points somewhere", () => {
    render(
      <AppAlertBanner
        variant="success"
        message="Your clinic can register a client"
        href="/customers"
      />,
    );

    expect(
      screen.getByRole("link", { name: "Your clinic can register a client" }),
    ).toHaveAttribute("href", "/customers");
  });
});
