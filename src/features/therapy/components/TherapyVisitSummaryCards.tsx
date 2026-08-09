import { StatsCard1, StatsCard1Grid } from "@/components/stats-card1";
import type { TherapyVisitQueueStats } from "@/features/therapy/types/therapy.types";

const EMPTY_STATS: TherapyVisitQueueStats = {
  todays_visits: 0,
  todays_active_visits: 0,
  todays_completed_visits: 0,
  total_visits: 0,
};

type TherapyVisitSummaryCardsProps = {
  stats: TherapyVisitQueueStats | null;
};

export function TherapyVisitSummaryCards({
  stats,
}: TherapyVisitSummaryCardsProps) {
  const values = stats ?? EMPTY_STATS;

  return (
    <StatsCard1Grid>
      <StatsCard1 title="Today's visits" value={values.todays_visits} />
      <StatsCard1
        title="Today's active visits"
        value={values.todays_active_visits}
      />
      <StatsCard1
        title="Today's completed visits"
        value={values.todays_completed_visits}
      />
      <StatsCard1 title="Total visits" value={values.total_visits} />
    </StatsCard1Grid>
  );
}
