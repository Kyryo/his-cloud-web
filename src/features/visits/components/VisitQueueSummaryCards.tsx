"use client";

import { Skeleton } from "@/components/ui/skeleton";
import {
  LIST_PAGE_INSIGHT_CELL_CLASS,
  LIST_PAGE_INSIGHT_LABEL_CLASS,
  LIST_PAGE_INSIGHT_STRIP_CLASS,
  LIST_PAGE_INSIGHT_VALUE_CLASS,
} from "@/features/app-shell/components/page-layout";
import type { VisitQueueSummary } from "@/features/visits/types/visit.types";
import { formatCompactNumber } from "@/utils/format-compact-number";

type VisitQueueSummaryCardsProps = {
  stats: VisitQueueSummary | null;
  isLoading?: boolean;
};

const EMPTY_STATS: VisitQueueSummary = {
  todays_visits: 0,
  todays_active_visits: 0,
  todays_completed_visits: 0,
  total_visits: 0,
};

export function VisitQueueSummaryCards({
  stats,
  isLoading = false,
}: VisitQueueSummaryCardsProps) {
  if (isLoading) {
    return (
      <div
        className={LIST_PAGE_INSIGHT_STRIP_CLASS}
        data-testid="visit-queue-summary-stats"
        aria-busy="true"
      >
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className={LIST_PAGE_INSIGHT_CELL_CLASS}>
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="mt-2 h-6 w-14" />
          </div>
        ))}
      </div>
    );
  }

  const buckets = stats ?? EMPTY_STATS;

  return (
    <dl
      className={LIST_PAGE_INSIGHT_STRIP_CLASS}
      data-testid="visit-queue-summary-stats"
    >
      <div className={LIST_PAGE_INSIGHT_CELL_CLASS}>
        <dt className={LIST_PAGE_INSIGHT_LABEL_CLASS}>Today&apos;s visits</dt>
        <dd className={LIST_PAGE_INSIGHT_VALUE_CLASS}>
          {formatCompactNumber(buckets.todays_visits)}
        </dd>
      </div>

      <div className={LIST_PAGE_INSIGHT_CELL_CLASS}>
        <dt className={LIST_PAGE_INSIGHT_LABEL_CLASS}>Today&apos;s active</dt>
        <dd className={LIST_PAGE_INSIGHT_VALUE_CLASS}>
          {formatCompactNumber(buckets.todays_active_visits)}
        </dd>
      </div>

      <div className={LIST_PAGE_INSIGHT_CELL_CLASS}>
        <dt className={LIST_PAGE_INSIGHT_LABEL_CLASS}>Today&apos;s completed</dt>
        <dd className={LIST_PAGE_INSIGHT_VALUE_CLASS}>
          {formatCompactNumber(buckets.todays_completed_visits)}
        </dd>
      </div>

      <div className={LIST_PAGE_INSIGHT_CELL_CLASS}>
        <dt className={LIST_PAGE_INSIGHT_LABEL_CLASS}>Total visits</dt>
        <dd className={LIST_PAGE_INSIGHT_VALUE_CLASS}>
          {formatCompactNumber(buckets.total_visits)}
        </dd>
      </div>
    </dl>
  );
}
