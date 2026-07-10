"use client";

import { useEffect, useRef } from "react";

import type { CatalogPricelistCopyJob } from "@/features/catalog/types/catalog.types";
import { fetchCatalogPricelistCopyJob } from "@/features/catalog/services/catalog.service";

const POLL_INTERVAL_MS = 2500;
const ACTIVE_STATUSES = new Set(["queued", "running"]);

type UsePricelistCopyJobPollOptions = {
  enabled?: boolean;
  onUpdate?: (job: CatalogPricelistCopyJob) => void;
  onTerminal?: (job: CatalogPricelistCopyJob) => void;
};

export function usePricelistCopyJobPoll(
  targetPricelistUuid: string | null,
  jobUuid: string | null,
  options: UsePricelistCopyJobPollOptions = {},
) {
  const { enabled = true, onUpdate, onTerminal } = options;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const terminalHandledRef = useRef(false);
  const onUpdateRef = useRef(onUpdate);
  const onTerminalRef = useRef(onTerminal);

  onUpdateRef.current = onUpdate;
  onTerminalRef.current = onTerminal;

  useEffect(() => {
    if (!targetPricelistUuid || !jobUuid || !enabled) {
      return undefined;
    }

    const activeTargetUuid = targetPricelistUuid;
    const activeJobUuid = jobUuid;
    terminalHandledRef.current = false;
    let cancelled = false;

    function stopPolling() {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    function handleTerminal(job: CatalogPricelistCopyJob) {
      if (terminalHandledRef.current) {
        return;
      }
      terminalHandledRef.current = true;
      stopPolling();
      onTerminalRef.current?.(job);
    }

    async function poll() {
      try {
        const job = await fetchCatalogPricelistCopyJob(activeTargetUuid, activeJobUuid);
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
  }, [enabled, jobUuid, targetPricelistUuid]);
}
