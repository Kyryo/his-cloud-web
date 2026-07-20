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
import {
  getVisibleStockAdjustmentDocumentActions,
  type StockAdjustmentDocumentActionKey,
} from "@/features/inventory/utils/stock-adjustment-document-actions";
import { useToast } from "@/providers/toast-provider";
import { useUser } from "@/providers/user-provider";

type StockAdjustmentDetailPageProps = {
  adjustmentUuid: string;
};

type LinesEditorState = {
  lineCount: number;
  isDirty: boolean;
  draftLines: StockAdjustmentLineDraft[];
  validationIssueCount: number;
};

const actionLabels: Record<StockAdjustmentDocumentActionKey, string> = {
  submit: "Submit",
  approve: "Approve",
  reject: "Reject",
  apply: "Apply",
  cancel: "Cancel",
};

function getStockAdjustmentActions(
  adjustment: StockAdjustment,
  userId: number | null | undefined,
  onAction: (action: StockAdjustmentAction) => Promise<void>,
): InventoryDocumentAction[] {
  return getVisibleStockAdjustmentDocumentActions(adjustment, userId).map(
    (key) => ({
      key,
      label: actionLabels[key],
      variant:
        key === "submit" || key === "approve" || key === "apply"
          ? "primary"
          : key === "reject" || key === "cancel"
            ? "destructive"
            : undefined,
      confirmation:
        key === "cancel"
          ? {
              title: "Cancel stock adjustment?",
              description: `${adjustment.reference_number} will be cancelled and can no longer be edited or submitted.`,
              confirmLabel: "Cancel adjustment",
            }
          : undefined,
      onClick: () => onAction(key),
    }),
  );
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
  const { userData } = useUser();
  const [adjustment, setAdjustment] = useState<StockAdjustment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updateOpen, setUpdateOpen] = useState(false);
  const [linesEditorState, setLinesEditorState] =
    useState<LinesEditorState | null>(null);
  const autoAddLine = searchParams.get("add-lines") === "1";

  useAppBreadcrumb(adjustment?.reference_number ?? null);

  useEffect(() => {
    let cancelled = false;

    async function loadAdjustment() {
      try {
        const data = await fetchStockAdjustment(adjustmentUuid);
        if (!cancelled) {
          setAdjustment(data);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load stock adjustment.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadAdjustment();
    return () => {
      cancelled = true;
    };
  }, [adjustmentUuid]);

  useEffect(() => {
    if (!adjustment || !autoAddLine) {
      return;
    }

    router.replace(ROUTES.inventoryStockAdjustmentDetail(adjustment.uuid), {
      scroll: false,
    });
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
        new_unit_cost:
          line.new_unit_cost != null ? String(line.new_unit_cost) : "0",
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
        const submitDescription = updated.allow_self_approval
          ? "You can approve this adjustment yourself, or wait for another team member."
          : "Awaiting approval from another team member.";
        toast({
          title:
            action === "approve" && updated.status === "APPLIED"
              ? "Stock adjustment approved and applied"
              : actionSuccessTitles[action],
          description:
            action === "submit"
              ? submitDescription
              : action === "approve" && updated.status === "APPLIED"
                ? "The stock changes were applied immediately."
              : `${updated.reference_number} has been updated.`,
          variant: "success",
        });
      } catch (err) {
        toast({
          title: "Action could not be completed",
          description:
            err instanceof Error ? err.message : "Something went wrong.",
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
    () =>
      adjustment
        ? getStockAdjustmentActions(adjustment, userData?.id, handleAction)
        : [],
    [adjustment, handleAction, userData?.id],
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
        actions={
          <InventoryDocumentActions
            actions={actions}
            className="[&_button]:rounded-full"
          />
        }
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
