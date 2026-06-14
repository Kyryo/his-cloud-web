import { StatsCard1, StatsCard1Grid } from "@/components/stats-card1";
import type { TherapyVisit } from "@/features/therapy/types/therapy.types";

type TherapyVisitSummaryCardsProps = {
  visits: TherapyVisit[];
};

function getLocalDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function TherapyVisitSummaryCards({
  visits,
}: TherapyVisitSummaryCardsProps) {
  const today = getLocalDateKey(new Date());
  const activeVisits = visits.filter((visit) => visit.status === "active");

  return (
    <StatsCard1Grid>
      <StatsCard1
        title="Today's visits"
        value={visits.filter((visit) => visit.visit_date.slice(0, 10) === today).length}
      />
      <StatsCard1 title="Active visits" value={activeVisits.length} />
      <StatsCard1
        title="Cash visits (active)"
        value={
          activeVisits.filter((visit) => visit.mode_of_payment === "cash").length
        }
      />
      <StatsCard1
        title="Insurance visits (active)"
        value={
          activeVisits.filter((visit) => visit.mode_of_payment === "insurance")
            .length
        }
      />
    </StatsCard1Grid>
  );
}
