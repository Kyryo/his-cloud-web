"use client";

import { MessageSquare } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  OpdComplaintComposer,
  OpdComplaintHpiField,
} from "@/features/clinical-opd/components/detail/OpdComplaintComposer";
import { OpdEncounterTabEmptyState } from "@/features/clinical-opd/components/detail/OpdEncounterTabEmptyState";
import { OpdEncounterTabSkeleton } from "@/features/clinical-opd/components/detail/OpdEncounterTabSkeleton";
import { useOpdEncounterWorkspace } from "@/features/clinical-opd/components/detail/opd-encounter-workspace-context";
import {
  useChiefComplaints,
  useDeleteChiefComplaint,
} from "@/features/clinical-opd/hooks/use-clinical-opd";

type OpdComplaintTabPanelProps = {
  visitUuid: string;
  encounterUuid: string;
  isActive?: boolean;
};

export function OpdComplaintTabPanel({
  visitUuid,
  encounterUuid,
  isActive = true,
}: OpdComplaintTabPanelProps) {
  const { isChartLocked, capabilities } = useOpdEncounterWorkspace();
  const complaints = useChiefComplaints(visitUuid, encounterUuid, isActive);
  const deleteComplaint = useDeleteChiefComplaint(visitUuid, encounterUuid);
  const canWriteComplaint =
    capabilities.includes("record_chief_complaint") && !isChartLocked;
  const canWriteHpi = capabilities.includes("record_hpi") && !isChartLocked;

  if (!isActive) return null;
  if (complaints.isLoading) return <OpdEncounterTabSkeleton rows={4} />;

  const items = complaints.data ?? [];

  return (
    <div className="space-y-6" data-testid="opd-complaint-tab-panel">
      {canWriteComplaint ? (
        <OpdComplaintComposer
          visitUuid={visitUuid}
          encounterUuid={encounterUuid}
          canWriteComplaint={canWriteComplaint}
          canWriteHpi={canWriteHpi}
        />
      ) : null}

      {items.length === 0 ? (
        canWriteComplaint ? null : (
          <OpdEncounterTabEmptyState
            icon={MessageSquare}
            title="No chief complaint"
            description="The first physician write starts the encounter."
          />
        )
      ) : (
        <section className="space-y-4">
          <h3 className="text-sm font-medium text-brand-navy">
            Recorded this visit
          </h3>
          <div>
            {items.map((complaint) => (
              <div key={complaint.uuid}>
                <OpdComplaintHpiField
                  visitUuid={visitUuid}
                  encounterUuid={encounterUuid}
                  complaint={complaint}
                  canWrite={canWriteHpi}
                />
                {canWriteComplaint ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="mt-2 h-8 px-0 text-destructive hover:bg-transparent hover:text-destructive"
                    onClick={() => {
                      void deleteComplaint.mutateAsync(complaint.uuid);
                    }}
                  >
                    Delete complaint
                  </Button>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
