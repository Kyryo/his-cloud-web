import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  APPOINTMENT_SEARCH_DEBOUNCE_MS,
  useAppointmentsList,
} from "@/features/appointments/hooks/use-appointments-list";
import type { Appointment } from "@/features/appointments/types/appointment.types";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("useAppointmentsList search debounce", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it("applies the typed query after a short delay", async () => {
    const fetchFn = vi.fn().mockResolvedValue({
      results: [] as Appointment[],
      pagination: { count: 0 },
    });

    const { result } = renderHook(() =>
      useAppointmentsList<Appointment>({ fetchFn }),
    );

    await act(async () => {
      await vi.runOnlyPendingTimersAsync();
    });

    act(() => {
      result.current.setSearch("ada");
    });

    expect(result.current.activeSearch).toBe("");

    await act(async () => {
      await vi.advanceTimersByTimeAsync(APPOINTMENT_SEARCH_DEBOUNCE_MS);
    });

    expect(result.current.activeSearch).toBe("ada");
    expect(fetchFn).toHaveBeenCalledWith(
      expect.objectContaining({ search: "ada" }),
    );
  });
});
