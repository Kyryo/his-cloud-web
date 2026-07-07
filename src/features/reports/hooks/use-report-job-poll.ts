"use client";

import { useEffect, useRef } from "react";

import type { ReportJob } from "@/features/reports/types/report-job.types";
import { fetchReportJob } from "@/features/reports/services/reports.service";

const POLL_INTERVAL_MS = 2500;
const ACTIVE_STATUSES = new Set(["queued", "running"]);

type UseReportJobPollOptions = {
  enabled?: boolean;
  onUpdate?: (job: ReportJob) => void;
  onTerminal?: (job: ReportJob) => void;
};

export function useReportJobPoll(
  jobUuid: string | null,
  options: UseReportJobPollOptions = {},
) {
  const { enabled = true, onUpdate, onTerminal } = options;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onUpdateRef = useRef(onUpdate);
  const onTerminalRef = useRef(onTerminal);

  onUpdateRef.current = onUpdate;
  onTerminalRef.current = onTerminal;

  useEffect(() => {
    if (!jobUuid || !enabled) {
      return undefined;
    }

    const activeJobUuid = jobUuid;

    let cancelled = false;

    function stopPolling() {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    async function poll() {
      try {
        const job = await fetchReportJob(activeJobUuid);
        if (cancelled) {
          return;
        }
        onUpdateRef.current?.(job);
        if (!ACTIVE_STATUSES.has(job.status)) {
          stopPolling();
          onTerminalRef.current?.(job);
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
  }, [enabled, jobUuid]);
}
