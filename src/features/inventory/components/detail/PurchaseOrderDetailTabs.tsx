"use client";

import { PanelRight } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

import { FabButton } from "@/components/ui/fab-button";
import {
  DetailPageMainAsideGrid,
  DetailPageMainSection,
  DetailPageTabNavItem,
  DetailPageTabsNavSection,
  DetailPageTabsSection,
} from "@/features/app-shell/components/page-layout";
import { PurchaseOrderDetailActivityTab } from "@/features/inventory/components/detail/PurchaseOrderDetailActivityTab";
import { PurchaseOrderDetailNotesTab } from "@/features/inventory/components/detail/PurchaseOrderDetailNotesTab";
import { PurchaseOrderLinesEditor } from "@/features/inventory/components/detail/PurchaseOrderLinesEditor";
import { PurchaseOrderSummarySidebar } from "@/features/inventory/components/detail/PurchaseOrderSummarySidebar";
import { useClinicBatchTrackingForLocation } from "@/features/inventory/hooks/use-clinic-batch-tracking";
import type { PurchaseOrder } from "@/features/inventory/types/inventory.types";
import type { PurchaseOrderLineDraft } from "@/features/inventory/types/purchase-order-line-draft";
import { buildPurchaseOrderActivityItems } from "@/features/inventory/utils/purchase-order-activity";
import { cn } from "@/lib/utils";

type PurchaseOrderDetailTabsProps = {
  order: PurchaseOrder;
  canEditLines: boolean;
  currency: string;
  autoAddLine?: boolean;
  onUpdateClick?: () => void;
  onOrderUpdated: (order: PurchaseOrder) => void;
  onError: (message: string) => void;
  onLinesStateChange?: (state: {
    lineCount: number;
    totalValue: number;
    isDirty: boolean;
    draftLines: PurchaseOrderLineDraft[];
    validationIssueCount: number;
  }) => void;
};

type DetailTabId = "lines" | "notes" | "activity";

export function PurchaseOrderDetailTabs({
  order,
  canEditLines,
  currency,
  autoAddLine = false,
  onUpdateClick,
  onOrderUpdated,
  onError,
  onLinesStateChange,
}: PurchaseOrderDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<DetailTabId>("lines");
  const [showSummaryPanel, setShowSummaryPanel] = useState(false);
  const [lineCount, setLineCount] = useState(order.lines.length);
  const [totalValue, setTotalValue] = useState(
    Number.parseFloat(String(order.total_value ?? 0)) || 0,
  );
  const [draftLines, setDraftLines] = useState<PurchaseOrderLineDraft[] | null>(null);
  const [validationIssueCount, setValidationIssueCount] = useState(0);
  const { batchTrackingEnabled } = useClinicBatchTrackingForLocation(
    order.receiving_location,
  );

  const activityCount = useMemo(
    () => buildPurchaseOrderActivityItems(order).length,
    [order],
  );

  const handleLinesStateChange = useCallback(
    (state: {
      lineCount: number;
      totalValue: number;
      isDirty: boolean;
      draftLines: PurchaseOrderLineDraft[];
      validationIssueCount: number;
    }) => {
      setLineCount(state.lineCount);
      setTotalValue(state.totalValue);
      setDraftLines(state.draftLines);
      setValidationIssueCount(state.validationIssueCount);
      onLinesStateChange?.(state);
    },
    [onLinesStateChange],
  );

  const summaryPanel = (
    <div className={cn(!showSummaryPanel && "hidden xl:block")}>
      <PurchaseOrderSummarySidebar
        order={order}
        draftLines={draftLines ?? undefined}
        batchTrackingEnabled={batchTrackingEnabled}
        onEditClick={canEditLines ? onUpdateClick : undefined}
      />
    </div>
  );

  return (
    <DetailPageTabsSection>
      <DetailPageTabsNavSection aria-label="Purchase order sections">
        <DetailPageTabNavItem
          isActive={activeTab === "lines"}
          onClick={() => setActiveTab("lines")}
        >
          <span className="relative inline-flex items-center gap-2">
            Line items
            {lineCount > 0 ? (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-brand-muted">
                {lineCount}
              </span>
            ) : null}
            {canEditLines && validationIssueCount > 0 ? (
              <span
                className="absolute -right-1 -top-1 size-2 rounded-full bg-red-500"
                aria-label="Line item validation warnings"
              />
            ) : null}
          </span>
        </DetailPageTabNavItem>
        <DetailPageTabNavItem
          isActive={activeTab === "notes"}
          onClick={() => setActiveTab("notes")}
        >
          Notes
        </DetailPageTabNavItem>
        <DetailPageTabNavItem
          isActive={activeTab === "activity"}
          onClick={() => setActiveTab("activity")}
        >
          <span className="inline-flex items-center gap-2">
            Activity
            {activityCount > 0 ? (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-brand-muted">
                {activityCount}
              </span>
            ) : null}
          </span>
        </DetailPageTabNavItem>
      </DetailPageTabsNavSection>

      <DetailPageMainAsideGrid>
        <DetailPageMainSection>
          {activeTab === "lines" ? (
            <PurchaseOrderLinesEditor
              order={order}
              canEdit={canEditLines}
              currency={currency}
              batchTrackingEnabled={batchTrackingEnabled}
              autoAddLine={autoAddLine}
              onUpdated={onOrderUpdated}
              onError={onError}
              onStateChange={handleLinesStateChange}
            />
          ) : null}
          <PurchaseOrderDetailNotesTab
            order={order}
            canEdit={canEditLines}
            isActive={activeTab === "notes"}
            onUpdated={onOrderUpdated}
          />
          <PurchaseOrderDetailActivityTab
            order={order}
            isActive={activeTab === "activity"}
          />
        </DetailPageMainSection>

        {summaryPanel}
      </DetailPageMainAsideGrid>

      <FabButton
        label={showSummaryPanel ? "Hide summary" : "Show summary"}
        icon={PanelRight}
        variant="outline"
        hideFrom="xl"
        className="bg-white"
        onClick={() => setShowSummaryPanel((current) => !current)}
      />
    </DetailPageTabsSection>
  );
}
