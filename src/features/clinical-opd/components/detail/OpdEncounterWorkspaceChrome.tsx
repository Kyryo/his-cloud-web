"use client";

import { usePathname } from "next/navigation";

import { OpdEncounterTabs } from "@/features/clinical-opd/components/detail/OpdEncounterTabs";
import { OpdEncounterVitalsStatsStrip } from "@/features/clinical-opd/components/detail/OpdEncounterVitalsStatsStrip";
import { useOpdEncounterWorkspace } from "@/features/clinical-opd/components/detail/opd-encounter-workspace-context";
import { useEncounterWorkspace } from "@/features/clinical-opd/hooks/use-clinical-opd";
import {
  opdEncounterTabFromPathname,
  type OpdEncounterTabId,
} from "@/features/clinical-opd/utils/opd-encounter-tabs";

const PHYSICIAN_VITALS_TAB_IDS = new Set<OpdEncounterTabId>([
  "physical-examination",
  "orders",
  "diagnoses",
  "medications",
  "activity",
]);

export function OpdEncounterWorkspaceChrome() {
  const pathname = usePathname();
  const { visitUuid, encounterUuid } = useOpdEncounterWorkspace();
  const activeTab = opdEncounterTabFromPathname(
    pathname,
    visitUuid,
    encounterUuid,
  );
  const showVitalsStrip = PHYSICIAN_VITALS_TAB_IDS.has(activeTab);
  const { observations } = useEncounterWorkspace(visitUuid, encounterUuid);

  return (
    <div
      className="min-w-0 overflow-y-hidden bg-white"
      data-testid="opd-encounter-workspace-chrome"
    >
      <OpdEncounterTabs borderless />

      {showVitalsStrip ? (
        <OpdEncounterVitalsStatsStrip
          observations={observations.data ?? []}
          isLoading={observations.isLoading}
        />
      ) : (
        <div className="border-b border-dash-border/80" role="presentation" />
      )}
    </div>
  );
}
