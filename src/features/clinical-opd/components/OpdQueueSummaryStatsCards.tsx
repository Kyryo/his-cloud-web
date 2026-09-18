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

  const registeredCount = stats?.registered ?? 0;
  const readyCount = stats?.triaged ?? 0;
  const withClinicianCount = stats?.with_clinician ?? 0;
  const completedCount = stats?.completed ?? 0;

  return (
    <dl
      className={LIST_PAGE_INSIGHT_STRIP_CLASS}
      data-testid="opd-queue-summary-stats"
    >
      <div className={LIST_PAGE_INSIGHT_CELL_CLASS}>
        <dt className={LIST_PAGE_INSIGHT_LABEL_CLASS}>Registered</dt>
        <dd className={LIST_PAGE_INSIGHT_VALUE_CLASS}>
          {formatCompactNumber(registeredCount)}
        </dd>
        <p className="mt-0.5 text-xs text-brand-muted">Waiting for triage</p>
      </div>

      <div className={LIST_PAGE_INSIGHT_CELL_CLASS}>
        <dt className={LIST_PAGE_INSIGHT_LABEL_CLASS}>Ready</dt>
        <dd className={LIST_PAGE_INSIGHT_VALUE_CLASS}>
          {formatCompactNumber(readyCount)}
        </dd>
        <p className="mt-0.5 text-xs text-brand-muted">Triaged, still waiting</p>
      </div>

      <div className={LIST_PAGE_INSIGHT_CELL_CLASS}>
        <dt className={LIST_PAGE_INSIGHT_LABEL_CLASS}>With clinician</dt>
        <dd className={LIST_PAGE_INSIGHT_VALUE_CLASS}>
          {formatCompactNumber(withClinicianCount)}
        </dd>
        <p className="mt-0.5 text-xs text-brand-muted">Consult in progress</p>
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
