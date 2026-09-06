"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { OpdClinicalHistoryPanel } from "@/features/clinical-opd/components/detail/OpdClinicalHistoryPanel";
import { OpdEncounterVitalsStatsStrip } from "@/features/clinical-opd/components/detail/OpdEncounterVitalsStatsStrip";
import { OpdEncounterWorkspaceChrome } from "@/features/clinical-opd/components/detail/OpdEncounterWorkspaceChrome";
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
  const { visitUuid, encounterUuid } = useOpdEncounterWorkspace();
  const activeTab = opdEncounterTabFromPathname(
    pathname,
    visitUuid,
    encounterUuid,
  );
  const showHistoryLayout = isOpdPhysicianHistoryTab(activeTab);
  const { observations } = useEncounterWorkspace(visitUuid, encounterUuid);

  return (
    <div className="min-w-0" data-testid="opd-encounter-workspace-grid">
      <OpdEncounterWorkspaceChrome />

      {showHistoryLayout ? (
        <div
          className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_24rem]"
          data-testid="opd-physician-history-layout"
        >
          <div className="min-w-0">
            <OpdEncounterVitalsStatsStrip
              observations={observations.data ?? []}
              isLoading={observations.isLoading}
            />
            <div className="px-4 pb-4 sm:px-6">{children}</div>
          </div>
          <OpdClinicalHistoryPanel />
        </div>
      ) : (
        <>
          <div className="border-b border-dash-border/80" role="presentation" />
          <div className="px-4 pb-4 sm:px-6">{children}</div>
        </>
      )}
    </div>
  );
}
