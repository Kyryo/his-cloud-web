"use client";

import { FileDown, Loader2, Mail, MoreVertical } from "lucide-react";
import { useState } from "react";

import { PrimaryButton } from "@/components/ui/app-buttons";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SendReceiptEmailDialog } from "@/features/payments/components/SendReceiptEmailDialog";
import type { Payment } from "@/features/payments/types/payment.types";
import { downloadPaymentReceiptPdf } from "@/features/payments/utils/generate-payment-receipt-pdf";
import { getErrorMessage } from "@/lib/fetch-error";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

type PaymentDetailActionsProps = {
  payment: Payment;
  className?: string;
};

export function PaymentDetailActions({
  payment,
  className,
}: PaymentDetailActionsProps) {
  const { toast } = useToast();
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [sendReceiptOpen, setSendReceiptOpen] = useState(false);

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
    </>
  );
}
