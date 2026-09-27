"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { DetailPageMainSection } from "@/features/app-shell/components/page-layout";
import { OpdEncounterAllergyBanner } from "@/features/clinical-opd/components/detail/OpdEncounterAllergyBanner";
import { OpdEncounterTabs } from "@/features/clinical-opd/components/detail/OpdEncounterTabs";
import { OpdEncounterVitalsStatsStrip } from "@/features/clinical-opd/components/detail/OpdEncounterVitalsStatsStrip";
import { useOpdEncounterWorkspace } from "@/features/clinical-opd/components/detail/opd-encounter-workspace-context";
import { useEncounterWorkspace } from "@/features/clinical-opd/hooks/use-clinical-opd";
import { opdEncounterTabFromPathname } from "@/features/clinical-opd/utils/opd-encounter-tabs";
import { isOpdPhysicianHistoryTab } from "@/features/clinical-opd/utils/opd-physician-history-tabs";

type OpdEncounterWorkspaceBodyProps = {
  children: ReactNode;
};

export function OpdEncounterWorkspaceBody({
  children,
}: OpdEncounterWorkspaceBodyProps) {
  const pathname = usePathname();
  const { visitUuid, encounterUuid, chartSummary } = useOpdEncounterWorkspace();
  const activeTab = opdEncounterTabFromPathname(
    pathname,
    visitUuid,
    encounterUuid,
  );
  const isConsultLayout = isOpdPhysicianHistoryTab(activeTab);
  // Activity uses a client-style main + aside grid and needs full width.
  const isFullWidthLayout = isConsultLayout || activeTab === "activity";
  const { observations } = useEncounterWorkspace(visitUuid, encounterUuid);
  const thisEncounterVitals =
    observations.data ?? chartSummary?.this_encounter_vitals ?? [];
  const stripObservations =
    thisEncounterVitals.length > 0
      ? thisEncounterVitals
      : (chartSummary?.last_vitals ?? []);

  return (
    <div
      className="flex min-w-0 flex-1 flex-col"
      data-testid="opd-encounter-workspace-grid"
    >
      <OpdEncounterAllergyBanner allergies={chartSummary?.allergies ?? []} />
      <OpdEncounterVitalsStatsStrip
        observations={stripObservations}
        encounterObservations={thisEncounterVitals}
        isLoading={observations.isLoading && !chartSummary}
      />
      <OpdEncounterTabs />

      {isFullWidthLayout ? (
        children
      ) : (
        <DetailPageMainSection className="max-w-3xl">{children}</DetailPageMainSection>
      )}
    </div>
  );
}
