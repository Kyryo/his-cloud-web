"use client";

import { FileDown, Loader2, MoreVertical } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SalesOrderConvertToInvoiceAction } from "@/features/sales-orders/components/detail/SalesOrderConvertToInvoiceAction";
import {
  cancelSalesOrder,
  fetchSalesOrder,
} from "@/features/sales-orders/services/sales-orders.service";
import type { SalesOrder } from "@/features/sales-orders/types/sales-order.types";
import { downloadSalesOrderPdf } from "@/features/sales-orders/utils/generate-sales-order-pdf";
import {
  canCancelSalesOrder,
  getCancelSalesOrderDisabledReason,
} from "@/features/sales-orders/utils/sales-order-status";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage } from "@/lib/bff-field-errors";
import { getErrorMessage } from "@/lib/fetch-error";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

type SalesOrderDetailActionsProps = {
  order: SalesOrder;
  onOrderUpdated: (order: SalesOrder) => void;
  className?: string;
};

export function SalesOrderDetailActions({
  order,
  onOrderUpdated,
  className,
}: SalesOrderDetailActionsProps) {
  const { toast } = useToast();
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const cancelDisabledReason = getCancelSalesOrderDisabledReason(order);
  const canCancel = canCancelSalesOrder(order);

  async function handleDownloadPdf() {
    setIsDownloadingPdf(true);
    try {
      await downloadSalesOrderPdf(order);
      toast({
        variant: "success",
        title: "PDF downloaded",
        description: "The sales order PDF was saved to your device.",
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

  async function handleCancel() {
    if (!canCancel) {
      return;
    }

    setIsCancelling(true);
    try {
      await cancelSalesOrder(order.id);
      const refreshedOrder = await fetchSalesOrder(order.id);
      onOrderUpdated(refreshedOrder);
      toast({
        variant: "success",
        title: "Sales order cancelled",
        description: `${order.name || `Order #${order.id}`} was cancelled.`,
      });
    } catch (error) {
      toast({
        variant: "error",
        title: "Could not cancel sales order",
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
    <div className={cn("flex shrink-0 flex-wrap items-center gap-2", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="rounded-full"
            disabled={isDownloadingPdf || isCancelling}
            aria-label="Sales order actions"
            data-testid="sales-order-actions-menu-button"
          >
            <MoreVertical className="size-4" aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            disabled={isDownloadingPdf}
            onClick={() => void handleDownloadPdf()}
            data-testid="sales-order-download-pdf-menu-item"
          >
            {isDownloadingPdf ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <FileDown className="size-4" aria-hidden="true" />
            )}
            Download PDF
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            disabled={!canCancel || isCancelling}
            title={cancelDisabledReason ?? undefined}
            className="text-red-700 focus:text-red-700"
            onClick={() => void handleCancel()}
            data-testid="sales-order-cancel-menu-item"
          >
            {isCancelling ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : null}
            Cancel
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <SalesOrderConvertToInvoiceAction
        order={order}
        onOrderUpdated={onOrderUpdated}
      />
    </div>
  );
}
