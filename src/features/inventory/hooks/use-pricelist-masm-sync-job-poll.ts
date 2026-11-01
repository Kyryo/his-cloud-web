"use client";

import { useEffect, useRef } from "react";

import { fetchCatalogMasmCorePriceSyncJob } from "@/features/catalog/services/catalog.service";
import type { CatalogPricelistMasmCoreSyncJob } from "@/features/catalog/types/catalog.types";

const POLL_INTERVAL_MS = 2500;
const ACTIVE_STATUSES = new Set(["queued", "running"]);

type UsePricelistMasmSyncJobPollOptions = {
  enabled?: boolean;
  onUpdate?: (job: CatalogPricelistMasmCoreSyncJob) => void;
  onTerminal?: (job: CatalogPricelistMasmCoreSyncJob) => void;
};

export function usePricelistMasmSyncJobPoll(
  pricelistUuid: string | null,
  jobUuid: string | null,
  options: UsePricelistMasmSyncJobPollOptions = {},
) {
  const { enabled = true, onUpdate, onTerminal } = options;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const terminalHandledRef = useRef(false);
  const onUpdateRef = useRef(onUpdate);
  const onTerminalRef = useRef(onTerminal);

  onUpdateRef.current = onUpdate;
  onTerminalRef.current = onTerminal;

  useEffect(() => {
    if (!pricelistUuid || !jobUuid || !enabled) {
      return undefined;
    }

    const activePricelistUuid = pricelistUuid;
    const activeJobUuid = jobUuid;
    terminalHandledRef.current = false;
    let cancelled = false;

    function stopPolling() {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    function handleTerminal(job: CatalogPricelistMasmCoreSyncJob) {
      if (terminalHandledRef.current) {
        return;
      }
      terminalHandledRef.current = true;
      stopPolling();
      onTerminalRef.current?.(job);
    }

    async function poll() {
      try {
        const job = await fetchCatalogMasmCorePriceSyncJob(
          activePricelistUuid,
          activeJobUuid,
        );
        if (cancelled) {
          return;
        }
        onUpdateRef.current?.(job);
        if (!ACTIVE_STATUSES.has(job.status)) {
          handleTerminal(job);
        }
      } catch {
        // Keep polling on transient errors.
      }
    }

    void poll();
    timerRef.current = setInterval(() => {
      void poll();
    }, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      stopPolling();
    };
  }, [enabled, jobUuid, pricelistUuid]);
}
