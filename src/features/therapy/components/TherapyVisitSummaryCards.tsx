import { VisitQueueSummaryCards } from "@/features/visits/components/VisitQueueSummaryCards";
import type { TherapyVisitQueueStats } from "@/features/therapy/types/therapy.types";

type TherapyVisitSummaryCardsProps = {
  stats: TherapyVisitQueueStats | null;
  isLoading?: boolean;
};

export function TherapyVisitSummaryCards({
  stats,
  isLoading = false,
}: TherapyVisitSummaryCardsProps) {
  return <VisitQueueSummaryCards stats={stats} isLoading={isLoading} />;
}
