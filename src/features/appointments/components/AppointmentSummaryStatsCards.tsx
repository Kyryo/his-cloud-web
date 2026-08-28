"use client";

import { StatsCard1, StatsCard1Grid } from "@/components/stats-card1";
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
  return (
    <StatsCard1Grid data-testid="appointment-summary-stats">
      <StatsCard1
        title="Today"
        icon="calendar"
        tone="teal"
        isLoading={isLoading}
        value={formatCompactNumber(stats?.todays_appointments ?? 0)}
      />
      <StatsCard1
        title="Upcoming"
        icon="calendarClock"
        tone="violet"
        isLoading={isLoading}
        value={formatCompactNumber(stats?.upcoming_appointments ?? 0)}
      />
      <StatsCard1
        title="In progress"
        icon="activity"
        tone="amber"
        isLoading={isLoading}
        value={formatCompactNumber(stats?.in_progress ?? 0)}
      />
      <StatsCard1
        title="Cancelled today"
        icon="clipboard"
        tone="rose"
        isLoading={isLoading}
        value={formatCompactNumber(stats?.cancelled_today ?? 0)}
      />
    </StatsCard1Grid>
  );
}
