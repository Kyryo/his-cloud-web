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
import { InternalOrderDetailHeader } from "@/features/inventory/components/detail/InternalOrderDetailHeader";
import { InternalOrderDetailTabs } from "@/features/inventory/components/detail/InternalOrderDetailTabs";
import { InventoryDetailNotFound } from "@/features/inventory/components/detail/InventoryDetailNotFound";
import {
  fetchInternalOrder,
  runInternalOrderAction,
  type InternalOrderAction,
} from "@/features/inventory/services/internal-orders.service";
import type { InternalOrder } from "@/features/inventory/types/inventory.types";
import { useToast } from "@/providers/toast-provider";

type InternalOrderDetailPageProps = {
  orderUuid: string;
};

function getInternalOrderActions(
  order: InternalOrder,
  onAction: (action: InternalOrderAction) => Promise<void>,
): InventoryDocumentAction[] {
  const actions: InventoryDocumentAction[] = [];

  switch (order.status) {
    case "DRAFT":
      actions.push({ key: "submit", label: "Submit", onClick: () => onAction("submit") });
      break;
    case "SUBMITTED":
      actions.push({ key: "approve", label: "Approve", onClick: () => onAction("approve") });
      actions.push({
        key: "reject",
        label: "Reject",
        variant: "destructive",
        onClick: () => onAction("reject"),
      });
      break;
    case "APPROVED":
      actions.push({ key: "dispatch", label: "Dispatch", onClick: () => onAction("dispatch") });
      break;
    case "DISPATCHED":
      actions.push({ key: "receive", label: "Receive", onClick: () => onAction("receive") });
      break;
    default:
      break;
  }

  if (
    order.status !== "CANCELLED" &&
    order.status !== "REJECTED" &&
    order.status !== "RECEIVED"
  ) {
    actions.push({
      key: "cancel",
      label: "Cancel",
      variant: "destructive",
      onClick: () => onAction("cancel"),
    });
  }

  return actions;
}

const actionSuccessTitles: Record<InternalOrderAction, string> = {
  submit: "Internal order submitted",
  approve: "Internal order approved",
  reject: "Internal order rejected",
  dispatch: "Internal order dispatched",
  receive: "Internal order received",
  cancel: "Internal order cancelled",
};

export function InternalOrderDetailPage({ orderUuid }: InternalOrderDetailPageProps) {
  const { toast } = useToast();
  const [order, setOrder] = useState<InternalOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const handleAction = useCallback(
    async (action: InternalOrderAction) => {
      try {
        const updated = await runInternalOrderAction(orderUuid, action);
        setOrder(updated);
        toast({
          title: actionSuccessTitles[action],
          description: `${updated.reference_number} has been updated.`,
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
    () => (order ? getInternalOrderActions(order, handleAction) : []),
    [order, handleAction],
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

  return (
    <DetailPageLayout data-testid="inventory-internal-order-detail-page">
      <InternalOrderDetailHeader
        order={order}
        actions={<InventoryDocumentActions actions={actions} />}
      />
      <InternalOrderDetailTabs order={order} />
    </DetailPageLayout>
  );
}
