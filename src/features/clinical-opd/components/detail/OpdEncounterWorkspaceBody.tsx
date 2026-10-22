"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { DetailPageMainSection } from "@/features/app-shell/components/page-layout";
import { OpdEncounterAllergyBanner } from "@/features/clinical-opd/components/detail/OpdEncounterAllergyBanner";
import { OpdEncounterTabs } from "@/features/clinical-opd/components/detail/OpdEncounterTabs";
import { OpdEncounterVitalsStatsStrip } from "@/features/clinical-opd/components/detail/OpdEncounterVitalsStatsStrip";
import { useOpdEncounterWorkspace } from "@/features/clinical-opd/components/detail/opd-encounter-workspace-context";
import { useEncounterWorkspace } from "@/features/clinical-opd/hooks/use-clinical-opd";
import { useWorkspaceRouting } from "@/features/clinical-opd/hooks/use-workspace-routing";
import { workspaceTabFromPathname } from "@/features/clinical-workspace/utils/workspace-tabs";

type OpdEncounterWorkspaceBodyProps = {
  children: ReactNode;
};

export function OpdEncounterWorkspaceBody({
  children,
}: OpdEncounterWorkspaceBodyProps) {
  const pathname = usePathname();
  const routing = useWorkspaceRouting();
  const { visitUuid, encounterUuid, chartSummary } = useOpdEncounterWorkspace();
  const activeTab = workspaceTabFromPathname(
    routing,
    pathname,
    visitUuid,
    encounterUuid,
  );
  const isFullWidthLayout =
    activeTab !== null &&
    (routing.consultLayoutTabIds.has(activeTab) ||
      routing.fullWidthTabIds.has(activeTab));
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
