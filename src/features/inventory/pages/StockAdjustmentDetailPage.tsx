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
import {
  InventoryDocumentActions,
  type InventoryDocumentAction,
} from "@/features/inventory/components/InventoryDocumentActions";
import { InventoryDetailNotFound } from "@/features/inventory/components/detail/InventoryDetailNotFound";
import { StockAdjustmentDetailHeader } from "@/features/inventory/components/detail/StockAdjustmentDetailHeader";
import { StockAdjustmentDetailTabs } from "@/features/inventory/components/detail/StockAdjustmentDetailTabs";
import { UpdateStockAdjustmentDialog } from "@/features/inventory/components/UpdateStockAdjustmentDialog";
import {
  fetchStockAdjustment,
  runStockAdjustmentAction,
  type StockAdjustmentAction,
} from "@/features/inventory/services/stock-adjustments.service";
import type { StockAdjustment } from "@/features/inventory/types/inventory.types";
import type { StockAdjustmentLineDraft } from "@/features/inventory/types/stock-adjustment-line-draft";
import { validateStockAdjustmentLinesForSubmit } from "@/features/inventory/types/stock-adjustment-line-draft";
import { useToast } from "@/providers/toast-provider";

type StockAdjustmentDetailPageProps = {
  adjustmentUuid: string;
};

type LinesEditorState = {
  lineCount: number;
  isDirty: boolean;
  draftLines: StockAdjustmentLineDraft[];
  validationIssueCount: number;
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [adjustment, setAdjustment] = useState<StockAdjustment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updateOpen, setUpdateOpen] = useState(false);
  const [linesEditorState, setLinesEditorState] = useState<LinesEditorState | null>(null);
  const autoAddLine = searchParams.get("add-lines") === "1";

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

  useEffect(() => {
    if (!adjustment || !autoAddLine) {
      return;
    }

    router.replace(ROUTES.inventoryStockAdjustmentDetail(adjustment.uuid), { scroll: false });
  }, [adjustment, autoAddLine, router]);

  const submitValidationMessage = useMemo(() => {
    if (!adjustment || adjustment.status !== "DRAFT") {
      return null;
    }

    if (linesEditorState?.isDirty) {
      return "Save your line item changes before submitting this adjustment.";
    }

    const linesToValidate =
      linesEditorState?.draftLines ??
      adjustment.lines.map((line) => ({
        key: String(line.id ?? line.product_id),
        product_id: line.product_id,
        productName: line.product_name ?? null,
        quantity_delta: String(line.quantity_delta),
        new_unit_cost: line.new_unit_cost != null ? String(line.new_unit_cost) : "0",
      }));

    return validateStockAdjustmentLinesForSubmit(
      linesToValidate,
      adjustment.adjustment_type,
    );
  }, [adjustment, linesEditorState]);

  const handleAction = useCallback(
    async (action: StockAdjustmentAction) => {
      if (action === "submit" && submitValidationMessage) {
        toast({
          title: "Cannot submit adjustment",
          description: submitValidationMessage,
          variant: "error",
        });
        return;
      }

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
    [adjustmentUuid, submitValidationMessage, toast],
  );

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

  const canEditLines = adjustment.status === "DRAFT";

  return (
    <DetailPageLayout data-testid="inventory-stock-adjustment-detail-page">
      <UpdateStockAdjustmentDialog
        adjustment={adjustment}
        open={updateOpen}
        onOpenChange={setUpdateOpen}
        onUpdated={setAdjustment}
      />

      <StockAdjustmentDetailHeader
        adjustment={adjustment}
        onUpdate={canEditLines ? () => setUpdateOpen(true) : undefined}
        actions={<InventoryDocumentActions actions={actions} />}
      />

      <StockAdjustmentDetailTabs
        adjustment={adjustment}
        canEditLines={canEditLines}
        autoAddLine={autoAddLine}
        onAdjustmentUpdated={setAdjustment}
        onError={handleLinesError}
        onLinesStateChange={setLinesEditorState}
      />
    </DetailPageLayout>
  );
}
