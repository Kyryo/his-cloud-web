import type { ClinicalTimelineEvent } from "@/features/clinical-opd/types/clinical-opd.types";

export const OPD_OVERVIEW_RECENT_ACTIVITY_LIMIT = 5;

export function selectRecentOpdTimelineEvents(
  events: ClinicalTimelineEvent[] | undefined,
  limit = OPD_OVERVIEW_RECENT_ACTIVITY_LIMIT,
) {
  return (events ?? [])
    .toSorted(
      (left, right) =>
        new Date(right.occurred_at).getTime() -
        new Date(left.occurred_at).getTime(),
    )
    .slice(0, limit);
}
