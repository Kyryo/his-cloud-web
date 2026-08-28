import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useListThenStats } from "@/features/app-shell/hooks/use-list-then-stats";

describe("useListThenStats", () => {
  it("does not fetch stats until the list for the same filters has completed", async () => {
    const fetchStats = vi.fn().mockResolvedValue({ count: 1 });

    const { rerender, result } = renderHook(
      ({ listCompletedKey }: { listCompletedKey: string | null }) =>
        useListThenStats({
          statsKey: "search=a",
          listCompletedKey,
          fetchStats,
        }),
      { initialProps: { listCompletedKey: null as string | null } },
    );

    expect(fetchStats).not.toHaveBeenCalled();
    expect(result.current.isStatsLoading).toBe(true);

    rerender({ listCompletedKey: "search=a" });

    await waitFor(() => {
      expect(fetchStats).toHaveBeenCalledTimes(1);
    });
    await waitFor(() => {
      expect(result.current.isStatsLoading).toBe(false);
    });
    expect(result.current.stats).toEqual({ count: 1 });
  });

  it("shows loading again when filters change before the next list completes", async () => {
    const fetchStats = vi.fn().mockResolvedValue({ count: 1 });

    const { rerender, result } = renderHook(
      ({
        statsKey,
        listCompletedKey,
      }: {
        statsKey: string;
        listCompletedKey: string | null;
      }) =>
        useListThenStats({
          statsKey,
          listCompletedKey,
          fetchStats,
        }),
      {
        initialProps: {
          statsKey: "search=a",
          listCompletedKey: "search=a",
        },
      },
    );

    await waitFor(() => {
      expect(result.current.isStatsLoading).toBe(false);
    });

    rerender({ statsKey: "search=b", listCompletedKey: "search=a" });

    expect(result.current.isStatsLoading).toBe(true);
    expect(fetchStats).toHaveBeenCalledTimes(1);
  });
});
