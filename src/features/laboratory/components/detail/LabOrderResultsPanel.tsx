"use client";

import { useState } from "react";

import { PrimaryButton, SecondaryButton } from "@/components/ui/app-buttons";
import { Badge } from "@/components/ui/badge";
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
import { EnterResultsDialog } from "@/features/laboratory/components/detail/EnterResultsDialog";
import { useLabOrderDetailWorkspace } from "@/features/laboratory/components/detail/lab-order-detail-workspace-context";
import {
  fetchLabOrder,
  rejectLabOrderItemResults,
  releaseLabOrderItemResults,
  verifyLabOrderItemResults,
} from "@/features/laboratory/services/laboratory.service";
import type { LabOrderItem } from "@/features/laboratory/types/laboratory.types";
import {
  formatLabOrderItemStatusLabel,
  formatLabResultStatusLabel,
} from "@/features/laboratory/utils/format-lab-order";
import { getErrorMessage } from "@/lib/fetch-error";
import { useToast } from "@/providers/toast-provider";

type ConfirmAction = "verify" | "release" | "reject";

export function LabOrderResultsPanel() {
  const { toast } = useToast();
  const { order, onOrderUpdated, onRefresh } = useLabOrderDetailWorkspace();
  const [enterOpen, setEnterOpen] = useState(false);
  const [enterItemUuid, setEnterItemUuid] = useState<string | null>(null);
  const [confirmItem, setConfirmItem] = useState<LabOrderItem | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const items = order.items.filter((item) => item.status !== "CANCELLED");

  function openConfirm(item: LabOrderItem, action: ConfirmAction) {
    setConfirmItem(item);
    setConfirmAction(action);
    setRejectReason("");
  }

  async function handleConfirm() {
    if (!confirmItem || !confirmAction) {
      return;
    }
    if (confirmAction === "reject" && !rejectReason.trim()) {
      toast({
        variant: "error",
        title: "Reason required",
        description: "Enter a rejection reason before continuing.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      if (confirmAction === "verify") {
        await verifyLabOrderItemResults(confirmItem.uuid);
      } else if (confirmAction === "release") {
        await releaseLabOrderItemResults(confirmItem.uuid);
      } else {
        await rejectLabOrderItemResults(confirmItem.uuid, {
          reason: rejectReason.trim(),
        });
      }

      const refreshed = await fetchLabOrder(order.uuid);
      onOrderUpdated(refreshed);
      toast({
        variant: "success",
        title:
          confirmAction === "verify"
            ? "Results verified"
            : confirmAction === "release"
              ? "Results released"
              : "Results rejected",
        description: `${confirmItem.test_name} was updated.`,
      });
      setConfirmItem(null);
      setConfirmAction(null);
      onRefresh();
    } catch (error) {
      toast({
        variant: "error",
        title: "Could not update results",
        description: getErrorMessage(error),
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <ListPageBlankState
        compact
        icon="file"
        title="No resultable items"
        description="Order items eligible for results will appear here."
      />
    );
  }

  return (
    <div data-testid="lab-order-results-panel">
      <ListPageDataTable>
        <ListPageDataTableHeader>
          <ListPageDataTableHeaderRow>
            <ListPageDataTableHeaderCell>Test</ListPageDataTableHeaderCell>
            <ListPageDataTableHeaderCell className="hidden sm:table-cell">
              Item
            </ListPageDataTableHeaderCell>
            <ListPageDataTableHeaderCell>Result</ListPageDataTableHeaderCell>
            <ListPageDataTableHeaderCell className="text-right">
              Actions
            </ListPageDataTableHeaderCell>
          </ListPageDataTableHeaderRow>
        </ListPageDataTableHeader>
        <ListPageDataTableBody>
          {items.map((item) => {
            const canEnter =
              item.result_status !== "RELEASED" && item.status !== "RELEASED";
            const canVerify =
              item.result_status === "ENTERED" ||
              item.result_status === "DRAFT";
            const canRelease = item.result_status === "VERIFIED";
            const canReject =
              item.result_status === "ENTERED" ||
              item.result_status === "VERIFIED" ||
              item.result_status === "DRAFT";

            return (
              <ListPageDataTableRow key={item.uuid}>
                <ListPageDataTableCell>
                  <p className="font-medium text-brand-navy">{item.test_name}</p>
                  <p className="font-mono text-xs text-dash-muted">
                    {item.test_code}
                  </p>
                </ListPageDataTableCell>
                <ListPageDataTableCell className="hidden sm:table-cell">
                  <Badge variant="outline" className="font-normal">
                    {formatLabOrderItemStatusLabel(item.status)}
                  </Badge>
                </ListPageDataTableCell>
                <ListPageDataTableCell>
                  <span className="text-sm text-brand-slate">
                    {formatLabResultStatusLabel(item.result_status)}
                  </span>
                </ListPageDataTableCell>
                <ListPageDataTableCell>
                  <div className="flex flex-wrap justify-end gap-2">
                    {canEnter ? (
                      <PrimaryButton
                        type="button"
                        className="h-8 text-xs"
                        onClick={() => {
                          setEnterItemUuid(item.uuid);
                          setEnterOpen(true);
                        }}
                      >
                        Enter
                      </PrimaryButton>
                    ) : null}
                    {canVerify ? (
                      <SecondaryButton
                        type="button"
                        className="h-8 text-xs"
                        onClick={() => openConfirm(item, "verify")}
                      >
                        Verify
                      </SecondaryButton>
                    ) : null}
                    {canRelease ? (
                      <SecondaryButton
                        type="button"
                        className="h-8 text-xs"
                        onClick={() => openConfirm(item, "release")}
                      >
                        Release
                      </SecondaryButton>
                    ) : null}
                    {canReject ? (
                      <SecondaryButton
                        type="button"
                        className="h-8 text-xs text-rose-700"
                        onClick={() => openConfirm(item, "reject")}
                      >
                        Reject
                      </SecondaryButton>
                    ) : null}
                  </div>
                </ListPageDataTableCell>
              </ListPageDataTableRow>
            );
          })}
        </ListPageDataTableBody>
      </ListPageDataTable>

      <EnterResultsDialog
        order={order}
        open={enterOpen}
        initialItemUuid={enterItemUuid}
        onOpenChange={(open) => {
          setEnterOpen(open);
          if (!open) {
            setEnterItemUuid(null);
          }
        }}
        onSaved={async () => {
          try {
            const refreshed = await fetchLabOrder(order.uuid);
            onOrderUpdated(refreshed);
            onRefresh();
          } catch {
            onRefresh();
          }
        }}
      />

      <ConfirmLabActionDialog
        open={Boolean(confirmItem && confirmAction)}
        onOpenChange={(open) => {
          if (!open) {
            setConfirmItem(null);
            setConfirmAction(null);
            setRejectReason("");
          }
        }}
        title={
          confirmAction === "verify"
            ? "Verify results?"
            : confirmAction === "release"
              ? "Release results?"
              : "Reject results?"
        }
        description={
          confirmAction === "verify"
            ? "Verified results can then be released to clinicians."
            : confirmAction === "release"
              ? "Released results become visible on the clinical encounter."
              : "Rejected results return to an editable state after correction."
        }
        confirmLabel={
          confirmAction === "verify"
            ? "Verify"
            : confirmAction === "release"
              ? "Release"
              : "Reject"
        }
        tone={confirmAction === "reject" ? "danger" : "default"}
        isSubmitting={isSubmitting}
        onConfirm={() => void handleConfirm()}
      >
        {confirmAction === "reject" ? (
          <div className="space-y-2">
            <label
              htmlFor="lab-result-reject-reason"
              className="text-sm font-medium text-brand-navy"
            >
              Reason
            </label>
            <textarea
              id="lab-result-reject-reason"
              value={rejectReason}
              onChange={(event) => setRejectReason(event.target.value)}
              rows={3}
              className="w-full rounded-lg border border-dash-border bg-white px-3 py-2 text-sm"
              placeholder="Why are these results being rejected?"
            />
          </div>
        ) : undefined}
      </ConfirmLabActionDialog>
    </div>
  );
}
