"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { ROUTES } from "@/constants/routes";

import {
  PAGE_CONTENT_LOADER_BELOW_PAGE_CHROME_CLASS,
  PageLoader,
} from "@/components/page-loader";
import { DetailPageLayout } from "@/features/app-shell/components/page-layout";
import { useAppBreadcrumb } from "@/features/app-shell/hooks/use-app-breadcrumb";
import { InventoryDetailNotFound } from "@/features/inventory/components/detail/InventoryDetailNotFound";
import { EditPurchaseOrderLinesDialog } from "@/features/inventory/components/EditPurchaseOrderLinesDialog";
import { PurchaseOrderDocumentActions } from "@/features/inventory/components/PurchaseOrderDocumentActions";
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

export function PurchaseOrderDetailPage({ orderUuid }: PurchaseOrderDetailPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [order, setOrder] = useState<PurchaseOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editLinesOpen, setEditLinesOpen] = useState(false);

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
    if (
      !order ||
      order.lines.length > 0 ||
      order.status !== "DRAFT" ||
      searchParams.get("add-lines") !== "1"
    ) {
      return;
    }

    setEditLinesOpen(true);
    router.replace(ROUTES.inventoryPurchaseOrderDetail(order.uuid), { scroll: false });
  }, [order, router, searchParams]);

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
      <EditPurchaseOrderLinesDialog
        order={order}
        open={editLinesOpen}
        onOpenChange={setEditLinesOpen}
        onUpdated={setOrder}
      />

      <PurchaseOrderDetailHeader
        order={order}
        actions={
          <PurchaseOrderDocumentActions order={order} onAction={handleAction} />
        }
      />
      <PurchaseOrderDetailTabs
        order={order}
        canEditLines={canEditLines}
        onManageLines={() => setEditLinesOpen(true)}
      />
    </DetailPageLayout>
  );
}
