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
          Open {countLabel}, click <span className="font-medium">Fix</span>, then{" "}
          <span className="font-medium">Re-evaluate</span>. Use override only if
          this claim should proceed as-is.
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
  const findings = evaluation?.deterministic_findings ?? [];
  const hasBlocking = Boolean(claim.has_blocking_advisories);
  const hasOverride = Boolean(claim.has_advisory_override);
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
      await evaluateClaimAdvisories(claim.id);
      await refreshClaim();
      toast({
        variant: "success",
        title: "Advisories evaluated",
        description: "Claim validation packs were re-run.",
      });
    } catch (error) {
      toast({
        variant: "error",
        title: "Could not evaluate advisories",
        description:
          error instanceof BffError
            ? formatBffErrorMessage(error.message, error.errors)
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
            findings.filter((finding) => finding.severity === "rejection_risk")
              .length || findings.length
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
              Pre-submission validation findings for this claim&apos;s payer and
              scheme.
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
          {!evaluation ? (
            <div className="rounded-lg border border-brand-border bg-slate-50/80 px-4 py-6 text-center">
              <p className="text-sm text-brand-muted">
                No evaluation yet. Run an evaluation to check this claim against
                validation packs.
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
            <ClaimAdvisoryFindingsCard
              findings={findings}
              onReEvaluate={
                showOverrideForm ? undefined : () => void handleEvaluate()
              }
              isReEvaluating={isEvaluating}
              footerActions={findingsFooterActions}
              footerContent={overrideFooterContent}
            />
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
