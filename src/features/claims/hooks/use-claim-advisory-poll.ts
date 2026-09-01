"use client";

import { useEffect, useRef } from "react";

import {
  fetchClaim,
  fetchClaimAdvisoryStatus,
} from "@/features/claims/services/claims.service";
import type { ClaimDetail } from "@/features/claims/types/claims.types";
import {
  isAdvisoryStatusSnapshotProcessing,
  isClaimAdvisoryProcessing,
  mergeClaimWithAdvisoryStatus,
} from "@/features/claims/utils/claim-advisory-status";
import { useToast } from "@/providers/toast-provider";

const POLL_INTERVAL_MS = 8000;
const MAX_POLL_DURATION_MS = 5 * 60 * 1000;

type UseClaimAdvisoryPollOptions = {
  enabled?: boolean;
  notifyWhenReady?: boolean;
  onUpdate?: (claim: ClaimDetail) => void;
};

function isDocumentHidden(): boolean {
  return typeof document !== "undefined" && document.visibilityState === "hidden";
}

export function useClaimAdvisoryPoll(
  claim: ClaimDetail | null,
  options: UseClaimAdvisoryPollOptions = {},
) {
  const { enabled = true, notifyWhenReady = false, onUpdate } = options;
  const { toast } = useToast();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;
  const claimRef = useRef(claim);
  claimRef.current = claim;
  const wasProcessingRef = useRef(false);

  const shouldPoll = Boolean(enabled && claim && isClaimAdvisoryProcessing(claim));
  const claimId = claim?.id ?? null;

  useEffect(() => {
    if (shouldPoll) {
      wasProcessingRef.current = true;
    }
  }, [shouldPoll]);

  useEffect(() => {
    if (!shouldPoll || claimId == null) {
      return undefined;
    }

    let cancelled = false;
    const startedAt = Date.now();

    function stopPolling() {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    function notifyFinished(next: ClaimDetail) {
      if (!notifyWhenReady || !wasProcessingRef.current) {
        return;
      }
      wasProcessingRef.current = false;
      if (next.advisory_status === "failed") {
        toast({
          variant: "error",
          title: "Advisories could not finish",
          description: "Try Re-evaluate to run the review again.",
        });
      } else if (next.has_blocking_advisories && !next.has_advisory_override) {
        toast({
          variant: "warning",
          title: "Advisories need attention",
          description: "Review the findings before submitting this claim.",
        });
      } else {
        toast({
          variant: "success",
          title: "Advisories are ready",
          description: "The background review has finished.",
        });
      }
    }

    async function poll() {
      if (isDocumentHidden()) {
        return;
      }

      if (Date.now() - startedAt > MAX_POLL_DURATION_MS) {
        stopPolling();
        if (notifyWhenReady && wasProcessingRef.current) {
          wasProcessingRef.current = false;
          toast({
            variant: "error",
            title: "Advisories timed out",
            description:
              "The review is taking longer than expected. Confirm the background worker is running and try Re-evaluate.",
          });
        }
        return;
      }

      try {
        const status = await fetchClaimAdvisoryStatus(claimId as number);
        if (cancelled) {
          return;
        }

        if (!isAdvisoryStatusSnapshotProcessing(status)) {
          const full = await fetchClaim(claimId as number);
          if (cancelled) {
            return;
          }
          onUpdateRef.current?.(full);
          stopPolling();
          notifyFinished(full);
          return;
        }

        const current = claimRef.current;
        if (current) {
          onUpdateRef.current?.(mergeClaimWithAdvisoryStatus(current, status));
        }
      } catch {
        // Keep polling on transient errors.
      }
    }

    function handleVisibilityChange() {
      if (!isDocumentHidden()) {
        void poll();
      }
    }

    void poll();
    timerRef.current = setInterval(() => {
      void poll();
    }, POLL_INTERVAL_MS);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      cancelled = true;
      stopPolling();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [claimId, notifyWhenReady, shouldPoll, toast]);
}
