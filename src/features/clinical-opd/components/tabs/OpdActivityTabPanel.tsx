"use client";

import {
  DetailPageMainAsideGrid,
  DetailPageMainSection,
} from "@/features/app-shell/components/page-layout";
import { OpdEncounterTabSkeleton } from "@/features/clinical-opd/components/detail/OpdEncounterTabSkeleton";
import { OpdClinicalTimeline } from "@/features/clinical-opd/components/shared/OpdClinicalTimeline";
import { OpdActivityAsidePanel } from "@/features/clinical-opd/components/tabs/OpdActivityAsidePanel";
import { useEncounterWorkspace } from "@/features/clinical-opd/hooks/use-clinical-opd";

type OpdActivityTabPanelProps = {
  visitUuid: string;
  encounterUuid: string;
  isActive?: boolean;
};

export function OpdActivityTabPanel({
  visitUuid,
  encounterUuid,
  isActive = true,
}: OpdActivityTabPanelProps) {
  const { timeline, orders, nursingNotes, observations } =
    useEncounterWorkspace(visitUuid, encounterUuid);

  if (!isActive) {
    return null;
  }

  const asideLoading =
    orders.isLoading || nursingNotes.isLoading || observations.isLoading;

  if (timeline.isLoading) {
    return <OpdEncounterTabSkeleton rows={4} />;
  }

  return (
    <div data-testid="opd-activity-tab-panel">
      <DetailPageMainAsideGrid data-testid="opd-activity-layout">
        <DetailPageMainSection className="py-4">
          <OpdClinicalTimeline
            events={timeline.data ?? []}
            title="Activity"
            description="Clinical events recorded for this encounter."
            emptyTitle="No clinical activity yet"
            emptyDescription="Complaints, exams, orders, diagnoses, and medications will appear here as they are recorded."
            data-testid="opd-activity-log"
          />
        </DetailPageMainSection>

        <OpdActivityAsidePanel
          orders={orders.data ?? []}
          nursingNotes={nursingNotes.data ?? []}
          observations={observations.data ?? []}
          isLoading={asideLoading}
        />
      </DetailPageMainAsideGrid>
    </div>
  );
}
