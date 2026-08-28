"use client";

import { useEffect, useRef } from "react";

import { fetchClaim } from "@/features/claims/services/claims.service";
import type { ClaimDetail } from "@/features/claims/types/claims.types";
import { isClaimAdvisoryProcessing } from "@/features/claims/utils/claim-advisory-status";
import { useToast } from "@/providers/toast-provider";

const POLL_INTERVAL_MS = 2500;

type UseClaimAdvisoryPollOptions = {
  enabled?: boolean;
  notifyWhenReady?: boolean;
  onUpdate?: (claim: ClaimDetail) => void;
};

export function useClaimAdvisoryPoll(
  claim: ClaimDetail | null,
  options: UseClaimAdvisoryPollOptions = {},
) {
  const { enabled = true, notifyWhenReady = false, onUpdate } = options;
  const { toast } = useToast();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;
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

    function stopPolling() {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    async function poll() {
      try {
        const next = await fetchClaim(claimId as number);
        if (cancelled) {
          return;
        }
        onUpdateRef.current?.(next);
        if (!isClaimAdvisoryProcessing(next)) {
          stopPolling();
          if (notifyWhenReady && wasProcessingRef.current) {
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
  }, [claimId, notifyWhenReady, shouldPoll, toast]);
}
