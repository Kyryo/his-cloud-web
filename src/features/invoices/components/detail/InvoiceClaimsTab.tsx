"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { PrimaryButton } from "@/components/ui/app-buttons";
import { EmptyState } from "@/components/ui/empty-state";
import { ROUTES } from "@/constants/routes";
import {
  isClaimSubmitBlockedByAdvisories,
} from "@/features/claims/components/ClaimAdvisoriesPanel";
import { ClaimWorkflowCard } from "@/features/claims/components/ClaimWorkflowCard";
import { SubmitClaimDialog } from "@/features/claims/components/SubmitClaimDialog";
import {
  createClaimFromInvoice,
  fetchClaimByInvoice,
  isInsuranceInvoice,
} from "@/features/claims/services/claims.service";
import type { ClaimDetail } from "@/features/claims/types/claims.types";
import { useClaimAdvisoryPoll } from "@/features/claims/hooks/use-claim-advisory-poll";
import { AddEncounterDiagnosisDialog } from "@/features/clinical/components/AddEncounterDiagnosisDialog";
import { useInvoiceEncounterUuid } from "@/features/invoices/hooks/use-invoice-encounter-uuid";
import type { Invoice } from "@/features/invoices/types/invoice.types";
import {
  getInvoiceClaimableLines,
  invoiceHasNonPayableLines,
} from "@/features/invoices/utils/invoice-line-payability";
import {
  getClaimRequirementCheckItems,
  getInvoiceClaimReadinessItems,
  getInvoiceClaimSystemReadinessItems,
  getCreateClaimDisabledReasonFromItems,
} from "@/features/invoices/utils/invoice-claim-readiness";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage } from "@/lib/bff-field-errors";
import { useToast } from "@/providers/toast-provider";

export type InvoiceClaimCreateAction = {
  isCreating: boolean;
  disabled: boolean;
  disabledReason?: string;
  create: () => void;
};

type InvoiceClaimsTabProps = {
  invoice: Invoice;
  isActive: boolean;
  onInvoiceRefresh?: () => void | Promise<void>;
  onClaimIndicatorChange?: (hasIssues: boolean) => void;
  /** "requirements" shows only the Requirements checks. */
  layout?: "workflow" | "requirements";
  onCreateClaimActionChange?: (action: InvoiceClaimCreateAction | null) => void;
  onClaimChange?: (claim: ClaimDetail | null) => void;
};

export function InvoiceClaimsTab({
  invoice,
  isActive,
  onInvoiceRefresh,
  onClaimIndicatorChange,
  layout = "workflow",
  onCreateClaimActionChange,
  onClaimChange,
}: InvoiceClaimsTabProps) {
  const { toast } = useToast();
  const [claim, setClaim] = useState<ClaimDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [addDiagnosisOpen, setAddDiagnosisOpen] = useState(false);
  const encounterUuid = useInvoiceEncounterUuid(invoice, isActive);
  const visitUuid = invoice.visit_uuid?.trim() || null;
  const canAddDiagnosis = Boolean(visitUuid);

  useClaimAdvisoryPoll(claim, {
    enabled: isActive,
    notifyWhenReady: true,
    onUpdate: setClaim,
  });

  const isInsurance = isInsuranceInvoice(invoice);
  const displayedClaim = isInsurance ? claim : null;

  useEffect(() => {
    if (!isInsuranceInvoice(invoice)) {
      return;
    }

    let cancelled = false;

    async function run() {
      if (!cancelled) {
        setIsLoading(true);
      }

      try {
        const existingClaim = await fetchClaimByInvoice(invoice.id);
        if (!cancelled) {
          setClaim(existingClaim);
        }
      } catch (error) {
        if (!(error instanceof BffError) || error.status !== 404) {
          if (!cancelled) {
            toast({
              variant: "error",
              title: "Could not load claim",
              description:
                error instanceof Error ? error.message : "Something went wrong.",
            });
          }
        }
        if (!cancelled) {
          setClaim(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, [invoice.id, invoice.claim_status]);

  useEffect(() => {
    if (!isActive) {
      return;
    }
    onClaimChange?.(displayedClaim);
  }, [displayedClaim, isActive, onClaimChange]);

  useEffect(() => {
    if (!onClaimIndicatorChange) {
      return;
    }

    if (displayedClaim) {
      onClaimIndicatorChange(isClaimSubmitBlockedByAdvisories(displayedClaim));
      return;
    }

    onClaimIndicatorChange(
      getInvoiceClaimReadinessItems(invoice, null).some((item) => !item.met),
    );
  }, [displayedClaim, invoice, onClaimIndicatorChange]);

  async function handleClaimUpdated(updated: ClaimDetail) {
    setClaim(updated);
    await onInvoiceRefresh?.();
  }

  async function handleCreateClaim() {
    setIsCreating(true);
    try {
      const created = await createClaimFromInvoice(invoice.id, {
        payer_code: invoice.claim_payer_code?.trim() || "MASM",
      });
      setClaim(created);
      if (layout !== "requirements") {
        toast({
          variant: "success",
          title: "Claim created",
          description: "Advisories are processing.",
        });
      }
      await onInvoiceRefresh?.();
    } catch (error) {
      toast({
        variant: "error",
        title: "Could not create claim",
        description:
          error instanceof BffError
            ? formatBffErrorMessage(error.message, error.errors)
            : error instanceof Error
              ? error.message
              : "Something went wrong.",
      });
    } finally {
      setIsCreating(false);
    }
  }

  const handleCreateClaimRef = useRef(handleCreateClaim);

  useEffect(() => {
    handleCreateClaimRef.current = handleCreateClaim;
  });

  useEffect(() => {
    if (!onCreateClaimActionChange) {
      return;
    }

    if (
      layout !== "requirements" ||
      !isActive ||
      !isInsuranceInvoice(invoice) ||
      displayedClaim
    ) {
      onCreateClaimActionChange(null);
      return;
    }

    const readinessItems = getInvoiceClaimSystemReadinessItems(invoice, displayedClaim);
    const requirementItems = getClaimRequirementCheckItems(invoice, displayedClaim);
    const disabledReason = getCreateClaimDisabledReasonFromItems(
      readinessItems,
      requirementItems,
      displayedClaim,
    );

    onCreateClaimActionChange({
      isCreating,
      disabled: isCreating || isLoading || Boolean(disabledReason),
      disabledReason: disabledReason,
      create: () => {
        void handleCreateClaimRef.current();
      },
    });
  }, [
    displayedClaim,
    invoice,
    isActive,
    isCreating,
    isLoading,
    layout,
    onCreateClaimActionChange,
  ]);

  async function handleRequestSubmit() {
    if (!displayedClaim || isClaimSubmitBlockedByAdvisories(displayedClaim)) {
      return;
    }
    setSubmitOpen(true);
  }

  if (!isActive) {
    return null;
  }

  if (!isInsurance) {
    if (layout === "requirements") {
      return (
        <p className="text-sm text-brand-muted">
          Claims are only available for insurance invoices linked to a visit.
        </p>
      );
    }

    return (
      <p className="text-sm text-brand-muted">
        Claims are only available for insurance invoices linked to a visit.
      </p>
    );
  }

  const readinessItems = getInvoiceClaimSystemReadinessItems(invoice, displayedClaim);
  const requirementItems = getClaimRequirementCheckItems(invoice, displayedClaim);
  const claimableLineCount = getInvoiceClaimableLines(invoice.lines).length;
  const hasExcludedLines = invoiceHasNonPayableLines(invoice.lines);

  const nonPayableNotice = hasExcludedLines ? (
    <p
      className="flex flex-wrap items-center gap-2 text-sm text-brand-muted"
      data-testid="invoice-claim-non-payable-notice"
    >
      <Badge variant="warning" className="font-normal">
        {claimableLineCount} payable
      </Badge>
      Non-payable items are excluded because they are paid by the customer.
    </p>
  ) : null;

  const claimStatus = String(displayedClaim?.status || invoice.claim_status || "").toLowerCase();
  const payerCode = displayedClaim?.payer_code?.trim() || invoice.claim_payer_code?.trim();

  return (
    <div className="space-y-5" data-testid="invoice-claims-tab">
      {layout === "workflow" ? (
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge
            variant={
              claimStatus === "approved" || claimStatus === "submitted"
                ? "success"
                : claimStatus === "rejected" || claimStatus === "cancelled"
                  ? "destructive"
                  : claimStatus
                    ? "warning"
                    : "secondary"
            }
            className="font-normal capitalize"
          >
            {claimStatus ? claimStatus.replace(/_/g, " ") : "Not started"}
          </Badge>
          {payerCode ? (
            <Badge variant="outline" className="font-normal">
              {payerCode.toUpperCase()}
            </Badge>
          ) : null}
          <Badge variant="secondary" className="font-normal">
            {claimableLineCount} payable
          </Badge>
          {hasExcludedLines ? (
            <Badge variant="warning" className="font-normal">
              Some excluded
            </Badge>
          ) : null}
        </div>
      ) : null}

      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-brand-muted">
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          Loading claim...
        </div>
      ) : layout === "requirements" && displayedClaim ? (
        <EmptyState
          variant="success"
          title="Claim created"
          description="A draft claim was created. Advisories are processing in the background, and you'll be notified when they finish."
          data-testid="claim-created-success-state"
          action={
            <PrimaryButton asChild>
              <a href={ROUTES.claimDetail(displayedClaim.uuid)}>View claim</a>
            </PrimaryButton>
          }
        />
      ) : (
        <ClaimWorkflowCard
          claim={displayedClaim}
          readinessItems={readinessItems}
          requirementItems={requirementItems}
          onClaimUpdated={(updated) => void handleClaimUpdated(updated)}
          notice={nonPayableNotice}
          onCreateClaim={() => void handleCreateClaim()}
          isCreating={isCreating}
          onSubmit={
            layout === "workflow" ? () => void handleRequestSubmit() : undefined
          }
          showSubmitInQueue={layout === "workflow"}
          layout={layout}
          surface={layout === "workflow" ? "plain" : "card"}
          onAddDiagnosis={
            canAddDiagnosis ? () => setAddDiagnosisOpen(true) : undefined
          }
        />
      )}

      {layout === "workflow" && displayedClaim ? (
        <SubmitClaimDialog
          claim={displayedClaim}
          open={submitOpen}
          onOpenChange={setSubmitOpen}
          onSuccess={(submitted) => void handleClaimUpdated(submitted)}
          onClaimUpdated={(updated) => void handleClaimUpdated(updated)}
        />
      ) : null}

      {canAddDiagnosis && visitUuid ? (
        <AddEncounterDiagnosisDialog
          visitUuid={visitUuid}
          encounterUuid={encounterUuid}
          sourcePlatform="INVOICE"
          open={addDiagnosisOpen}
          onOpenChange={setAddDiagnosisOpen}
          onSuccess={async () => {
            await onInvoiceRefresh?.();
          }}
        />
      ) : null}
    </div>
  );
}
