"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import {
  DetailPageMainAsideGrid,
  DetailPageMainSection,
} from "@/features/app-shell/components/page-layout";
import { OpdClinicalHistoryPanel } from "@/features/clinical-opd/components/detail/OpdClinicalHistoryPanel";
import { OpdEncounterAllergyBanner } from "@/features/clinical-opd/components/detail/OpdEncounterAllergyBanner";
import { OpdEncounterSummaryPanel } from "@/features/clinical-opd/components/detail/OpdEncounterSummaryPanel";
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
  const { visitUuid, encounterUuid, customer, chartSummary } =
    useOpdEncounterWorkspace();
  const activeTab = opdEncounterTabFromPathname(
    pathname,
    visitUuid,
    encounterUuid,
  );
  const showHistoryLayout = isOpdPhysicianHistoryTab(activeTab);
  const showOverviewLayout = activeTab === "overview";
  const showVitalsStrip = !showOverviewLayout && activeTab !== "client";
  const { observations } = useEncounterWorkspace(visitUuid, encounterUuid);
  const stripObservations =
    observations.data ?? chartSummary?.this_encounter_vitals ?? [];

  return (
    <div
      className="flex min-w-0 flex-1 flex-col xl:flex-row"
      data-testid="opd-encounter-workspace-grid"
    >
      <OpdEncounterTabs />
      <div className="flex min-w-0 flex-1 flex-col">
        <OpdEncounterAllergyBanner allergies={chartSummary?.allergies ?? []} />
        {showVitalsStrip ? (
          <OpdEncounterVitalsStatsStrip
            observations={stripObservations}
            isLoading={observations.isLoading && !chartSummary}
          />
        ) : null}

        {showOverviewLayout ? (
          <DetailPageMainAsideGrid
            className="min-h-0 flex-1"
            data-testid="opd-overview-layout"
          >
            <DetailPageMainSection className="min-w-0 py-6">
              {children}
            </DetailPageMainSection>
            <OpdEncounterSummaryPanel customer={customer} />
          </DetailPageMainAsideGrid>
        ) : showHistoryLayout ? (
          <DetailPageMainAsideGrid
            className="min-h-0 flex-1"
            data-testid="opd-physician-history-layout"
          >
            <DetailPageMainSection className="min-w-0">
              {children}
            </DetailPageMainSection>
            <OpdClinicalHistoryPanel />
          </DetailPageMainAsideGrid>
        ) : (
          <DetailPageMainSection>{children}</DetailPageMainSection>
        )}
      </div>
    </div>
  );
}
