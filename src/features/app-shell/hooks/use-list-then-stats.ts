"use client";

import { useEffect, useState } from "react";

type UseListThenStatsOptions<TStats> = {
  statsKey: string;
  listCompletedKey: string | null;
  fetchStats: () => Promise<TStats>;
};

export function useListThenStats<TStats>({
  statsKey,
  listCompletedKey,
  fetchStats,
}: UseListThenStatsOptions<TStats>): {
  stats: TStats | null;
  isStatsLoading: boolean;
} {
  const [stats, setStats] = useState<TStats | null>(null);
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const ready = listCompletedKey === statsKey;

  useEffect(() => {
    if (!ready) {
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        const next = await fetchStats();
        if (!cancelled) {
          setStats(next);
          setLoadedKey(statsKey);
        }
      } catch {
        if (!cancelled) {
          setStats(null);
          setLoadedKey(statsKey);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [fetchStats, ready, statsKey]);

  return {
    stats,
    isStatsLoading: !ready || loadedKey !== statsKey,
  };
}
