import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { PageActivityBar } from "@/features/app-shell/components/PageActivityBar";
import { usePageActivity } from "@/features/app-shell/hooks/use-page-activity";
import { usePageActivityStore } from "@/features/app-shell/stores/page-activity.store";

vi.mock("next/navigation", () => ({
  usePathname: () => "/appointments",
  useSearchParams: () => new URLSearchParams(),
}));

function ActivityProbe({ active }: { active: boolean }) {
  usePageActivity(active);
  return <PageActivityBar />;
}

beforeEach(() => {
  usePageActivityStore.setState({ sources: {} });
});

afterEach(() => {
  cleanup();
  usePageActivityStore.setState({ sources: {} });
});

describe("PageActivityBar", () => {
  it("stays hidden until a same-document navigation starts", () => {
    render(
      <>
        <PageActivityBar />
        <a
          href="/appointments/calendar"
          onClick={(event) => event.preventDefault()}
        >
          Calendar
        </a>
      </>,
    );

    expect(screen.queryByTestId("page-activity-bar")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("link", { name: "Calendar" }));

    const bar = screen.getByTestId("page-activity-bar");
    expect(bar).toHaveAttribute("role", "progressbar");
    expect(bar.querySelector(".bg-brand-primary")).toBeTruthy();
  });

  it("shows the primary line while a page reports activity", async () => {
    const { rerender } = render(<ActivityProbe active />);

    expect(await screen.findByTestId("page-activity-bar")).toBeInTheDocument();

    rerender(<ActivityProbe active={false} />);
    await waitFor(() => {
      expect(screen.queryByTestId("page-activity-bar")).not.toBeInTheDocument();
    });
  });
});
