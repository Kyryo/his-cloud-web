import { describe, expect, it } from "vitest";

import {
  pageOffset,
  paginateItems,
} from "@/features/customers/utils/paginate-items";

describe("paginateItems", () => {
  const items = [1, 2, 3, 4, 5];

  it("returns the requested page of items", () => {
    expect(paginateItems(items, 2, 2)).toEqual({
      items: [3, 4],
      page: 2,
      pageSize: 2,
      totalCount: 5,
      hasNext: true,
      hasPrevious: true,
    });
  });

  it("clamps to the last page when the requested page is too high", () => {
    expect(paginateItems(items, 9, 2).page).toBe(3);
    expect(paginateItems(items, 9, 2).items).toEqual([5]);
  });

  it("computes page offsets for billing list requests", () => {
    expect(pageOffset(1, 20)).toBe(0);
    expect(pageOffset(3, 20)).toBe(40);
  });
});
