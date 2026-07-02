"use client";

import { FileDown, Loader2, MoreVertical, Shield, Wallet } from "lucide-react";
import { useState } from "react";

import { PrimaryButton } from "@/components/ui/app-buttons";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { isInsuranceInvoice } from "@/features/claims/services/claims.service";
import type { Invoice } from "@/features/invoices/types/invoice.types";
import { downloadInvoicePdf } from "@/features/invoices/utils/generate-invoice-pdf";
import { getErrorMessage } from "@/lib/fetch-error";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

type InvoiceDetailActionsProps = {
  invoice: Invoice;
  onRecordPayment?: () => void;
  onClaimInvoice?: () => void;
  className?: string;
};

export function InvoiceDetailActions({
  invoice,
  onRecordPayment,
  onClaimInvoice,
  className,
}: InvoiceDetailActionsProps) {
  const { toast } = useToast();
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const isInsurance = isInsuranceInvoice(invoice);
  const isPosted = String(invoice.state).toLowerCase() === "posted";
  const showPrimaryClaim = isInsurance && isPosted && Boolean(onClaimInvoice);
  const showPrimaryPayment = !isInsurance && isPosted && Boolean(onRecordPayment);
  const showMenuRecordPayment = isInsurance && isPosted && Boolean(onRecordPayment);

  async function handleDownloadPdf() {
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
    }
  }

  return (
    <div className={cn("flex shrink-0 flex-wrap items-center gap-2", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="rounded-full"
            disabled={isDownloadingPdf}
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
              data-testid="invoice-record-payment-menu-item"
            >
              <Wallet className="size-4" aria-hidden="true" />
              Record payment
            </DropdownMenuItem>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>

      {showPrimaryClaim ? (
        <PrimaryButton
          type="button"
          onClick={onClaimInvoice}
          data-testid="claim-invoice-button"
        >
          <Shield className="size-4" aria-hidden="true" />
          Claim invoice
        </PrimaryButton>
      ) : null}

      {showPrimaryPayment ? (
        <PrimaryButton
          type="button"
          onClick={onRecordPayment}
          data-testid="record-payment-button"
        >
          Record payment
        </PrimaryButton>
      ) : null}
    </div>
  );
}
