"use client";

import { CheckCircle2, Loader2 } from "lucide-react";
import { useState, type ReactNode } from "react";

import { PrimaryButton } from "@/components/ui/app-buttons";
import {
  WorkflowCard,
  type WorkflowStageConfig,
} from "@/components/ui/workflow-card";
import {
  ClaimAdvisoriesCard,
  isClaimSubmitBlockedByAdvisories,
} from "@/features/claims/components/ClaimAdvisoriesPanel";
import { EditClaimDialog } from "@/features/claims/components/EditClaimDialog";
import {
  ClaimRequirementsCard,
  ClaimRequirementsEditButton,
} from "@/features/claims/components/ClaimRequirementsCard";
import type { ClaimDetail } from "@/features/claims/types/claims.types";
import { getClaimWorkflowStageStates } from "@/features/claims/utils/claim-workflow-stages";
import {
  isBlockingRequirementItem,
  type InvoiceClaimReadinessItem,
} from "@/features/invoices/utils/invoice-claim-readiness";

export type ClaimWorkflowCardProps = {
  claim: ClaimDetail | null;
  /** System readiness used for create-claim gating / stage status. */
  readinessItems: InvoiceClaimReadinessItem[];
  /** Checks shown inside the Requirements findings-style card. */
  requirementItems: InvoiceClaimReadinessItem[];
  onClaimUpdated?: (claim: ClaimDetail) => void;
  notice?: ReactNode;
  onCreateClaim?: () => void;
  isCreating?: boolean;
  onSubmit?: () => void;
  isSubmitting?: boolean;
  /** When true, submit lives in this card's Queue stage (invoice tab). */
  showSubmitInQueue?: boolean;
  onAddDiagnosis?: () => void;
  className?: string;
};

/**
 * Three-stage claim lifecycle workflow: Requirements → Advisory → Queue.
 */
export function ClaimWorkflowCard({
  claim,
  readinessItems,
  requirementItems,
  onClaimUpdated,
  notice,
  onCreateClaim,
  isCreating = false,
  onSubmit,
  isSubmitting = false,
  showSubmitInQueue = false,
  onAddDiagnosis,
  className,
}: ClaimWorkflowCardProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const stageStates = getClaimWorkflowStageStates(requirementItems, claim);
  const requirements = stageStates.find((stage) => stage.id === "requirements")!;
  const advisory = stageStates.find((stage) => stage.id === "advisory")!;
  const queue = stageStates.find((stage) => stage.id === "queue")!;

  const allSystemReady = readinessItems
    .filter(isBlockingRequirementItem)
    .every((item) => item.met);
  const allRequirementsMet = requirementItems
    .filter(isBlockingRequirementItem)
    .every((item) => item.met);
  const isDraft = String(claim?.status ?? "").toLowerCase() === "draft";
  const canSubmit =
    Boolean(claim) &&
    isDraft &&
    !isClaimSubmitBlockedByAdvisories(claim!) &&
    Boolean(onSubmit);

  const requirementsFooter =
    claim && isDraft ? (
      <ClaimRequirementsEditButton onClick={() => setEditDialogOpen(true)} />
    ) : !claim && onCreateClaim ? (
      <PrimaryButton
        type="button"
        size="sm"
        className="h-9 px-4"
        disabled={isCreating || !allSystemReady || !allRequirementsMet}
        title={
          allSystemReady && allRequirementsMet
            ? undefined
            : "Resolve remaining requirements before creating a claim."
        }
        onClick={() => onCreateClaim()}
        data-testid="invoice-create-claim-button"
      >
        {isCreating ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Creating claim...
          </>
        ) : (
          "Create claim"
        )}
      </PrimaryButton>
    ) : null;

  const stages: WorkflowStageConfig[] = [
    {
      id: "requirements",
      title: "Requirements",
      summary: requirements.summary,
      status: requirements.status,
      // Keep open for drafts so Edit draft stays reachable after checks pass.
      defaultOpen: claim && isDraft ? true : undefined,
      content: (
        <div className="space-y-4">
          {notice}
          <ClaimRequirementsCard
            items={requirementItems}
            footerActions={requirementsFooter}
            onAddDiagnosis={onAddDiagnosis}
          />
        </div>
      ),
    },
    {
      id: "advisory",
      title: "Advisory",
      summary: advisory.summary,
      status: advisory.status,
      disabled: !claim,
      content: claim ? (
        <ClaimAdvisoriesCard
          claim={claim}
          onClaimUpdated={onClaimUpdated}
          variant="embedded"
        />
      ) : (
        <p className="text-sm text-brand-muted">
          Create a draft claim to evaluate it against the insurer&apos;s scheme
          rules.
        </p>
      ),
    },
    {
      id: "queue",
      title: "Queue for submission",
      summary: queue.summary,
      status: queue.status,
      disabled: !claim,
      content: (
        <div className="space-y-4">
          {queue.status === "current" && canSubmit ? (
            <p className="text-sm leading-relaxed text-brand-navy">
              Advisories are clear. Submit this claim to send it to the payer.
              Member verification happens at submit.
            </p>
          ) : null}
          {queue.status === "pending" ? (
            <p className="text-sm leading-relaxed text-brand-muted">
              Finish Requirements and clear Advisory blockers before this claim
              can be queued.
            </p>
          ) : null}
          {queue.status === "completed" ? (
            <div
              className="rounded-lg border border-dashed border-brand-border bg-slate-50/80 px-4 py-10 text-center"
              data-testid="claim-workflow-submitted-empty"
            >
              <CheckCircle2
                className="mx-auto size-8 text-emerald-600"
                aria-hidden="true"
              />
              <p className="mt-3 text-sm font-medium text-brand-navy">
                This claim has been submitted
              </p>
              <p className="mx-auto mt-1 max-w-sm text-sm text-brand-muted">
                It has left the draft queue and was sent to the payer.
              </p>
            </div>
          ) : null}
          {queue.status === "failed" ? (
            <p className="text-sm leading-relaxed text-red-800">
              This claim is no longer eligible for submission from this workflow.
            </p>
          ) : null}
          {showSubmitInQueue && canSubmit ? (
            <PrimaryButton
              type="button"
              size="sm"
              className="px-4"
              disabled={isSubmitting}
              onClick={() => onSubmit?.()}
              data-testid="invoice-submit-claim-button"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Submitting...
                </>
              ) : (
                "Submit claim"
              )}
            </PrimaryButton>
          ) : null}
          {showSubmitInQueue &&
          claim &&
          isDraft &&
          isClaimSubmitBlockedByAdvisories(claim) ? (
            <p className="text-xs text-brand-muted">
              Resolve or override advisory findings to unlock submit.
            </p>
          ) : null}
        </div>
      ),
    },
  ];

  return (
    <>
      <WorkflowCard
        title="Claim workflow"
        description="Complete each stage in order. Expand a stage to see what needs attention."
        stages={stages}
        className={className}
        data-testid="claim-workflow-card"
      />
      {claim && isDraft ? (
        <EditClaimDialog
          claim={claim}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onSuccess={(updated) => {
            onClaimUpdated?.(updated);
          }}
        />
      ) : null}
    </>
  );
}
