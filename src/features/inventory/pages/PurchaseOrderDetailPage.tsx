"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  PAGE_CONTENT_LOADER_BELOW_PAGE_CHROME_CLASS,
  PageLoader,
} from "@/components/page-loader";
import { DetailPageLayout } from "@/features/app-shell/components/page-layout";
import { useAppBreadcrumb } from "@/features/app-shell/hooks/use-app-breadcrumb";
import {
  InventoryDocumentActions,
  type InventoryDocumentAction,
} from "@/features/inventory/components/InventoryDocumentActions";
import { InventoryDetailNotFound } from "@/features/inventory/components/detail/InventoryDetailNotFound";
import { PurchaseOrderDetailHeader } from "@/features/inventory/components/detail/PurchaseOrderDetailHeader";
import { PurchaseOrderDetailTabs } from "@/features/inventory/components/detail/PurchaseOrderDetailTabs";
import {
  fetchPurchaseOrder,
  runPurchaseOrderAction,
} from "@/features/inventory/services/purchase-orders.service";
import type { PurchaseOrder } from "@/features/inventory/types/inventory.types";
import { useToast } from "@/providers/toast-provider";

type PurchaseOrderDetailPageProps = {
  orderUuid: string;
};

function getPurchaseOrderActions(
  order: PurchaseOrder,
  onAction: (action: "submit" | "confirm" | "cancel") => Promise<void>,
): InventoryDocumentAction[] {
  const actions: InventoryDocumentAction[] = [];

  if (order.status === "DRAFT") {
    actions.push({ key: "submit", label: "Submit", onClick: () => onAction("submit") });
  }
  if (order.status === "SUBMITTED") {
    actions.push({ key: "confirm", label: "Confirm", onClick: () => onAction("confirm") });
  }
  if (order.status !== "CANCELLED" && order.status !== "CONFIRMED") {
    actions.push({
      key: "cancel",
      label: "Cancel",
      variant: "destructive",
      onClick: () => onAction("cancel"),
    });
  }

  return actions;
}

export function PurchaseOrderDetailPage({ orderUuid }: PurchaseOrderDetailPageProps) {
  const { toast } = useToast();
  const [order, setOrder] = useState<PurchaseOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const handleAction = useCallback(
    async (action: "submit" | "confirm" | "cancel") => {
      try {
        const updated = await runPurchaseOrderAction(orderUuid, action);
        setOrder(updated);
        toast({
          title:
            action === "submit"
              ? "Purchase order submitted"
              : action === "confirm"
                ? "Purchase order confirmed"
                : "Purchase order cancelled",
          description: "Sigma will post stock when this order is confirmed.",
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

  const actions = useMemo(
    () => (order ? getPurchaseOrderActions(order, handleAction) : []),
    [order, handleAction],
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

  return (
    <DetailPageLayout data-testid="inventory-purchase-order-detail-page">
      <PurchaseOrderDetailHeader
        order={order}
        actions={<InventoryDocumentActions actions={actions} />}
      />
      <PurchaseOrderDetailTabs order={order} />
    </DetailPageLayout>
  );
}
