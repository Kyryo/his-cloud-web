import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { TagBadgeList } from "@/features/tags/components/TagBadgeList";
import type { Tag } from "@/features/tags/types/tag.types";

afterEach(() => {
  cleanup();
});

function buildTag(index: number): Tag {
  return {
    id: index,
    uuid: `tag-${index}`,
    tenant: 1,
    target_type: "sales.Customer",
    name: `Tag ${index}`,
    slug: `tag-${index}`,
    color: "#2563eb",
    description: "",
    is_active: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    created_by: null,
  };
}

describe("TagBadgeList", () => {
  it("renders all tags when the list is small", () => {
    render(<TagBadgeList tags={[buildTag(1), buildTag(2), buildTag(3)]} />);

    expect(screen.getByText("Tag 1")).toBeInTheDocument();
    expect(screen.getByText("Tag 2")).toBeInTheDocument();
    expect(screen.getByText("Tag 3")).toBeInTheDocument();
    expect(screen.queryByTestId("tag-badge-list-more")).not.toBeInTheDocument();
  });

  it("collapses extra tags behind a more tags control", () => {
    render(
      <TagBadgeList
        tags={[buildTag(1), buildTag(2), buildTag(3), buildTag(4), buildTag(5)]}
        visibleCount={2}
      />,
    );

    expect(screen.getByText("Tag 1")).toBeInTheDocument();
    expect(screen.getByText("Tag 2")).toBeInTheDocument();
    expect(screen.queryByText("Tag 3")).not.toBeInTheDocument();
    expect(screen.getByTestId("tag-badge-list-more")).toHaveTextContent(
      "3 more tags",
    );
  });

  it("calls onTagClick when a tag is clicked but expands inline for more tags", () => {
    const onTagClick = vi.fn();

    render(
      <TagBadgeList
        tags={[buildTag(1), buildTag(2), buildTag(3), buildTag(4), buildTag(5)]}
        visibleCount={2}
        onTagClick={onTagClick}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Manage tag Tag 1" }));
    expect(onTagClick).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByTestId("tag-badge-list-more"));
    expect(onTagClick).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Tag 5")).toBeInTheDocument();
    expect(screen.getByTestId("tag-badge-list-less")).toBeInTheDocument();
  });

  it("expands and collapses tags when the user clicks", () => {
    render(
      <TagBadgeList
        tags={[buildTag(1), buildTag(2), buildTag(3), buildTag(4), buildTag(5)]}
        visibleCount={2}
      />,
    );

    fireEvent.click(screen.getByTestId("tag-badge-list-more"));

    expect(screen.getByText("Tag 5")).toBeInTheDocument();
    expect(screen.getByTestId("tag-badge-list-less")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("tag-badge-list-less"));

    expect(screen.queryByText("Tag 5")).not.toBeInTheDocument();
    expect(screen.getByTestId("tag-badge-list-more")).toBeInTheDocument();
  });
});
