"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

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
import { cn } from "@/lib/utils";
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

  useEffect(() => {
    if (!isInsuranceInvoice(invoice)) {
      setClaim(null);
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
    onClaimChange?.(claim);
  }, [claim, isActive, onClaimChange]);

  useEffect(() => {
    if (!onClaimIndicatorChange) {
      return;
    }

    if (claim) {
      onClaimIndicatorChange(isClaimSubmitBlockedByAdvisories(claim));
      return;
    }

    onClaimIndicatorChange(
      getInvoiceClaimReadinessItems(invoice, null).some((item) => !item.met),
    );
  }, [claim, invoice, onClaimIndicatorChange]);

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
  handleCreateClaimRef.current = handleCreateClaim;

  useEffect(() => {
    if (!onCreateClaimActionChange) {
      return;
    }

    if (
      layout !== "requirements" ||
      !isActive ||
      !isInsuranceInvoice(invoice) ||
      claim
    ) {
      onCreateClaimActionChange(null);
      return;
    }

    const readinessItems = getInvoiceClaimSystemReadinessItems(invoice, claim);
    const requirementItems = getClaimRequirementCheckItems(invoice, claim);
    const disabledReason = getCreateClaimDisabledReasonFromItems(
      readinessItems,
      requirementItems,
      claim,
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
    claim,
    invoice,
    isActive,
    isCreating,
    isLoading,
    layout,
    onCreateClaimActionChange,
  ]);

  async function handleRequestSubmit() {
    if (!claim || isClaimSubmitBlockedByAdvisories(claim)) {
      return;
    }
    setSubmitOpen(true);
  }

  if (!isActive) {
    return null;
  }

  if (!isInsuranceInvoice(invoice)) {
    if (layout === "requirements") {
      return (
        <p className="text-sm text-brand-muted">
          Claims are only available for insurance invoices linked to a visit.
        </p>
      );
    }

    return (
      <div className="rounded-xl border border-brand-border bg-white p-6">
        <p className="text-sm text-brand-muted">
          Claims are only available for insurance invoices linked to a visit.
        </p>
      </div>
    );
  }

  const readinessItems = getInvoiceClaimSystemReadinessItems(invoice, claim);
  const requirementItems = getClaimRequirementCheckItems(invoice, claim);
  const claimableLineCount = getInvoiceClaimableLines(invoice.lines).length;
  const hasExcludedLines = invoiceHasNonPayableLines(invoice.lines);

  const nonPayableNotice = hasExcludedLines ? (
    <p
      className="rounded-lg border border-amber-200 bg-amber-50/80 px-3 py-2 text-sm text-amber-900"
      data-testid="invoice-claim-non-payable-notice"
    >
      {claimableLineCount} payable item{claimableLineCount === 1 ? "" : "s"}{" "}
      will be included in the claim. Non-payable items on this invoice are
      excluded because they are paid by the customer.
    </p>
  ) : null;

  return (
    <div className="space-y-4" data-testid="invoice-claims-tab">
      {isLoading ? (
        <div
          className={cn(
            "flex items-center gap-2 text-sm text-brand-muted",
            layout === "workflow" &&
              "rounded-xl border border-brand-border bg-white p-6",
          )}
        >
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          Loading claim...
        </div>
      ) : layout === "requirements" && claim ? (
        <EmptyState
          variant="success"
          title="Claim created"
          description="A draft claim was created. Advisories are processing in the background, and you'll be notified when they finish."
          data-testid="claim-created-success-state"
          action={
            <PrimaryButton asChild>
              <a href={ROUTES.claimDetail(claim.uuid)}>View claim</a>
            </PrimaryButton>
          }
        />
      ) : (
        <ClaimWorkflowCard
          claim={claim}
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
          onAddDiagnosis={
            canAddDiagnosis ? () => setAddDiagnosisOpen(true) : undefined
          }
        />
      )}

      {layout === "workflow" && claim ? (
        <SubmitClaimDialog
          claim={claim}
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
