import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useCountdown } from "@/components/verification-code/use-countdown";

describe("useCountdown", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("counts down automatically and expires", () => {
    const { result } = renderHook(() =>
      useCountdown({ durationSeconds: 3, autoStart: true }),
    );

    expect(result.current.formatted).toBe("00:03");
    expect(result.current.isExpired).toBe(false);

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(result.current.formatted).toBe("00:00");
    expect(result.current.isExpired).toBe(true);
  });

  it("resets the countdown", () => {
    const { result } = renderHook(() =>
      useCountdown({ durationSeconds: 5, autoStart: true }),
    );

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(result.current.isExpired).toBe(true);

    act(() => {
      result.current.reset();
    });

    expect(result.current.formatted).toBe("00:05");
    expect(result.current.isExpired).toBe(false);
  });
});
