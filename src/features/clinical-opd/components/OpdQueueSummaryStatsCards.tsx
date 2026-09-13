"use client";

import { Skeleton } from "@/components/ui/skeleton";
import {
  LIST_PAGE_INSIGHT_CELL_CLASS,
  LIST_PAGE_INSIGHT_LABEL_CLASS,
  LIST_PAGE_INSIGHT_STRIP_CLASS,
  LIST_PAGE_INSIGHT_VALUE_CLASS,
} from "@/features/app-shell/components/page-layout";
import type { OpdQueueSummaryStats } from "@/features/clinical-opd/utils/opd-queue-stats";
import { formatCompactNumber } from "@/utils/format-compact-number";

type OpdQueueSummaryStatsCardsProps = {
  stats: OpdQueueSummaryStats | null;
  isLoading?: boolean;
};

export function OpdQueueSummaryStatsCards({
  stats,
  isLoading = false,
}: OpdQueueSummaryStatsCardsProps) {
  if (isLoading) {
    return (
      <div
        className={LIST_PAGE_INSIGHT_STRIP_CLASS}
        data-testid="opd-queue-summary-stats"
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

  const totalCount = stats?.total ?? 0;
  const waitingCount = stats?.waiting ?? 0;
  const inProgressCount = stats?.in_progress ?? 0;
  const completedCount = stats?.completed ?? 0;

  return (
    <dl
      className={LIST_PAGE_INSIGHT_STRIP_CLASS}
      data-testid="opd-queue-summary-stats"
    >
      <div className={LIST_PAGE_INSIGHT_CELL_CLASS}>
        <dt className={LIST_PAGE_INSIGHT_LABEL_CLASS}>Total encounters</dt>
        <dd className={LIST_PAGE_INSIGHT_VALUE_CLASS}>
          {formatCompactNumber(totalCount)}
        </dd>
        <p className="mt-0.5 text-xs text-brand-muted">Active OPD queue</p>
      </div>

      <div className={LIST_PAGE_INSIGHT_CELL_CLASS}>
        <dt className={LIST_PAGE_INSIGHT_LABEL_CLASS}>Waiting</dt>
        <dd className={LIST_PAGE_INSIGHT_VALUE_CLASS}>
          {formatCompactNumber(waitingCount)}
        </dd>
        <p className="mt-0.5 text-xs text-brand-muted">Awaiting clinical review</p>
      </div>

      <div className={LIST_PAGE_INSIGHT_CELL_CLASS}>
        <dt className={LIST_PAGE_INSIGHT_LABEL_CLASS}>In progress</dt>
        <dd className={LIST_PAGE_INSIGHT_VALUE_CLASS}>
          {formatCompactNumber(inProgressCount)}
        </dd>
        <p className="mt-0.5 text-xs text-brand-muted">
          {inProgressCount > 0 ? "Currently being seen" : "Active consultations"}
        </p>
      </div>

      <div className={LIST_PAGE_INSIGHT_CELL_CLASS}>
        <dt className={LIST_PAGE_INSIGHT_LABEL_CLASS}>Completed</dt>
        <dd className={LIST_PAGE_INSIGHT_VALUE_CLASS}>
          {formatCompactNumber(completedCount)}
        </dd>
        <p className="mt-0.5 text-xs text-brand-muted">Finished today</p>
      </div>
    </dl>
  );
}
