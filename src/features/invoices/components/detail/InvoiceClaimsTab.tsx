"use client";

import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { PrimaryButton, SecondaryButton } from "@/components/ui/app-buttons";
import { EditClaimDialog } from "@/features/claims/components/EditClaimDialog";
import { PostClaimDialog } from "@/features/claims/components/PostClaimDialog";
import {
  fetchClaimByInvoice,
  isInsuranceInvoice,
  submitClaim,
} from "@/features/claims/services/claims.service";
import type { ClaimDetail } from "@/features/claims/types/claims.types";
import type { Invoice } from "@/features/invoices/types/invoice.types";
import {
  getInvoiceClaimReadinessItems,
  type InvoiceClaimReadinessItem,
} from "@/features/invoices/utils/invoice-claim-readiness";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage } from "@/lib/bff-field-errors";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

type InvoiceClaimsTabProps = {
  invoice: Invoice;
  isActive: boolean;
  onInvoiceRefresh?: () => void | Promise<void>;
};

function ReadinessList({ items }: { items: InvoiceClaimReadinessItem[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item.label} className="flex items-start gap-2 text-sm">
          {item.met ? (
            <CheckCircle2
              className="mt-0.5 size-4 shrink-0 text-emerald-600"
              aria-hidden="true"
            />
          ) : (
            <AlertCircle
              className="mt-0.5 size-4 shrink-0 text-amber-600"
              aria-hidden="true"
            />
          )}
          <div>
            <p className={cn("text-brand-navy", !item.met && "text-brand-muted")}>
              {item.label}
            </p>
            {item.hint ? (
              <p className="text-xs text-brand-muted">{item.hint}</p>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}

function ReadinessSection({ items }: { items: InvoiceClaimReadinessItem[] }) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const allMet = items.every((item) => item.met);
  const metCount = items.filter((item) => item.met).length;

  if (allMet) {
    return (
      <div className="rounded-lg border border-emerald-200 bg-emerald-50/80">
        <div className="flex items-center justify-between gap-3 px-3 py-2.5">
          <div className="flex items-center gap-2">
            <CheckCircle2
              className="size-4 shrink-0 text-emerald-600"
              aria-hidden="true"
            />
            <span className="text-sm font-medium text-emerald-800">
              All {items.length} checks passed
            </span>
          </div>
          <button
            type="button"
            onClick={() => setDetailsOpen((open) => !open)}
            className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 hover:text-emerald-900"
            aria-expanded={detailsOpen}
          >
            Details
            <ChevronDown
              className={cn(
                "size-3.5 transition-transform",
                detailsOpen && "rotate-180",
              )}
              aria-hidden="true"
            />
          </button>
        </div>
        {detailsOpen ? (
          <div className="border-t border-emerald-200/80 px-3 py-2.5">
            <ReadinessList items={items} />
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-xs font-medium uppercase tracking-wide text-brand-muted">
        Readiness ({metCount}/{items.length})
      </h3>
      <div className="mt-3">
        <ReadinessList items={items} />
      </div>
    </div>
  );
}

export function InvoiceClaimsTab({
  invoice,
  isActive,
  onInvoiceRefresh,
}: InvoiceClaimsTabProps) {
  const { toast } = useToast();
  const [claim, setClaim] = useState<ClaimDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [postDialogOpen, setPostDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const loadClaim = useCallback(async () => {
    setIsLoading(true);
    try {
      const existingClaim = await fetchClaimByInvoice(invoice.id);
      setClaim(existingClaim);
    } catch (error) {
      if (!(error instanceof BffError) || error.status !== 404) {
        toast({
          variant: "error",
          title: "Could not load claim",
          description:
            error instanceof Error ? error.message : "Something went wrong.",
        });
      }
      setClaim(null);
    } finally {
      setIsLoading(false);
    }
  }, [invoice.id, toast]);

  useEffect(() => {
    if (!isActive) {
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
  }, [isActive, invoice.id, toast]);

  async function handleRefresh() {
    await Promise.all([loadClaim(), onInvoiceRefresh?.()]);
  }

  async function handleSubmitClaim() {
    if (!claim) {
      return;
    }

    setIsSubmitting(true);
    try {
      const submitted = await submitClaim(claim.id);
      setClaim(submitted);
      toast({
        variant: "success",
        title: "Claim submitted",
        description: "The claim was sent to MASM successfully.",
      });
      await onInvoiceRefresh?.();
    } catch (error) {
      toast({
        variant: "error",
        title: "Could not submit claim",
        description:
          error instanceof BffError
            ? formatBffErrorMessage(error.message, error.errors)
            : error instanceof Error
              ? error.message
              : "Something went wrong.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isActive) {
    return null;
  }

  if (!isInsuranceInvoice(invoice)) {
    return (
      <div className="rounded-xl border border-brand-border bg-white p-6">
        <p className="text-sm text-brand-muted">
          Claims are only available for insurance invoices linked to a visit.
        </p>
      </div>
    );
  }

  const claimStatus = claim?.status ?? invoice.claim_status ?? null;
  const isDraft = String(claimStatus ?? "").toLowerCase() === "draft";
  const readinessItems = getInvoiceClaimReadinessItems(invoice, claim);

  return (
    <div className="space-y-6" data-testid="invoice-claims-tab">
      <div className="rounded-xl border border-brand-border bg-white p-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-brand-navy">Insurance claim</h2>
          </div>
          <p className="mt-1 text-sm text-brand-muted">
            Verify the member, create a draft claim, then submit to MASM.
          </p>
        </div>

        {isLoading ? (
          <div className="mt-6 flex items-center gap-2 text-sm text-brand-muted">
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Loading claim...
          </div>
        ) : (
          <>
            <div className="mt-6">
              <ReadinessSection items={readinessItems} />
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {!claim ? (
                <PrimaryButton type="button" onClick={() => setPostDialogOpen(true)}>
                  Create claim
                </PrimaryButton>
              ) : null}

              {claim && isDraft ? (
                <>
                  <PrimaryButton
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => void handleSubmitClaim()}
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
                  <SecondaryButton type="button" onClick={() => setEditDialogOpen(true)}>
                    Edit draft
                  </SecondaryButton>
                </>
              ) : null}
            </div>

            {claim ? (
              <dl className="mt-6 grid gap-3 border-t border-brand-border pt-6 sm:grid-cols-2">
                <div>
                  <dt className="text-xs text-brand-muted">Membership number</dt>
                  <dd className="text-sm text-brand-navy">{claim.membership_number}</dd>
                </div>
                <div>
                  <dt className="text-xs text-brand-muted">Practitioner number</dt>
                  <dd className="text-sm text-brand-navy">
                    {claim.practitioner_number || "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-brand-muted">Service provider code</dt>
                  <dd className="text-sm text-brand-navy">
                    {claim.service_provider_code || "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-brand-muted">Claim reference</dt>
                  <dd className="text-sm text-brand-navy">
                    {claim.claim_reference_number || claim.external_claim_id || "—"}
                  </dd>
                </div>
              </dl>
            ) : null}
          </>
        )}
      </div>

      <PostClaimDialog
        invoice={invoice}
        open={postDialogOpen}
        onOpenChange={setPostDialogOpen}
        onSuccess={handleRefresh}
      />

      {claim ? (
        <EditClaimDialog
          claim={claim}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onSuccess={handleRefresh}
        />
      ) : null}
    </div>
  );
}
