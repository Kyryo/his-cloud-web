"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import { PrimaryButton, SecondaryButton } from "@/components/ui/app-buttons";
import { SectionedDialog } from "@/components/ui/sectioned-dialog";
import { StatusBanner } from "@/components/ui/status-banner";
import {
  InvoiceClaimsTab,
  type InvoiceClaimCreateAction,
} from "@/features/invoices/components/detail/InvoiceClaimsTab";
import { fetchInvoice } from "@/features/invoices/services/invoices.service";
import type { Invoice } from "@/features/invoices/types/invoice.types";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage } from "@/lib/bff-field-errors";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";

type PrepareClaimFromInvoiceDialogProps = {
  open: boolean;
  invoiceId: number;
  initialInvoice?: Invoice | null;
  onOpenChange: (open: boolean) => void;
};

export function PrepareClaimFromInvoiceDialog({
  open,
  invoiceId,
  initialInvoice = null,
  onOpenChange,
}: PrepareClaimFromInvoiceDialogProps) {
  const [invoice, setInvoice] = useState<Invoice | null>(initialInvoice);
  const [isLoading, setIsLoading] = useState(!initialInvoice);
  const [error, setError] = useState<string | null>(null);
  const [createClaimAction, setCreateClaimAction] =
    useState<InvoiceClaimCreateAction | null>(null);
  const [claimCreated, setClaimCreated] = useState(false);

  useEffect(() => {
    if (!open) {
      setCreateClaimAction(null);
      setClaimCreated(false);
      return;
    }

    let cancelled = false;

    async function load() {
      if (!initialInvoice) {
        setIsLoading(true);
      }
      setError(null);

      try {
        const nextInvoice = await fetchInvoice(invoiceId);
        if (!cancelled) {
          setInvoice(nextInvoice);
        }
      } catch (loadError) {
        if (cancelled) {
          return;
        }
        if (initialInvoice) {
          setInvoice(initialInvoice);
          return;
        }
        setError(
          loadError instanceof BffError
            ? formatBffErrorMessage(loadError.message, loadError.errors)
            : loadError instanceof Error
              ? loadError.message
              : "The invoice could not be loaded for claim preparation.",
        );
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [open, invoiceId, initialInvoice]);

  async function handleInvoiceRefresh() {
    const nextInvoice = await fetchInvoice(invoiceId);
    setInvoice(nextInvoice);
  }

  return (
    <SectionedDialog
      open={open}
      onOpenChange={onOpenChange}
      title={claimCreated ? "Claim created" : "Prepare claim"}
      description={
        claimCreated
          ? undefined
          : "Complete the Requirements checks, then create a draft claim. The claim is not submitted from this dialog."
      }
      className={cn("sm:max-w-lg", appFont.className)}
      data-testid="sales-order-prepare-claim-dialog"
      footer={
        <>
          <SecondaryButton type="button" onClick={() => onOpenChange(false)}>
            Close
          </SecondaryButton>
          {!claimCreated && createClaimAction ? (
            <PrimaryButton
              type="button"
              disabled={createClaimAction.disabled}
              title={createClaimAction.disabledReason}
              onClick={createClaimAction.create}
              data-testid="invoice-create-claim-button"
            >
              {createClaimAction.isCreating ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Creating claim...
                </>
              ) : (
                "Create claim"
              )}
            </PrimaryButton>
          ) : null}
        </>
      }
    >
      {isLoading && !invoice ? (
        <div className="flex items-center gap-2 text-sm text-brand-muted">
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          Loading requirements...
        </div>
      ) : null}

      {error ? (
        <StatusBanner variant="error" message={error} />
      ) : null}

      {invoice ? (
        <InvoiceClaimsTab
          invoice={invoice}
          isActive={open}
          layout="requirements"
          onCreateClaimActionChange={setCreateClaimAction}
          onClaimChange={(nextClaim) => setClaimCreated(Boolean(nextClaim))}
          onInvoiceRefresh={() => void handleInvoiceRefresh()}
        />
      ) : null}
    </SectionedDialog>
  );
}
