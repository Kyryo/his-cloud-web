import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useInventoryList } from "@/features/inventory/hooks/use-inventory-list";
import type { PaginatedListResponse } from "@/types/api.types";

type TestItem = { id: string };

function createFetchFn() {
  return vi.fn(
    async (): Promise<PaginatedListResponse<TestItem>> => ({
      results: [{ id: "1" }],
      pagination: { count: 1, next: null, previous: null },
    }),
  );
}

describe("useInventoryList", () => {
  it("fetches once on mount when extraFilters is omitted", async () => {
    const fetchFn = createFetchFn();

    const { result } = renderHook(() => useInventoryList<TestItem>({ fetchFn }));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(fetchFn).toHaveBeenCalledTimes(1);
  });

  it("does not refetch on unrelated re-renders", async () => {
    const fetchFn = createFetchFn();

    const { result, rerender } = renderHook(() =>
      useInventoryList<TestItem>({ fetchFn }),
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    rerender();
    rerender();

    expect(fetchFn).toHaveBeenCalledTimes(1);
  });

  it("refetches when page changes", async () => {
    const fetchFn = createFetchFn();

    const { result } = renderHook(() => useInventoryList<TestItem>({ fetchFn }));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      result.current.handlePageChange(2);
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(fetchFn).toHaveBeenCalledTimes(2);
    expect(fetchFn).toHaveBeenLastCalledWith(
      expect.objectContaining({ page: 2 }),
    );
  });
});
