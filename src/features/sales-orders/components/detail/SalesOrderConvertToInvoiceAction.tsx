"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";

import { PrimaryButton, SecondaryButton } from "@/components/ui/app-buttons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createSalesOrderInvoice, fetchSalesOrder } from "@/features/sales-orders/services/sales-orders.service";
import type { SalesOrder } from "@/features/sales-orders/types/sales-order.types";
import {
  canConvertSalesOrderToInvoice,
  getConvertSalesOrderToInvoiceDisabledReason,
} from "@/features/sales-orders/utils/sales-order-status";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage } from "@/lib/bff-field-errors";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

type SalesOrderConvertToInvoiceActionProps = {
  order: SalesOrder;
  onOrderUpdated: (order: SalesOrder) => void;
  className?: string;
  hasDraftSplitMismatch?: boolean;
};

export function SalesOrderConvertToInvoiceAction({
  order,
  onOrderUpdated,
  className,
  hasDraftSplitMismatch = false,
}: SalesOrderConvertToInvoiceActionProps) {
  const { toast } = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isConverting, setIsConverting] = useState(false);

  const disabledReason = getConvertSalesOrderToInvoiceDisabledReason(order, {
    hasDraftSplitMismatch,
  });
  const canConvert = canConvertSalesOrderToInvoice(order, {
    hasDraftSplitMismatch,
  });
  const orderLabel = order.name || `Order #${order.id}`;

  async function handleConvert() {
    setIsConverting(true);
    try {
      const result = await createSalesOrderInvoice(order.id);
      const refreshedOrder = await fetchSalesOrder(order.id);
      onOrderUpdated(refreshedOrder);

      const invoiceLabel = result.invoice.name || `Invoice #${result.invoice.id}`;
      toast({
        variant: "success",
        title: "Invoice created",
        description: `${orderLabel} was converted to ${invoiceLabel}.`,
      });
      setConfirmOpen(false);
    } catch (error) {
      toast({
        variant: "error",
        title: "Could not create invoice",
        description:
          error instanceof BffError
            ? formatBffErrorMessage(error.message, error.errors)
            : error instanceof Error
              ? error.message
              : "The sales order could not be converted to an invoice.",
      });
    } finally {
      setIsConverting(false);
    }
  }

  return (
    <>
      <PrimaryButton
        type="button"
        className={cn(className)}
        disabled={!canConvert || isConverting}
        title={disabledReason ?? undefined}
        onClick={() => setConfirmOpen(true)}
        data-testid="sales-order-convert-to-invoice-button"
      >
        {isConverting ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Creating...
          </>
        ) : (
          "Create invoice"
        )}
      </PrimaryButton>

      <Dialog
        open={confirmOpen}
        onOpenChange={(open) => {
          if (!open && !isConverting) {
            setConfirmOpen(false);
          }
        }}
      >
        <DialogContent className={cn("max-w-md", appFont.className)}>
          <DialogHeader>
            <DialogTitle>Convert to invoice?</DialogTitle>
            <DialogDescription>
              Create an invoice from {orderLabel}. This will post billing for the line
              items on this sales order.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <SecondaryButton
              type="button"
              disabled={isConverting}
              onClick={() => setConfirmOpen(false)}
            >
              Cancel
            </SecondaryButton>
            <PrimaryButton
              type="button"
              disabled={isConverting}
              onClick={() => void handleConvert()}
              data-testid="sales-order-convert-to-invoice-confirm-button"
            >
              {isConverting ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : null}
              Convert to invoice
            </PrimaryButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
