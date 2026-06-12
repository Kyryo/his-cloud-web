"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { ROUTES } from "@/constants/routes";

import {
  PAGE_CONTENT_LOADER_BELOW_PAGE_CHROME_CLASS,
  PageLoader,
} from "@/components/page-loader";
import { DetailPageLayout } from "@/features/app-shell/components/page-layout";
import { useAppBreadcrumb } from "@/features/app-shell/hooks/use-app-breadcrumb";
import { InternalOrderDetailHeader } from "@/features/inventory/components/detail/InternalOrderDetailHeader";
import { InternalOrderDetailTabs } from "@/features/inventory/components/detail/InternalOrderDetailTabs";
import { InventoryDetailNotFound } from "@/features/inventory/components/detail/InventoryDetailNotFound";
import { InternalOrderDocumentActions } from "@/features/inventory/components/InternalOrderDocumentActions";
import { UpdateInternalOrderDialog } from "@/features/inventory/components/UpdateInternalOrderDialog";
import {
  fetchInternalOrder,
  runInternalOrderAction,
  type InternalOrderAction,
} from "@/features/inventory/services/internal-orders.service";
import type { InternalOrder } from "@/features/inventory/types/inventory.types";
import type { InternalOrderLineDraft } from "@/features/inventory/types/internal-order-line-draft";
import { validateInternalOrderLinesForSubmit } from "@/features/inventory/types/internal-order-line-draft";
import { useToast } from "@/providers/toast-provider";

type InternalOrderDetailPageProps = {
  orderUuid: string;
};

type LinesEditorState = {
  lineCount: number;
  isDirty: boolean;
  draftLines: InternalOrderLineDraft[];
  validationIssueCount: number;
};

const actionSuccessTitles: Record<InternalOrderAction, string> = {
  submit: "Internal order submitted",
  approve: "Internal order approved",
  reject: "Internal order rejected",
  dispatch: "Internal order dispatched",
  receive: "Internal order received",
  cancel: "Internal order cancelled",
};

const actionSuccessDescriptions: Record<InternalOrderAction, string> = {
  submit: "Awaiting approval from another team member.",
  approve: "This order can now be dispatched.",
  reject: "The order has been returned to the owner as rejected.",
  dispatch: "Stock has been marked as dispatched from the source location.",
  receive: "Stock has been received at the destination location.",
  cancel: "This order can no longer be edited or submitted.",
};

export function InternalOrderDetailPage({ orderUuid }: InternalOrderDetailPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [order, setOrder] = useState<InternalOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updateOpen, setUpdateOpen] = useState(false);
  const [linesEditorState, setLinesEditorState] = useState<LinesEditorState | null>(null);
  const autoAddLine = searchParams.get("add-lines") === "1";

  useAppBreadcrumb(order?.reference_number ?? null);

  const loadOrder = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchInternalOrder(orderUuid);
      setOrder(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load internal order.");
    } finally {
      setIsLoading(false);
    }
  }, [orderUuid]);

  useEffect(() => {
    void loadOrder();
  }, [loadOrder]);

  useEffect(() => {
    if (!order || !autoAddLine) {
      return;
    }

    router.replace(ROUTES.inventoryInternalOrderDetail(order.uuid), { scroll: false });
  }, [autoAddLine, order, router]);

  const handleAction = useCallback(
    async (action: InternalOrderAction) => {
      try {
        const updated = await runInternalOrderAction(orderUuid, action);
        setOrder(updated);
        toast({
          title: actionSuccessTitles[action],
          description: actionSuccessDescriptions[action],
          variant: "success",
        });
      } catch (err) {
        toast({
          title: "Action could not be completed",
          description: err instanceof Error ? err.message : "Something went wrong.",
          variant: "error",
        });
      }
    },
    [orderUuid, toast],
  );

  const submitValidationMessage = useMemo(() => {
    if (!order || order.status !== "DRAFT") {
      return null;
    }

    if (linesEditorState?.isDirty) {
      return "Save your line item changes before submitting this order.";
    }

    const linesToValidate =
      linesEditorState?.draftLines ??
      order.lines.map((line) => ({
        key: String(line.id ?? line.odoo_product_id),
        odoo_product_id: line.odoo_product_id,
        productName: line.product_name ?? null,
        quantity: String(line.quantity),
        batch: line.batch ?? null,
      }));

    return validateInternalOrderLinesForSubmit(linesToValidate);
  }, [linesEditorState, order]);

  const handleBeforeSubmit = useCallback(() => submitValidationMessage, [submitValidationMessage]);

  const handleLinesError = useCallback(
    (message: string) => {
      toast({
        title: "Line items",
        description: message,
        variant: "error",
      });
    },
    [toast],
  );

  if (isLoading) {
    return (
      <PageLoader
        message="Loading internal order..."
        className={PAGE_CONTENT_LOADER_BELOW_PAGE_CHROME_CLASS}
      />
    );
  }

  if (error || !order) {
    return (
      <InventoryDetailNotFound
        title="Internal order not found"
        message={error ?? "This internal order could not be loaded."}
      />
    );
  }

  const canEditLines = order.status === "DRAFT";

  return (
    <DetailPageLayout data-testid="inventory-internal-order-detail-page">
      <UpdateInternalOrderDialog
        order={order}
        open={updateOpen}
        onOpenChange={setUpdateOpen}
        onUpdated={setOrder}
      />

      <InternalOrderDetailHeader
        order={order}
        onUpdate={canEditLines ? () => setUpdateOpen(true) : undefined}
        actions={
          <InternalOrderDocumentActions
            order={order}
            onAction={handleAction}
            onBeforeSubmit={handleBeforeSubmit}
          />
        }
      />

      <InternalOrderDetailTabs
        order={order}
        canEditLines={canEditLines}
        autoAddLine={autoAddLine}
        onUpdateClick={canEditLines ? () => setUpdateOpen(true) : undefined}
        onOrderUpdated={setOrder}
        onError={handleLinesError}
        onLinesStateChange={setLinesEditorState}
      />
    </DetailPageLayout>
  );
}
