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
import { InventoryDetailNotFound } from "@/features/inventory/components/detail/InventoryDetailNotFound";
import { PurchaseOrderDetailHeader } from "@/features/inventory/components/detail/PurchaseOrderDetailHeader";
import { PurchaseOrderDetailTabs } from "@/features/inventory/components/detail/PurchaseOrderDetailTabs";
import { PurchaseOrderDocumentActions } from "@/features/inventory/components/PurchaseOrderDocumentActions";
import { UpdatePurchaseOrderDialog } from "@/features/inventory/components/UpdatePurchaseOrderDialog";
import { useTenantCurrency } from "@/features/inventory/hooks/use-tenant-currency";
import {
  fetchPurchaseOrder,
  runPurchaseOrderAction,
  type PurchaseOrderAction,
} from "@/features/inventory/services/purchase-orders.service";
import type { PurchaseOrder } from "@/features/inventory/types/inventory.types";
import type { PurchaseOrderLineDraft } from "@/features/inventory/types/purchase-order-line-draft";
import { validatePurchaseOrderLinesForSubmit } from "@/features/inventory/types/purchase-order-line-draft";
import { useToast } from "@/providers/toast-provider";

type PurchaseOrderDetailPageProps = {
  orderUuid: string;
};

type LinesEditorState = {
  lineCount: number;
  totalValue: number;
  isDirty: boolean;
  draftLines: PurchaseOrderLineDraft[];
  validationIssueCount: number;
};

export function PurchaseOrderDetailPage({ orderUuid }: PurchaseOrderDetailPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const currency = useTenantCurrency();
  const [order, setOrder] = useState<PurchaseOrder | null>(null);
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
      const data = await fetchPurchaseOrder(orderUuid);
      setOrder(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load purchase order.");
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

    router.replace(ROUTES.inventoryPurchaseOrderDetail(order.uuid), { scroll: false });
  }, [autoAddLine, order, router]);

  const handleAction = useCallback(
    async (action: PurchaseOrderAction) => {
      try {
        const updated = await runPurchaseOrderAction(orderUuid, action);
        setOrder(updated);

        const titleByAction: Record<PurchaseOrderAction, string> = {
          submit: "Purchase order submitted",
          approve: "Purchase order approved",
          confirm: "Purchase order confirmed",
          reject: "Purchase order rejected",
          cancel: "Purchase order cancelled",
        };

        const descriptionByAction: Record<PurchaseOrderAction, string> = {
          submit: "Awaiting approval from another team member.",
          approve: "Stock has been posted to the receiving location.",
          confirm: "Stock has been posted to the receiving location.",
          reject: "The order has been returned to the owner as cancelled.",
          cancel: "This order can no longer be edited or submitted.",
        };

        toast({
          title: titleByAction[action],
          description: descriptionByAction[action],
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
        productName: null,
        quantity: String(line.quantity),
        unit_cost: String(line.unit_cost),
        batch: line.batch ?? null,
        expiry_date: line.expiry_date ?? null,
      }));

    return validatePurchaseOrderLinesForSubmit(linesToValidate);
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
        message="Loading purchase order..."
        className={PAGE_CONTENT_LOADER_BELOW_PAGE_CHROME_CLASS}
      />
    );
  }

  if (error || !order) {
    return (
      <InventoryDetailNotFound
        title="Purchase order not found"
        message={error ?? "This purchase order could not be loaded."}
      />
    );
  }

  const canEditLines = order.status === "DRAFT";

  return (
    <DetailPageLayout data-testid="inventory-purchase-order-detail-page">
      <UpdatePurchaseOrderDialog
        order={order}
        open={updateOpen}
        onOpenChange={setUpdateOpen}
        onUpdated={setOrder}
      />

      <PurchaseOrderDetailHeader
        order={order}
        onUpdate={canEditLines ? () => setUpdateOpen(true) : undefined}
        actions={
          <PurchaseOrderDocumentActions
            order={order}
            onAction={handleAction}
            onBeforeSubmit={handleBeforeSubmit}
          />
        }
      />
      <PurchaseOrderDetailTabs
        order={order}
        canEditLines={canEditLines}
        currency={currency}
        autoAddLine={autoAddLine}
        onUpdateClick={canEditLines ? () => setUpdateOpen(true) : undefined}
        onOrderUpdated={setOrder}
        onError={handleLinesError}
        onLinesStateChange={setLinesEditorState}
      />
    </DetailPageLayout>
  );
}
