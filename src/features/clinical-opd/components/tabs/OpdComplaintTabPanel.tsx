"use client";

import { useState } from "react";
import { MessageSquare } from "lucide-react";

import { Button } from "@/components/ui/button";
import { OpdComplaintComposer } from "@/features/clinical-opd/components/detail/OpdComplaintComposer";
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
  const [isAddingAnother, setIsAddingAnother] = useState(false);
  const canWriteComplaint =
    capabilities.includes("record_chief_complaint") && !isChartLocked;
  const canWriteHpi = capabilities.includes("record_hpi") && !isChartLocked;

  if (!isActive) return null;
  if (complaints.isLoading) return <OpdEncounterTabSkeleton rows={4} />;

  const items = complaints.data ?? [];
  const showNewComposer = canWriteComplaint && (items.length === 0 || isAddingAnother);

  return (
    <div className="space-y-8" data-testid="opd-complaint-tab-panel">
      {items.map((complaint) => (
        <OpdComplaintComposer
          key={complaint.uuid}
          visitUuid={visitUuid}
          encounterUuid={encounterUuid}
          complaint={complaint}
          canWriteComplaint={canWriteComplaint}
          canWriteHpi={canWriteHpi}
          onDelete={() => {
            void deleteComplaint.mutateAsync(complaint.uuid);
          }}
        />
      ))}

      {showNewComposer ? (
        <OpdComplaintComposer
          visitUuid={visitUuid}
          encounterUuid={encounterUuid}
          canWriteComplaint={canWriteComplaint}
          canWriteHpi={canWriteHpi}
        />
      ) : null}

      {items.length === 0 && !canWriteComplaint ? (
        <OpdEncounterTabEmptyState
          icon={MessageSquare}
          title="No chief complaint"
          description="The first physician write starts the encounter."
        />
      ) : null}

      {canWriteComplaint && items.length > 0 && !isAddingAnother ? (
        <Button
          type="button"
          variant="ghost"
          className="h-9 px-0 text-brand-primary hover:bg-transparent"
          onClick={() => setIsAddingAnother(true)}
        >
          Add another complaint
        </Button>
      ) : null}
    </div>
  );
}
