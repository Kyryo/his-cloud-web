"use client";

import { CheckCircle2, Loader2 } from "lucide-react";
import { useState, type ReactNode } from "react";

import { PrimaryButton } from "@/components/ui/app-buttons";
import { StatusBanner } from "@/components/ui/status-banner";
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
import {
  getClaimWorkflowStageStates,
  shouldShowRequirementsStage,
} from "@/features/claims/utils/claim-workflow-stages";
import { isClaimReadyToSubmit } from "@/features/claims/utils/claim-advisory-status";
import {
  getCreateClaimChecklistItems,
  getCreateClaimDisabledReasonFromItems,
  type InvoiceClaimReadinessItem,
} from "@/features/invoices/utils/invoice-claim-readiness";
import { cn } from "@/lib/utils";

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
  /**
   * "workflow" shows the full staged card.
   * "requirements" shows only the Requirements checks.
   */
  layout?: "workflow" | "requirements";
  /** "plain" drops the outer card chrome for invoice detail. */
  surface?: "card" | "plain";
};

/**
 * Claim lifecycle workflow: Requirements → Advisory → Queue → Payer response.
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
  layout = "workflow",
  surface = "card",
}: ClaimWorkflowCardProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const checklistItems = getCreateClaimChecklistItems(
    readinessItems,
    requirementItems,
    claim,
  );
  const stageStates = getClaimWorkflowStageStates(
    requirementItems,
    claim,
    readinessItems,
  );
  const requirements = stageStates.find((stage) => stage.id === "requirements")!;
  const advisory = stageStates.find((stage) => stage.id === "advisory")!;
  const queue = stageStates.find((stage) => stage.id === "queue")!;
  const payer = stageStates.find((stage) => stage.id === "payer")!;
  const payerName = claim?.payer_code?.trim() || "the insurer";
  const payerStatusLower = String(claim?.payer_status || "").toLowerCase();
  const isRemittanceSettled = payerStatusLower === "settled_via_remittance";
  const isRemittanceDenied = payerStatusLower === "denied_via_remittance";
  const isManualSubmission = payerStatusLower === "manual_submission";

  const showRequirements = shouldShowRequirementsStage(requirements, claim);
  const isDraft = String(claim?.status ?? "").toLowerCase() === "draft";
  const canSubmit =
    Boolean(claim) && isDraft && isClaimReadyToSubmit(claim) && Boolean(onSubmit);
  const createClaimDisabledReason = getCreateClaimDisabledReasonFromItems(
    readinessItems,
    requirementItems,
    claim,
  );

  const createClaimButton =
    !claim && onCreateClaim && layout !== "requirements" ? (
      <PrimaryButton
        type="button"
        size="sm"
        className="h-9 px-4"
        disabled={isCreating || Boolean(createClaimDisabledReason)}
        title={createClaimDisabledReason}
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

  const editDraftButton =
    claim && isDraft ? (
      <ClaimRequirementsEditButton onClick={() => setEditDialogOpen(true)} />
    ) : null;

  const requirementsFooter = showRequirements
    ? editDraftButton || createClaimButton
    : null;

  const requirementsContent = (
    <div className="space-y-4">
      {notice}
      <ClaimRequirementsCard
        items={checklistItems}
        footerActions={requirementsFooter}
        onAddDiagnosis={onAddDiagnosis}
        variant={surface === "plain" ? "plain" : "card"}
      />
    </div>
  );

  if (layout === "requirements") {
    return (
      <>
        <div data-testid="claim-requirements-stage">{requirementsContent}</div>
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

  const stages: WorkflowStageConfig[] = [
    ...(showRequirements
      ? [
          {
            id: "requirements",
            title: "Requirements",
            summary: requirements.summary,
            status: requirements.status,
            defaultOpen: claim && isDraft ? true : undefined,
            content: requirementsContent,
          } satisfies WorkflowStageConfig,
        ]
      : []),
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
      disabled: !claim || queue.status === "pending",
      content: (
        <div className="space-y-4">
          {queue.status === "current" && canSubmit ? (
            <StatusBanner
              variant="info"
              showIcon={false}
              message="Advisories are clear. Submit this claim to send it to the payer. Member verification happens at submit."
            />
          ) : null}
          {queue.status === "pending" ? (
            <StatusBanner
              variant="info"
              showIcon={false}
              message="Finish Requirements and clear Advisory blockers before this claim can be queued."
            />
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
                It has left the draft queue and was sent to {payerName}.
              </p>
            </div>
          ) : null}
          {queue.status === "failed" ? (
            <StatusBanner
              variant="warning"
              showIcon={false}
              message="This claim is no longer eligible for submission from this workflow."
            />
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
                "Submit"
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
    {
      id: "payer",
      title: `${payerName} response`,
      summary: payer.summary,
      status: payer.status,
      disabled: !claim || isDraft,
      content: (
        <div className="space-y-3" data-testid="claim-workflow-payer-stage">
          {payer.status === "pending" ? (
            <StatusBanner
              variant="info"
              showIcon={false}
              message={`Submit the claim to begin tracking the response from ${payerName}.`}
            />
          ) : null}
          {payer.status === "current" ? (
            <StatusBanner
              variant="info"
              showIcon={false}
              message={`We're waiting for ${payerName} to confirm the claim outcome. Use Check payer status if the update is taking longer than expected.`}
            />
          ) : null}
          {payer.status === "completed" ? (
            <div className="rounded-lg border border-dashed border-brand-border bg-slate-50/80 px-4 py-10 text-center">
              <CheckCircle2
                className="mx-auto size-8 text-emerald-600"
                aria-hidden="true"
              />
              <p className="mt-3 text-sm font-medium text-brand-navy">
                {isRemittanceSettled
                  ? `${payerName} remittance confirmed payment`
                  : isManualSubmission
                    ? "Submission was done manually"
                    : `${payerName} has closed this claim`}
              </p>
              <p className="mx-auto mt-1 max-w-sm text-sm text-brand-muted">
                {isRemittanceSettled
                  ? "This claim line was settled from an uploaded remittance file."
                  : isManualSubmission
                    ? `This claim was submitted outside HMIS. Track the ${payerName} outcome manually or upload a remittance when available.`
                    : "Portal confirmation was received successfully."}
              </p>
            </div>
          ) : null}
          {payer.status === "failed" ? (
            <StatusBanner
              variant="warning"
              showIcon={false}
              message={
                isRemittanceDenied
                  ? `${payerName} remittance denied payment for this claim. Review the remittance lines and claimed items for details.`
                  : `Automatic closing with ${payerName} did not complete. Review the claim in ${payerName} and finish the close manually.`
              }
              data-testid="claim-workflow-payer-failed-alert"
            />
          ) : null}
        </div>
      ),
    },
  ];

  return (
    <>
      {notice && !showRequirements ? notice : null}
      <WorkflowCard
        title={surface === "plain" ? undefined : "Claim workflow"}
        description={
          surface === "plain"
            ? undefined
            : "Complete each stage in order. Expand a stage to see what needs attention."
        }
        stages={stages}
        headerActions={
          showRequirements ? null : editDraftButton || createClaimButton
        }
        className={cn(
          surface === "plain" && "rounded-none border-0 bg-transparent",
          className,
        )}
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
