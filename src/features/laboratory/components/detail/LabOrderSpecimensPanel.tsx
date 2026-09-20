"use client";

import { useState } from "react";

import { SecondaryButton } from "@/components/ui/app-buttons";
import { Label } from "@/components/ui/label";
import { ListPageBlankState } from "@/features/app-shell/components/page-layout";
import { ConfirmLabActionDialog } from "@/features/laboratory/components/detail/ConfirmLabActionDialog";
import { useLabOrderDetailWorkspace } from "@/features/laboratory/components/detail/lab-order-detail-workspace-context";
import { rejectLabSpecimen } from "@/features/laboratory/services/laboratory.service";
import type { LabSpecimen } from "@/features/laboratory/types/laboratory.types";
import { formatLabDisplayDateTime } from "@/features/laboratory/utils/format-lab-order";
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
      <div className="p-4 sm:p-6">
        <ListPageBlankState
          compact
          icon="flask"
          title="No specimens recorded"
          description="Collect a specimen from the order actions to begin the laboratory workflow. Specimens collected in this session appear here."
        />
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 sm:p-6" data-testid="lab-order-specimens-panel">
      <div>
        <h2 className="text-base font-semibold text-brand-navy">Specimens</h2>
        <p className="mt-1 text-sm text-brand-muted">
          Collected and accessioned specimens for this order.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-dash-border">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-dash-canvas/60 text-xs uppercase tracking-wide text-brand-muted">
            <tr>
              <th className="px-4 py-2.5 font-medium">Type</th>
              <th className="px-4 py-2.5 font-medium">Status</th>
              <th className="px-4 py-2.5 font-medium">Collected</th>
              <th className="px-4 py-2.5 font-medium">Barcode</th>
              <th className="px-4 py-2.5 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dash-border">
            {specimens.map((specimen) => (
              <tr key={specimen.uuid}>
                <td className="px-4 py-3">
                  <div className="font-medium text-brand-navy">
                    {specimen.specimen_type_name}
                  </div>
                  <div className="font-mono text-xs text-brand-muted">
                    {specimen.specimen_type_code}
                  </div>
                </td>
                <td className="px-4 py-3 text-brand-slate">{specimen.status}</td>
                <td className="px-4 py-3 text-brand-slate">
                  {formatLabDisplayDateTime(specimen.collected_at)}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-brand-muted">
                  {specimen.barcode || "—"}
                </td>
                <td className="px-4 py-3">
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
                    <span className="text-xs text-brand-muted">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
