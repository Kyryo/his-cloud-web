"use client";

import { CheckCircle2, Loader2, ShieldAlert } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

import { PrimaryButton } from "@/components/ui/app-buttons";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  ClaimAdvisoryFindingsCard,
  ClaimAdvisoryFindingsSection,
} from "@/features/claims/components/ClaimAdvisoryFindingsCard";
import {
  createClaimAdvisoryOverride,
  evaluateClaimAdvisories,
  fetchClaim,
} from "@/features/claims/services/claims.service";
import type { ClaimDetail } from "@/features/claims/types/claims.types";
import { asAdvisorFindings, mergeAdvisorFindings, partitionAdvisorFindings } from "@/features/claims/utils/advisor-findings";
import { isClaimAdvisoryProcessing } from "@/features/claims/utils/claim-advisory-status";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage } from "@/lib/bff-field-errors";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

export { ClaimAdvisoryFindingsCard, ClaimAdvisoryFindingsSection };

export function ClaimAdvisoryBlockingAlert({
  findingCount,
}: {
  findingCount?: number;
}) {
  const countLabel =
    typeof findingCount === "number" && findingCount > 0
      ? `${findingCount} issue${findingCount === 1 ? "" : "s"} below`
      : "issues below";

  return (
    <div
      className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50/80 px-4 py-3"
      data-testid="claim-advisory-blocking-alert"
    >
      <ShieldAlert
        className="mt-0.5 size-4 shrink-0 text-red-600"
        aria-hidden="true"
      />
      <div className="min-w-0 space-y-1">
        <p className="text-sm font-medium text-red-900">
          Submit is blocked until findings are resolved
        </p>
        <p className="text-sm text-red-800/90">
          Open {countLabel}, then <span className="font-medium">Fix</span> or{" "}
          <span className="font-medium">Clear</span>. Use override only if this
          claim should proceed as-is.
        </p>
      </div>
    </div>
  );
}

type ClaimAdvisoriesCardProps = {
  claim: ClaimDetail;
  onClaimUpdated?: (claim: ClaimDetail) => void;
  /**
   * Extra buttons below the findings card (e.g. Submit).
   */
  extraActions?: ReactNode;
  /**
   * Additional findings footer actions alongside Record override.
   */
  findingsActions?: ReactNode;
  /** Content rendered below the findings card (e.g. claim metadata). */
  footer?: ReactNode;
  /**
   * `embedded` drops the outer Advisories chrome for use inside WorkflowCard stages.
   */
  variant?: "standalone" | "embedded";
  className?: string;
};

/**
 * Shared Advisories card used on claim detail and invoice Claim tab.
 * Blocking alert renders outside the white card.
 */
export function ClaimAdvisoriesCard({
  claim,
  onClaimUpdated,
  extraActions,
  findingsActions,
  footer,
  variant = "standalone",
  className,
}: ClaimAdvisoriesCardProps) {
  const { toast } = useToast();
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isOverriding, setIsOverriding] = useState(false);
  const [overrideNote, setOverrideNote] = useState("");
  const [showOverrideForm, setShowOverrideForm] = useState(false);

  const evaluation = claim.latest_advisor_evaluation ?? null;
  const findings = mergeAdvisorFindings(
    evaluation?.deterministic_findings ?? [],
    asAdvisorFindings(evaluation?.ai_findings),
  );
  const { open: openFindings } = partitionAdvisorFindings(
    findings,
    claim.advisory_clearances,
  );
  const isPendingIq = evaluation?.status === "pending_ai";
  const hasBlocking = Boolean(claim.has_blocking_advisories);
  const hasOverride = Boolean(claim.has_advisory_override);
  const isProcessing = isClaimAdvisoryProcessing(claim);
  const isFailed = claim.advisory_status === "failed";
  const canRecordOverride = hasBlocking && !hasOverride;

  useEffect(() => {
    if (!showOverrideForm) {
      return;
    }
    document.getElementById(`override-note-${claim.id}`)?.focus();
  }, [claim.id, showOverrideForm]);

  async function refreshClaim() {
    const refreshed = await fetchClaim(claim.id);
    onClaimUpdated?.(refreshed);
  }

  async function handleEvaluate() {
    setIsEvaluating(true);
    try {
      const queued = await evaluateClaimAdvisories(claim.id);
      onClaimUpdated?.(queued);
      toast({
        variant: "info",
        title: "Advisories are running",
        description:
          "This can take a minute while we check insurer rules and AI review. We'll notify you when results are ready.",
      });
    } catch (error) {
      const isRateLimited =
        error instanceof BffError && error.status === 429;
      toast({
        variant: "error",
        title: isRateLimited
          ? "IQ review is temporarily limited"
          : "Could not start advisories",
        description:
          error instanceof BffError
            ? formatBffErrorMessage(error.message, error.errors) ||
              (isRateLimited
                ? "Please wait a few minutes before re-running advisories."
                : "Something went wrong.")
            : error instanceof Error
              ? error.message
              : "Something went wrong.",
      });
    } finally {
      setIsEvaluating(false);
    }
  }

  async function handleOverride() {
    if (!overrideNote.trim()) {
      toast({
        variant: "error",
        title: "Override note required",
        description: "Explain why submission should proceed despite findings.",
      });
      return;
    }
    setIsOverriding(true);
    try {
      await createClaimAdvisoryOverride(claim.id, overrideNote.trim());
      setOverrideNote("");
      setShowOverrideForm(false);
      await refreshClaim();
      toast({
        variant: "success",
        title: "Advisory override recorded",
        description: "You can submit this claim despite rejection-risk findings.",
      });
    } catch (error) {
      toast({
        variant: "error",
        title: "Could not record override",
        description:
          error instanceof BffError
            ? formatBffErrorMessage(error.message, error.errors)
            : error instanceof Error
              ? error.message
              : "Something went wrong.",
      });
    } finally {
      setIsOverriding(false);
    }
  }

  const showExtraActions = Boolean(extraActions);

  const findingsFooterActions = (
    <>
      {findingsActions}
      {canRecordOverride && !showOverrideForm ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-9 px-3 text-brand-muted hover:text-brand-navy"
          onClick={() => setShowOverrideForm(true)}
          data-testid="claim-record-override-button"
        >
          Record override
        </Button>
      ) : null}
    </>
  );

  const overrideFooterContent =
    canRecordOverride && showOverrideForm ? (
      <div className="space-y-3 rounded-xl border border-brand-border bg-white p-4">
        <label
          className="block text-sm font-medium text-brand-navy"
          htmlFor={`override-note-${claim.id}`}
        >
          Override note
        </label>
        <Textarea
          id={`override-note-${claim.id}`}
          value={overrideNote}
          onChange={(event) => setOverrideNote(event.target.value)}
          placeholder="Explain why this claim should proceed despite findings."
          rows={3}
          data-testid="claim-override-note-input"
        />
        <div className="flex flex-wrap gap-2">
          <PrimaryButton
            type="button"
            size="sm"
            className="px-4"
            disabled={isOverriding}
            onClick={() => void handleOverride()}
            data-testid="claim-save-override-button"
          >
            {isOverriding ? "Saving…" : "Save override"}
          </PrimaryButton>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-9 px-3"
            onClick={() => {
              setShowOverrideForm(false);
              setOverrideNote("");
            }}
          >
            Cancel
          </Button>
        </div>
      </div>
    ) : null;

  const embedded = variant === "embedded";

  return (
    <div
      className={cn(embedded ? "space-y-4" : "space-y-6", className)}
      data-testid="claim-advisories-panel"
    >
      {canRecordOverride ? (
        <ClaimAdvisoryBlockingAlert
          findingCount={
            openFindings.filter((finding) => finding.severity === "rejection_risk")
              .length ||
            openFindings.filter((finding) => finding.source !== "iq").length
          }
        />
      ) : null}

      <div
        className={cn(
          !embedded && "rounded-xl border border-brand-border bg-white p-5 sm:p-6",
        )}
      >
        {!embedded ? (
          <div>
            <h2 className="text-sm font-semibold text-brand-navy">Advisories</h2>
            <p className="mt-1 text-sm leading-relaxed text-brand-muted">
              Pre-submission payer-rule findings and claims intelligence (IQ) for
              this claim.
            </p>
          </div>
        ) : null}

        {hasOverride ? (
          <div
            className={cn(
              "flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50/80 px-3 py-2.5 text-sm text-emerald-900",
              !embedded && "mt-6",
            )}
          >
            <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            An advisory override is on file. Submit is allowed despite
            rejection-risk findings.
          </div>
        ) : null}

        <div className={cn(!embedded || hasOverride ? "mt-6" : undefined)}>
          {isProcessing && !evaluation ? (
            <div
              className="rounded-lg border border-dashed border-brand-border bg-slate-50/80 px-4 py-10 text-center"
              data-testid="claim-advisory-processing"
            >
              <Loader2
                className="mx-auto size-8 animate-spin text-brand-muted"
                aria-hidden="true"
              />
              <p className="mt-3 text-sm font-medium text-brand-navy">
                Advisories processing
              </p>
              <p className="mx-auto mt-1 max-w-sm text-sm text-brand-muted">
                We are checking this claim against the insurer&apos;s rules and
                AI review. This can take a minute. You&apos;ll get a notification
                when it finishes.
              </p>
            </div>
          ) : !evaluation ? (
            <div
              className="rounded-lg border border-dashed border-brand-border bg-slate-50/80 px-4 py-10 text-center"
              data-testid="claim-advisory-empty"
            >
              <ShieldAlert
                className="mx-auto size-8 text-brand-muted"
                aria-hidden="true"
              />
              <p className="mt-3 text-sm font-medium text-brand-navy">
                {isFailed ? "Needs attention" : "No advisory evaluation yet"}
              </p>
              <p className="mx-auto mt-1 max-w-sm text-sm text-brand-muted">
                {isFailed
                  ? "Advisories could not finish. Re-evaluate this claim to continue."
                  : "Run an evaluation to check this claim against the insurer's validation packs."}
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                {findingsActions}
                <PrimaryButton
                  type="button"
                  size="sm"
                  className="h-9 px-4"
                  disabled={isEvaluating}
                  onClick={() => void handleEvaluate()}
                  data-testid="claim-evaluate-advisories-button"
                >
                  {isEvaluating ? (
                    <>
                      <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                      Evaluating…
                    </>
                  ) : (
                    "Evaluate"
                  )}
                </PrimaryButton>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {isProcessing ? (
                <div
                  className="flex items-start gap-2 rounded-lg border border-brand-border bg-slate-50/80 px-3 py-2.5 text-sm text-brand-navy"
                  data-testid="claim-advisory-running"
                >
                  <Loader2
                    className="mt-0.5 size-4 shrink-0 animate-spin text-brand-muted"
                    aria-hidden="true"
                  />
                  <p>
                    Advisories are running in the background. This can take a
                    minute. We&apos;ll notify you when results are ready.
                  </p>
                </div>
              ) : (
                <ClaimAdvisoryFindingsCard
                  findings={findings}
                  claim={claim}
                  onClaimUpdated={onClaimUpdated}
                  onReEvaluate={
                    showOverrideForm ? undefined : () => void handleEvaluate()
                  }
                  isReEvaluating={isEvaluating}
                  emptyTitle={
                    isPendingIq
                      ? "IQ review is in progress"
                      : "We did not find any advisory issues on this claim"
                  }
                  emptyDescription={
                    isPendingIq
                      ? "Payer-rule checks finished. Claims intelligence notes will appear in this list."
                      : "Validation packs returned no rejection risks or warnings for the current claim data."
                  }
                  notice={
                    isPendingIq ? (
                      <div
                        className="flex items-center justify-center gap-2 text-sm text-brand-navy"
                        data-testid="claim-iq-review-pending"
                      >
                        <Loader2
                          className="size-4 shrink-0 animate-spin text-brand-muted"
                          aria-hidden="true"
                        />
                        IQ review is in progress.
                      </div>
                    ) : null
                  }
                  footerActions={findingsFooterActions}
                  footerContent={overrideFooterContent}
                />
              )}
            </div>
          )}
        </div>

        {showExtraActions ? (
          <div className="mt-5 flex flex-wrap items-center gap-2">
            {extraActions}
          </div>
        ) : null}

        {footer ? <div className="mt-6">{footer}</div> : null}
      </div>
    </div>
  );
}

/** @deprecated Prefer ClaimAdvisoriesCard */
export const ClaimAdvisoriesPanel = ClaimAdvisoriesCard;

export function isClaimSubmitBlockedByAdvisories(claim: ClaimDetail): boolean {
  return Boolean(claim.has_blocking_advisories) && !claim.has_advisory_override;
}
