"use client";

import { Skeleton } from "@/components/ui/skeleton";
import type { AppointmentSummaryStats } from "@/features/appointments/types/appointment.types";
import { formatCompactNumber } from "@/utils/format-compact-number";

type AppointmentSummaryStatsCardsProps = {
  stats: AppointmentSummaryStats | null;
  isLoading?: boolean;
};

export function AppointmentSummaryStatsCards({
  stats,
  isLoading = false,
}: AppointmentSummaryStatsCardsProps) {
  if (isLoading) {
    return (
      <div
        className="grid grid-cols-2 divide-y divide-dash-border/60 border-y border-dash-border/80 py-2 sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x"
        data-testid="appointment-summary-stats"
        aria-busy="true"
      >
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="p-3.5 sm:p-4">
            <Skeleton className="h-3.5 w-20" />
            <Skeleton className="mt-2.5 h-8 w-16" />
            <Skeleton className="mt-1.5 h-3 w-28" />
          </div>
        ))}
      </div>
    );
  }

  const todayCount = stats?.todays_appointments ?? 0;
  const upcomingCount = stats?.upcoming_appointments ?? 0;
  const inProgressCount = stats?.in_progress ?? 0;
  const cancelledTodayCount = stats?.cancelled_today ?? 0;

  return (
    <dl
      className="grid grid-cols-2 divide-y divide-dash-border/60 border-y border-dash-border/80 py-2 sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x"
      data-testid="appointment-summary-stats"
    >
      {/* 1. Today */}
      <div className="p-3.5 transition-colors hover:bg-dash-canvas/40 sm:p-4">
        <div className="flex items-center gap-2">
          <span className="size-2 shrink-0 rounded-full bg-teal-500" />
          <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-dash-muted">
            Today
          </dt>
        </div>
        <dd className="mt-1.5 text-2xl font-bold tracking-tight text-brand-navy tabular-nums sm:text-3xl">
          {formatCompactNumber(todayCount)}
        </dd>
        <p className="mt-0.5 text-xs text-brand-muted">Scheduled for today</p>
      </div>

      {/* 2. Upcoming */}
      <div className="p-3.5 transition-colors hover:bg-dash-canvas/40 sm:p-4">
        <div className="flex items-center gap-2">
          <span className="size-2 shrink-0 rounded-full bg-indigo-500" />
          <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-dash-muted">
            Upcoming
          </dt>
        </div>
        <dd className="mt-1.5 text-2xl font-bold tracking-tight text-brand-navy tabular-nums sm:text-3xl">
          {formatCompactNumber(upcomingCount)}
        </dd>
        <p className="mt-0.5 text-xs text-brand-muted">Future bookings</p>
      </div>

      {/* 3. In Progress */}
      <div className="p-3.5 transition-colors hover:bg-dash-canvas/40 sm:p-4">
        <div className="flex items-center gap-2">
          {inProgressCount > 0 ? (
            <span className="relative flex size-2 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-amber-500" />
            </span>
          ) : (
            <span className="size-2 shrink-0 rounded-full bg-amber-500" />
          )}
          <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-dash-muted">
            In progress
          </dt>
        </div>
        <dd className="mt-1.5 text-2xl font-bold tracking-tight text-brand-navy tabular-nums sm:text-3xl">
          {formatCompactNumber(inProgressCount)}
        </dd>
        <p className="mt-0.5 text-xs text-brand-muted">
          {inProgressCount > 0 ? (
            <span className="font-medium text-amber-700">Currently in consultation</span>
          ) : (
            "Active sessions"
          )}
        </p>
      </div>

      {/* 4. Cancelled today */}
      <div className="p-3.5 transition-colors hover:bg-dash-canvas/40 sm:p-4">
        <div className="flex items-center gap-2">
          <span className="size-2 shrink-0 rounded-full bg-slate-400" />
          <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-dash-muted">
            Cancelled today
          </dt>
        </div>
        <dd className="mt-1.5 text-2xl font-bold tracking-tight text-brand-navy tabular-nums sm:text-3xl">
          {formatCompactNumber(cancelledTodayCount)}
        </dd>
        <p className="mt-0.5 text-xs text-brand-muted">Voided bookings</p>
      </div>
    </dl>
  );
}
