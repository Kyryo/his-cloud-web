"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { fetchAppointments } from "@/features/appointments/services/appointments.service";
import type {
  Appointment,
  FetchAppointmentsOptions,
} from "@/features/appointments/types/appointment.types";
import { resolveAppointmentRangeBounds } from "@/features/appointments/utils/appointment-calendar-utils";

const RANGE_PAGE_SIZE = 200;

type UseAppointmentsRangeOptions = {
  visibleMonth: Date;
  extraFilters?: Omit<FetchAppointmentsOptions, "page" | "pageSize" | "search">;
  search?: string;
  enabled?: boolean;
};

async function fetchAllAppointmentsInRange(
  options: FetchAppointmentsOptions,
): Promise<Appointment[]> {
  const all: Appointment[] = [];
  let page = 1;

  while (true) {
    const response = await fetchAppointments({
      ...options,
      page,
      pageSize: RANGE_PAGE_SIZE,
    });

    all.push(...response.results);

    const totalCount = response.pagination?.count ?? response.results.length;
    if (all.length >= totalCount || response.results.length < RANGE_PAGE_SIZE) {
      break;
    }

    page += 1;
  }

  return all;
}

export function useAppointmentsRange({
  visibleMonth,
  extraFilters,
  search,
  enabled = true,
}: UseAppointmentsRangeOptions) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const rangeBounds = useMemo(
    () =>
      resolveAppointmentRangeBounds(visibleMonth, {
        scheduledFrom: extraFilters?.scheduledFrom ?? "",
        scheduledTo: extraFilters?.scheduledTo ?? "",
      }),
    [extraFilters?.scheduledFrom, extraFilters?.scheduledTo, visibleMonth],
  );

  const fetchOptions = useMemo(
    (): FetchAppointmentsOptions => ({
      ...extraFilters,
      ...rangeBounds,
      search: search || undefined,
    }),
    [extraFilters, rangeBounds, search],
  );

  const reload = useCallback(async () => {
    if (!enabled) {
      return;
    }

    setIsRefreshing(true);
    setError(null);

    try {
      const results = await fetchAllAppointmentsInRange(fetchOptions);
      setAppointments(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load appointments.");
    } finally {
      setIsRefreshing(false);
    }
  }, [enabled, fetchOptions]);

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    let active = true;

    async function load() {
      setIsLoading(true);
      setError(null);

      try {
        const results = await fetchAllAppointmentsInRange(fetchOptions);
        if (active) {
          setAppointments(results);
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error ? err.message : "Failed to load appointments.",
          );
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, [enabled, fetchOptions]);

  return {
    appointments,
    isLoading,
    isRefreshing,
    error,
    reload,
    rangeBounds,
  };
}
