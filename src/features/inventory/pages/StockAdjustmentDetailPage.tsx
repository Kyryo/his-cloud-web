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
import { StockAdjustmentDetailHeader } from "@/features/inventory/components/detail/StockAdjustmentDetailHeader";
import { StockAdjustmentDetailTabs } from "@/features/inventory/components/detail/StockAdjustmentDetailTabs";
import {
  fetchStockAdjustment,
  runStockAdjustmentAction,
  type StockAdjustmentAction,
} from "@/features/inventory/services/stock-adjustments.service";
import type { StockAdjustment } from "@/features/inventory/types/inventory.types";
import { useToast } from "@/providers/toast-provider";

type StockAdjustmentDetailPageProps = {
  adjustmentUuid: string;
};

function getStockAdjustmentActions(
  adjustment: StockAdjustment,
  onAction: (action: StockAdjustmentAction) => Promise<void>,
): InventoryDocumentAction[] {
  const actions: InventoryDocumentAction[] = [];

  switch (adjustment.status) {
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
      actions.push({ key: "apply", label: "Apply", onClick: () => onAction("apply") });
      break;
    default:
      break;
  }

  if (
    adjustment.status !== "CANCELLED" &&
    adjustment.status !== "REJECTED" &&
    adjustment.status !== "APPLIED"
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

const actionSuccessTitles: Record<StockAdjustmentAction, string> = {
  submit: "Stock adjustment submitted",
  approve: "Stock adjustment approved",
  reject: "Stock adjustment rejected",
  apply: "Stock adjustment applied",
  cancel: "Stock adjustment cancelled",
};

export function StockAdjustmentDetailPage({
  adjustmentUuid,
}: StockAdjustmentDetailPageProps) {
  const { toast } = useToast();
  const [adjustment, setAdjustment] = useState<StockAdjustment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useAppBreadcrumb(adjustment?.reference_number ?? null);

  const loadAdjustment = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchStockAdjustment(adjustmentUuid);
      setAdjustment(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load stock adjustment.");
    } finally {
      setIsLoading(false);
    }
  }, [adjustmentUuid]);

  useEffect(() => {
    void loadAdjustment();
  }, [loadAdjustment]);

  const handleAction = useCallback(
    async (action: StockAdjustmentAction) => {
      try {
        const updated = await runStockAdjustmentAction(adjustmentUuid, action);
        setAdjustment(updated);
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
    [adjustmentUuid, toast],
  );

  const actions = useMemo(
    () => (adjustment ? getStockAdjustmentActions(adjustment, handleAction) : []),
    [adjustment, handleAction],
  );

  if (isLoading) {
    return (
      <PageLoader
        message="Loading stock adjustment..."
        className={PAGE_CONTENT_LOADER_BELOW_PAGE_CHROME_CLASS}
      />
    );
  }

  if (error || !adjustment) {
    return (
      <InventoryDetailNotFound
        title="Stock adjustment not found"
        message={error ?? "This stock adjustment could not be loaded."}
      />
    );
  }

  return (
    <DetailPageLayout data-testid="inventory-stock-adjustment-detail-page">
      <StockAdjustmentDetailHeader
        adjustment={adjustment}
        actions={<InventoryDocumentActions actions={actions} />}
      />
      <StockAdjustmentDetailTabs adjustment={adjustment} />
    </DetailPageLayout>
  );
}
