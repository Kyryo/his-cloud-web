import { describe, expect, it } from "vitest";

import { splitOverflowItems } from "@/features/customers/utils/split-overflow-tabs";

describe("splitOverflowItems", () => {
  const items = ["a", "b", "c", "d", "e"];
  const itemWidths = [80, 80, 80, 80, 80];

  it("keeps every item visible when there is enough room", () => {
    const result = splitOverflowItems({
      items,
      itemWidths,
      moreWidth: 70,
      availableWidth: 500,
      gap: 2,
      activeIndex: 0,
    });

    expect(result.visible).toEqual(items);
    expect(result.overflow).toEqual([]);
  });

  it("collapses later items behind More when the row is tight", () => {
    const result = splitOverflowItems({
      items,
      itemWidths,
      moreWidth: 70,
      availableWidth: 260,
      gap: 2,
      activeIndex: 0,
    });

    expect(result.visible).toEqual(["a", "b"]);
    expect(result.overflow).toEqual(["c", "d", "e"]);
  });

  it("keeps the active item visible when it would otherwise overflow", () => {
    const result = splitOverflowItems({
      items,
      itemWidths,
      moreWidth: 70,
      availableWidth: 260,
      gap: 2,
      activeIndex: 4,
    });

    expect(result.visible).toContain("e");
    expect(result.overflow).not.toContain("e");
    expect(result.visible.length + result.overflow.length).toBe(items.length);
  });

  it("shows all items when widths are not measurable yet", () => {
    const result = splitOverflowItems({
      items,
      itemWidths: [0, 0, 0, 0, 0],
      moreWidth: 0,
      availableWidth: 200,
      gap: 2,
      activeIndex: 1,
    });

    expect(result.visible).toEqual(items);
    expect(result.overflow).toEqual([]);
  });
});
