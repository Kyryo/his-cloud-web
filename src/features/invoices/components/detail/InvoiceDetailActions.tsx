"use client";

import { FileDown, Loader2, MoreVertical, StickyNote, Wallet, XCircle } from "lucide-react";
import { useState } from "react";

import { DestructiveButton, PrimaryButton, SecondaryButton } from "@/components/ui/app-buttons";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { isInsuranceInvoice } from "@/features/claims/services/claims.service";
import { IncludeAttachmentPrintDialog } from "@/features/billing/components/IncludeAttachmentPrintDialog";
import type { Invoice } from "@/features/invoices/types/invoice.types";
import {
  canCancelInvoice,
  getCancelInvoiceDisabledReason,
} from "@/features/invoices/utils/invoice-status";
import { hasInvoiceBalance } from "@/features/invoices/utils/sum-invoice-billing";
import {
  downloadInvoicePdf,
  generateInvoicePdf,
} from "@/features/invoices/utils/generate-invoice-pdf";
import { cancelInvoice } from "@/features/invoices/services/invoices.service";
import {
  downloadEncounterAttachmentBytes,
  fetchInvoiceAttachments,
} from "@/features/visits/services/visit-attachments.service";
import type { VisitEncounterAttachment } from "@/features/visits/types/visit-attachment.types";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage } from "@/lib/bff-field-errors";
import { getErrorMessage } from "@/lib/fetch-error";
import { downloadPdfBytes, mergePdfDocuments } from "@/lib/pdf-merge";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

type InvoiceDetailActionsProps = {
  invoice: Invoice;
  onRecordPayment?: () => void;
  onInternalReference?: () => void;
  onInvoiceCancelled?: (invoice: Invoice) => void;
  className?: string;
};

export function InvoiceDetailActions({
  invoice,
  onRecordPayment,
  onInternalReference,
  onInvoiceCancelled,
  className,
}: InvoiceDetailActionsProps) {
  const { toast } = useToast();
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [printDialogOpen, setPrintDialogOpen] = useState(false);
  const [pendingAttachments, setPendingAttachments] = useState<
    VisitEncounterAttachment[]
  >([]);

  const isInsurance = isInsuranceInvoice(invoice);
  const isPosted = String(invoice.state).toLowerCase() === "posted";
  const canRecordPayment = hasInvoiceBalance(invoice);
  const showPrimaryPayment = !isInsurance && isPosted && Boolean(onRecordPayment);
  const showMenuRecordPayment = isInsurance && isPosted && Boolean(onRecordPayment);
  const cancelDisabledReason = getCancelInvoiceDisabledReason(invoice);
  const canCancel = canCancelInvoice(invoice);

  async function runPlainDownload() {
    setIsDownloadingPdf(true);
    try {
      await downloadInvoicePdf(invoice);
      toast({
        variant: "success",
        title: "PDF downloaded",
        description: "The invoice PDF was saved to your device.",
      });
    } catch (error) {
      toast({
        variant: "error",
        title: "Could not download PDF",
        description: getErrorMessage(error),
      });
    } finally {
      setIsDownloadingPdf(false);
      setPrintDialogOpen(false);
    }
  }

  async function runMergedDownload(attachments: VisitEncounterAttachment[]) {
    setIsDownloadingPdf(true);
    try {
      const generated = await generateInvoicePdf(invoice);
      const attachmentBytes = await Promise.all(
        attachments.map((attachment) =>
          downloadEncounterAttachmentBytes(
            attachment.encounter_uuid,
            attachment.uuid,
          ),
        ),
      );
      const merged = await mergePdfDocuments(generated.bytes, attachmentBytes);
      downloadPdfBytes(merged, generated.filename);
      toast({
        variant: "success",
        title: "PDF downloaded",
        description: "The invoice PDF with attachment was saved.",
      });
    } catch (error) {
      toast({
        variant: "error",
        title: "Could not download PDF",
        description: getErrorMessage(error),
      });
    } finally {
      setIsDownloadingPdf(false);
      setPrintDialogOpen(false);
    }
  }

  async function handleDownloadPdf() {
    setIsDownloadingPdf(true);
    try {
      const response = await fetchInvoiceAttachments(invoice.id);
      const attachments = response.results ?? [];
      if (attachments.length === 0) {
        await downloadInvoicePdf(invoice);
        toast({
          variant: "success",
          title: "PDF downloaded",
          description: "The invoice PDF was saved to your device.",
        });
        return;
      }
      setPendingAttachments(attachments);
      setPrintDialogOpen(true);
    } catch (error) {
      toast({
        variant: "error",
        title: "Could not download PDF",
        description: getErrorMessage(error),
      });
    } finally {
      setIsDownloadingPdf(false);
    }
  }

  async function handleCancel() {
    if (!canCancel) {
      return;
    }

    setIsCancelling(true);
    try {
      const cancelled = await cancelInvoice(invoice.id);
      onInvoiceCancelled?.(cancelled);
      setCancelConfirmOpen(false);
      toast({
        variant: "success",
        title: "Invoice cancelled",
        description: `${invoice.name || `Invoice #${invoice.id}`} was cancelled. Related payments were cancelled and the sales order was reopened.`,
      });
    } catch (error) {
      toast({
        variant: "error",
        title: "Could not cancel invoice",
        description:
          error instanceof BffError
            ? formatBffErrorMessage(error.message, error.errors)
            : getErrorMessage(error),
      });
    } finally {
      setIsCancelling(false);
    }
  }

  return (
    <>
      <div className={cn("flex shrink-0 flex-wrap items-center gap-2", className)}>
        {showPrimaryPayment ? (
          <PrimaryButton
            type="button"
            onClick={onRecordPayment}
            disabled={!canRecordPayment}
            title={canRecordPayment ? undefined : "This invoice is fully paid."}
            data-testid="record-payment-button"
          >
            Record payment
          </PrimaryButton>
        ) : null}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="rounded-full"
              disabled={isDownloadingPdf || isCancelling}
              aria-label="Invoice actions"
              data-testid="invoice-actions-menu-button"
            >
              <MoreVertical className="size-4" aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              disabled={isDownloadingPdf}
              onClick={() => void handleDownloadPdf()}
              data-testid="invoice-download-pdf-menu-item"
            >
              {isDownloadingPdf ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <FileDown className="size-4" aria-hidden="true" />
              )}
              Download PDF
            </DropdownMenuItem>
            {showMenuRecordPayment ? (
              <DropdownMenuItem
                onClick={onRecordPayment}
                disabled={!canRecordPayment}
                title={
                  canRecordPayment ? undefined : "This invoice is fully paid."
                }
                data-testid="invoice-record-payment-menu-item"
              >
                <Wallet className="size-4" aria-hidden="true" />
                Record payment
              </DropdownMenuItem>
            ) : null}
            {onInternalReference ? (
              <DropdownMenuItem
                onClick={onInternalReference}
                data-testid="invoice-internal-reference-menu-item"
              >
                <StickyNote className="size-4" aria-hidden="true" />
                Internal reference
              </DropdownMenuItem>
            ) : null}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              disabled={!canCancel || isCancelling}
              title={cancelDisabledReason ?? undefined}
              className="text-red-700 focus:text-red-700"
              onClick={() => setCancelConfirmOpen(true)}
              data-testid="invoice-cancel-menu-item"
            >
              {isCancelling ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <XCircle className="size-4" aria-hidden="true" />
              )}
              Cancel invoice
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Dialog open={cancelConfirmOpen} onOpenChange={setCancelConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel invoice?</DialogTitle>
            <DialogDescription>
              This cancels {invoice.name || `invoice #${invoice.id}`}, cancels
              related payments, and reopens the sales order to draft.
            </DialogDescription>
          </DialogHeader>
          {cancelDisabledReason ? (
            <p className="text-sm text-red-700">{cancelDisabledReason}</p>
          ) : null}
          <DialogFooter>
            <SecondaryButton
              type="button"
              disabled={isCancelling}
              onClick={() => setCancelConfirmOpen(false)}
            >
              Keep invoice
            </SecondaryButton>
            <DestructiveButton
              type="button"
              disabled={!canCancel || isCancelling}
              onClick={() => void handleCancel()}
              data-testid="invoice-cancel-confirm-button"
            >
              {isCancelling ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Cancelling...
                </>
              ) : (
                "Cancel invoice"
              )}
            </DestructiveButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <IncludeAttachmentPrintDialog
        open={printDialogOpen}
        onOpenChange={setPrintDialogOpen}
        documentLabel="Invoice"
        isWorking={isDownloadingPdf}
        onInclude={() => void runMergedDownload(pendingAttachments)}
        onWithout={() => void runPlainDownload()}
      />
    </>
  );
}
