"use client";

import { useMemo, useState } from "react";

import { PrimaryButton } from "@/components/ui/app-buttons";
import { ConfirmLabActionDialog } from "@/features/laboratory/components/detail/ConfirmLabActionDialog";
import { useLabOrderDetailWorkspace } from "@/features/laboratory/components/detail/lab-order-detail-workspace-context";
import {
  fetchLabOrder,
  releaseLabOrderItemResults,
} from "@/features/laboratory/services/laboratory.service";
import type { LabOrderItem } from "@/features/laboratory/types/laboratory.types";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage } from "@/lib/bff-field-errors";
import { getErrorMessage } from "@/lib/fetch-error";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

type LabOrderDetailWorkflowActionsProps = {
  /** Tests in this panel/container only. */
  items: LabOrderItem[];
  className?: string;
  testId?: string;
};

function isSubmittableResult(item: LabOrderItem): boolean {
  return (
    item.result_status === "ENTERED" || item.result_status === "VERIFIED"
  );
}

function isUnvalidatedResult(item: LabOrderItem): boolean {
  return item.result_status === "ENTERED";
}

export function LabOrderDetailWorkflowActions({
  items,
  className,
  testId = "lab-action-submit",
}: LabOrderDetailWorkflowActionsProps) {
  const { order, onOrderUpdated } = useLabOrderDetailWorkspace();
  const { toast } = useToast();
  const [submitOpen, setSubmitOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const orderCancelled = order.status === "CANCELLED";
  const submittableItems = useMemo(
    () => items.filter(isSubmittableResult),
    [items],
  );
  const unvalidatedItems = useMemo(
    () => submittableItems.filter(isUnvalidatedResult),
    [submittableItems],
  );
  const canSubmit =
    !orderCancelled && !isSubmitting && submittableItems.length > 0;
  const hasUnvalidated = unvalidatedItems.length > 0;

  async function handleSubmit() {
    if (!submittableItems.length) {
      return;
    }

    setIsSubmitting(true);
    try {
      const failures: string[] = [];
      for (const item of submittableItems) {
        try {
          await releaseLabOrderItemResults(item.uuid, {
            allowUnverified: item.result_status === "ENTERED",
          });
        } catch (error) {
          failures.push(
            `${item.test_name}: ${
              error instanceof BffError
                ? formatBffErrorMessage(error.message, error.errors)
                : getErrorMessage(error)
            }`,
          );
        }
      }

      const updated = await fetchLabOrder(order.uuid);
      onOrderUpdated(updated);

      if (failures.length > 0) {
        toast({
          variant: "error",
          title: "Some results were not submitted",
          description: failures.slice(0, 3).join(" "),
        });
      } else {
        toast({
          variant: "success",
          title: "Results submitted",
          description: `${submittableItems.length} result${
            submittableItems.length === 1 ? "" : "s"
          } released to clinicians.`,
        });
      }
      setSubmitOpen(false);
    } catch (error) {
      toast({
        variant: "error",
        title: "Submit failed",
        description: getErrorMessage(error),
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <PrimaryButton
        type="button"
        size="sm"
        disabled={!canSubmit}
        onClick={() => setSubmitOpen(true)}
        className={cn("h-7 rounded-md px-2.5 text-xs", className)}
        data-testid={testId}
      >
        Submit
      </PrimaryButton>

      <ConfirmLabActionDialog
        open={submitOpen}
        onOpenChange={setSubmitOpen}
        title={hasUnvalidated ? "Submit unverified results?" : "Submit results?"}
        description={
          hasUnvalidated
            ? `${unvalidatedItems.length} of ${submittableItems.length} entered result${
                submittableItems.length === 1 ? "" : "s"
              } in this panel ${
                unvalidatedItems.length === 1 ? "has" : "have"
              } not been verified. Submit anyway?`
            : `Release ${submittableItems.length} entered result${
                submittableItems.length === 1 ? "" : "s"
              } from this panel to clinicians.`
        }
        confirmLabel={hasUnvalidated ? "Submit anyway" : "Submit"}
        tone={hasUnvalidated ? "danger" : "default"}
        isSubmitting={isSubmitting}
        onConfirm={() => {
          void handleSubmit();
        }}
      >
        <p className="text-sm text-brand-slate">
          {hasUnvalidated
            ? "Only entered tests in this panel will be submitted. Unverified results will still be released to clinicians."
            : "Only entered tests in this panel will be submitted. Draft or empty results are skipped."}
        </p>
      </ConfirmLabActionDialog>
    </>
  );
}
