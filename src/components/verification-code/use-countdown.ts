"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type UseCountdownOptions = {
  /** Total countdown duration in seconds. */
  durationSeconds: number;
  /** Start counting when the hook mounts (client-only). */
  autoStart?: boolean;
};

type UseCountdownResult = {
  /** Remaining seconds. */
  secondsRemaining: number;
  /** Formatted as MM:SS. */
  formatted: string;
  /** True when the countdown has reached zero. */
  isExpired: boolean;
  /** Restart the countdown from the initial duration. */
  reset: () => void;
};

/** Formats seconds as MM:SS (e.g. 59 → "00:59"). */
export function formatCountdown(seconds: number): string {
  const clamped = Math.max(0, seconds);
  const minutes = Math.floor(clamped / 60);
  const secs = clamped % 60;
  return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

/**
 * SSR-safe countdown timer with automatic interval cleanup.
 * The timer only starts after mount on the client.
 */
export function useCountdown({
  durationSeconds,
  autoStart = true,
}: UseCountdownOptions): UseCountdownResult {
  const [secondsRemaining, setSecondsRemaining] = useState(durationSeconds);
  const [isActive, setIsActive] = useState(autoStart);
  const durationRef = useRef(durationSeconds);

  useEffect(() => {
    durationRef.current = durationSeconds;
  }, [durationSeconds]);

  const reset = useCallback(() => {
    setSecondsRemaining(durationRef.current);
    setIsActive(true);
  }, []);

  useEffect(() => {
    if (!isActive || secondsRemaining <= 0) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setSecondsRemaining((current) => {
        if (current <= 1) {
          setIsActive(false);
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isActive, secondsRemaining]);

  const formatted = useMemo(
    () => formatCountdown(secondsRemaining),
    [secondsRemaining],
  );

  return {
    secondsRemaining,
    formatted,
    isExpired: secondsRemaining === 0,
    reset,
  };
}
