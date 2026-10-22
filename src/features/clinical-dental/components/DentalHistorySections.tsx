"use client";

import { Skeleton } from "@/components/ui/skeleton";
import {
  DentalFindingList,
  DentalProcedureList,
} from "@/features/clinical-dental/components/DentalHistoryLists";
import { useDentalHistorySections } from "@/features/clinical-dental/hooks/use-clinical-dental";
import type { ClinicalWorkspaceHistorySectionProps } from "@/features/clinical-workspace/types/clinical-workspace.types";

function SectionsLoading() {
  return (
    <div className="space-y-3" aria-busy="true">
      {Array.from({ length: 3 }).map((_, index) => (
        <Skeleton key={index} className="h-12 w-full rounded-lg" />
      ))}
    </div>
  );
}

/** History column: chart findings recorded at the selected earlier visit. */
export function DentalChartFindingsHistorySection({
  visitUuid,
  encounterUuid,
  historyEncounterUuid,
}: ClinicalWorkspaceHistorySectionProps) {
  const query = useDentalHistorySections(visitUuid, encounterUuid, historyEncounterUuid);
  if (query.isLoading) {
    return <SectionsLoading />;
  }
  return (
    <DentalFindingList
      findings={query.data?.chart_findings ?? []}
      emptyMessage="No chart findings on this visit."
    />
  );
}

/** History column: procedures performed at the selected earlier visit. */
export function DentalProceduresHistorySection({
  visitUuid,
  encounterUuid,
  historyEncounterUuid,
}: ClinicalWorkspaceHistorySectionProps) {
  const query = useDentalHistorySections(visitUuid, encounterUuid, historyEncounterUuid);
  if (query.isLoading) {
    return <SectionsLoading />;
  }
  return (
    <DentalProcedureList
      procedures={query.data?.procedures ?? []}
      emptyMessage="No procedures on this visit."
    />
  );
}
