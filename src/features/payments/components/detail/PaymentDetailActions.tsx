"use client";

import { FileDown, Loader2, Mail, MoreVertical, Pencil } from "lucide-react";
import { useEffect, useState } from "react";

import { PrimaryButton } from "@/components/ui/app-buttons";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { fetchInvoice } from "@/features/invoices/services/invoices.service";
import { getInvoiceOutstandingBalance } from "@/features/invoices/utils/sum-invoice-billing";
import { EditPaymentDialog } from "@/features/payments/components/EditPaymentDialog";
import { SendReceiptEmailDialog } from "@/features/payments/components/SendReceiptEmailDialog";
import type { Payment } from "@/features/payments/types/payment.types";
import { downloadPaymentReceiptPdf } from "@/features/payments/utils/generate-payment-receipt-pdf";
import { getErrorMessage } from "@/lib/fetch-error";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

type PaymentDetailActionsProps = {
  payment: Payment;
  onPaymentUpdated?: (payment: Payment) => void;
  className?: string;
};

export function PaymentDetailActions({
  payment,
  onPaymentUpdated,
  className,
}: PaymentDetailActionsProps) {
  const { toast } = useToast();
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [sendReceiptOpen, setSendReceiptOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [invoiceResidual, setInvoiceResidual] = useState<number | null>(null);

  const invoiceCancelled =
    String(payment.invoice_state || "").toLowerCase() === "cancel";
  const paymentCancelled = String(payment.state || "").toLowerCase() === "cancel";
  const canEdit = Boolean(payment.invoice_id) && !invoiceCancelled && !paymentCancelled;

  const editBlockReason = (() => {
    if (!payment.invoice_id) {
      return "This payment is not linked to an invoice.";
    }
    if (invoiceCancelled) {
      return "Payments on cancelled invoices cannot be edited.";
    }
    if (paymentCancelled) {
      return "Cancelled payments cannot be edited.";
    }
    return undefined;
  })();

  useEffect(() => {
    if (!editOpen || !payment.invoice_id) {
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        const invoice = await fetchInvoice(payment.invoice_id!);
        if (!cancelled) {
          setInvoiceResidual(getInvoiceOutstandingBalance(invoice));
        }
      } catch {
        if (!cancelled) {
          setInvoiceResidual(0);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [editOpen, payment.invoice_id]);

  const maxAmount =
    (invoiceResidual ?? 0) + Number(payment.amount || 0);

  async function handleDownloadReceipt() {
    setIsDownloadingPdf(true);
    try {
      await downloadPaymentReceiptPdf(payment);
      toast({
        variant: "success",
        title: "Receipt downloaded",
        description: "The payment receipt PDF was saved to your device.",
      });
    } catch (error) {
      toast({
        variant: "error",
        title: "Could not download receipt",
        description: getErrorMessage(error),
      });
    } finally {
      setIsDownloadingPdf(false);
    }
  }

  return (
    <>
      <div className={cn("flex shrink-0 flex-wrap items-center gap-2", className)}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="rounded-full"
              disabled={isDownloadingPdf}
              aria-label="Payment actions"
              data-testid="payment-actions-menu-button"
            >
              <MoreVertical className="size-4" aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => setSendReceiptOpen(true)}
              data-testid="payment-send-receipt-menu-item"
            >
              <Mail className="size-4" aria-hidden="true" />
              Send receipt via email
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={!canEdit}
              title={editBlockReason}
              onClick={() => setEditOpen(true)}
              data-testid="payment-edit-menu-item"
            >
              <Pencil className="size-4" aria-hidden="true" />
              Edit payment
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <PrimaryButton
          type="button"
          onClick={() => void handleDownloadReceipt()}
          disabled={isDownloadingPdf}
          data-testid="download-receipt-button"
        >
          {isDownloadingPdf ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Downloading...
            </>
          ) : (
            <>
              <FileDown className="size-4" aria-hidden="true" />
              Download receipt
            </>
          )}
        </PrimaryButton>
      </div>

      <SendReceiptEmailDialog
        payment={payment}
        open={sendReceiptOpen}
        onOpenChange={setSendReceiptOpen}
      />

      {canEdit ? (
        <EditPaymentDialog
          payment={payment}
          maxAmount={maxAmount}
          open={editOpen}
          onOpenChange={setEditOpen}
          onUpdated={(updated) => {
            onPaymentUpdated?.(updated);
          }}
        />
      ) : null}
    </>
  );
}
