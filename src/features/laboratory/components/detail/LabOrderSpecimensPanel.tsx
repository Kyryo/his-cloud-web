"use client";

import { useState } from "react";

import { SecondaryButton } from "@/components/ui/app-buttons";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  ListPageBlankState,
  ListPageDataTable,
  ListPageDataTableBody,
  ListPageDataTableCell,
  ListPageDataTableHeader,
  ListPageDataTableHeaderCell,
  ListPageDataTableHeaderRow,
  ListPageDataTableRow,
} from "@/features/app-shell/components/page-layout";
import { ConfirmLabActionDialog } from "@/features/laboratory/components/detail/ConfirmLabActionDialog";
import { useLabOrderDetailWorkspace } from "@/features/laboratory/components/detail/lab-order-detail-workspace-context";
import { rejectLabSpecimen } from "@/features/laboratory/services/laboratory.service";
import type { LabSpecimen } from "@/features/laboratory/types/laboratory.types";
import {
  formatLabDisplayDateTime,
  formatLabSpecimenStatusLabel,
} from "@/features/laboratory/utils/format-lab-order";
import { getErrorMessage } from "@/lib/fetch-error";
import { useToast } from "@/providers/toast-provider";

export function LabOrderSpecimensPanel() {
  const { toast } = useToast();
  const { specimens, onSpecimensUpdated, onRefresh } =
    useLabOrderDetailWorkspace();
  const [rejectTarget, setRejectTarget] = useState<LabSpecimen | null>(null);
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleReject() {
    if (!rejectTarget) {
      return;
    }
    if (!reason.trim()) {
      toast({
        variant: "error",
        title: "Reason required",
        description: "Enter a rejection reason before continuing.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const updated = await rejectLabSpecimen(rejectTarget.uuid, {
        reason: reason.trim(),
      });
      onSpecimensUpdated(
        specimens.map((specimen) =>
          specimen.uuid === updated.uuid ? updated : specimen,
        ),
      );
      toast({
        variant: "success",
        title: "Specimen rejected",
        description: `${updated.specimen_type_name} was marked rejected.`,
      });
      setRejectTarget(null);
      setReason("");
      onRefresh();
    } catch (error) {
      toast({
        variant: "error",
        title: "Could not reject specimen",
        description: getErrorMessage(error),
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (specimens.length === 0) {
    return (
      <ListPageBlankState
        compact
        icon="flask"
        title="No specimens recorded"
        description="Collect a specimen from the order actions to begin the laboratory workflow."
      />
    );
  }

  return (
    <div data-testid="lab-order-specimens-panel">
      <ListPageDataTable>
        <ListPageDataTableHeader>
          <ListPageDataTableHeaderRow>
            <ListPageDataTableHeaderCell>Type</ListPageDataTableHeaderCell>
            <ListPageDataTableHeaderCell>Status</ListPageDataTableHeaderCell>
            <ListPageDataTableHeaderCell className="hidden sm:table-cell">
              Collected
            </ListPageDataTableHeaderCell>
            <ListPageDataTableHeaderCell className="hidden md:table-cell">
              Barcode
            </ListPageDataTableHeaderCell>
            <ListPageDataTableHeaderCell className="text-right">
              Actions
            </ListPageDataTableHeaderCell>
          </ListPageDataTableHeaderRow>
        </ListPageDataTableHeader>
        <ListPageDataTableBody>
          {specimens.map((specimen) => (
            <ListPageDataTableRow key={specimen.uuid}>
              <ListPageDataTableCell>
                <p className="font-medium text-brand-navy">
                  {specimen.specimen_type_name}
                </p>
                <p className="font-mono text-xs text-dash-muted">
                  {specimen.specimen_type_code}
                </p>
              </ListPageDataTableCell>
              <ListPageDataTableCell>
                <Badge variant="outline" className="font-normal">
                  {formatLabSpecimenStatusLabel(specimen.status)}
                </Badge>
              </ListPageDataTableCell>
              <ListPageDataTableCell className="hidden sm:table-cell text-brand-slate">
                {formatLabDisplayDateTime(specimen.collected_at)}
              </ListPageDataTableCell>
              <ListPageDataTableCell className="hidden md:table-cell font-mono text-xs text-dash-muted">
                {specimen.barcode || "—"}
              </ListPageDataTableCell>
              <ListPageDataTableCell className="text-right">
                {specimen.status === "COLLECTED" ? (
                  <SecondaryButton
                    type="button"
                    className="h-8 text-xs"
                    onClick={() => {
                      setReason("");
                      setRejectTarget(specimen);
                    }}
                  >
                    Reject
                  </SecondaryButton>
                ) : (
                  <span className="text-xs text-dash-muted">—</span>
                )}
              </ListPageDataTableCell>
            </ListPageDataTableRow>
          ))}
        </ListPageDataTableBody>
      </ListPageDataTable>

      <ConfirmLabActionDialog
        open={Boolean(rejectTarget)}
        onOpenChange={(open) => {
          if (!open) {
            setRejectTarget(null);
            setReason("");
          }
        }}
        title="Reject specimen?"
        description="Provide a reason. Rejected specimens cannot be accessioned."
        confirmLabel="Reject specimen"
        tone="danger"
        isSubmitting={isSubmitting}
        onConfirm={() => void handleReject()}
      >
        <div className="space-y-2">
          <Label htmlFor="lab-specimen-reject-reason">Reason</Label>
          <textarea
            id="lab-specimen-reject-reason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            rows={3}
            className="w-full rounded-lg border border-dash-border bg-white px-3 py-2 text-sm"
            placeholder="e.g. Hemolyzed / insufficient volume"
          />
        </div>
      </ConfirmLabActionDialog>
    </div>
  );
}
