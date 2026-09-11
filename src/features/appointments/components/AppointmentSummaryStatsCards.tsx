"use client";

import { Skeleton } from "@/components/ui/skeleton";
import {
  LIST_PAGE_INSIGHT_CELL_CLASS,
  LIST_PAGE_INSIGHT_LABEL_CLASS,
  LIST_PAGE_INSIGHT_STRIP_CLASS,
  LIST_PAGE_INSIGHT_VALUE_CLASS,
} from "@/features/app-shell/components/page-layout";
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
        className={LIST_PAGE_INSIGHT_STRIP_CLASS}
        data-testid="appointment-summary-stats"
        aria-busy="true"
      >
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className={LIST_PAGE_INSIGHT_CELL_CLASS}>
            <Skeleton className="h-3.5 w-20" />
            <Skeleton className="mt-2 h-6 w-14" />
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
      className={LIST_PAGE_INSIGHT_STRIP_CLASS}
      data-testid="appointment-summary-stats"
    >
      <div className={LIST_PAGE_INSIGHT_CELL_CLASS}>
        <dt className={LIST_PAGE_INSIGHT_LABEL_CLASS}>
          Today
        </dt>
        <dd className={LIST_PAGE_INSIGHT_VALUE_CLASS}>
          {formatCompactNumber(todayCount)}
        </dd>
        <p className="mt-0.5 text-xs text-brand-muted">Scheduled for today</p>
      </div>

      <div className={LIST_PAGE_INSIGHT_CELL_CLASS}>
        <dt className={LIST_PAGE_INSIGHT_LABEL_CLASS}>
          Upcoming
        </dt>
        <dd className={LIST_PAGE_INSIGHT_VALUE_CLASS}>
          {formatCompactNumber(upcomingCount)}
        </dd>
        <p className="mt-0.5 text-xs text-brand-muted">Future bookings</p>
      </div>

      <div className={LIST_PAGE_INSIGHT_CELL_CLASS}>
        <dt className={LIST_PAGE_INSIGHT_LABEL_CLASS}>
          In progress
        </dt>
        <dd className={LIST_PAGE_INSIGHT_VALUE_CLASS}>
          {formatCompactNumber(inProgressCount)}
        </dd>
        <p className="mt-0.5 text-xs text-brand-muted">
          {inProgressCount > 0 ? "Currently in consultation" : "Active sessions"}
        </p>
      </div>

      <div className={LIST_PAGE_INSIGHT_CELL_CLASS}>
        <dt className={LIST_PAGE_INSIGHT_LABEL_CLASS}>
          Cancelled today
        </dt>
        <dd className={LIST_PAGE_INSIGHT_VALUE_CLASS}>
          {formatCompactNumber(cancelledTodayCount)}
        </dd>
        <p className="mt-0.5 text-xs text-brand-muted">Voided bookings</p>
      </div>
    </dl>
  );
}
