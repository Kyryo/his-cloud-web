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
import { InternalOrderDetailActivityTab } from "@/features/inventory/components/detail/InternalOrderDetailActivityTab";
import { InternalOrderDetailNotesTab } from "@/features/inventory/components/detail/InternalOrderDetailNotesTab";
import { InternalOrderLinesEditor } from "@/features/inventory/components/detail/InternalOrderLinesEditor";
import { InternalOrderSummarySidebar } from "@/features/inventory/components/detail/InternalOrderSummarySidebar";
import { useClinicBatchTrackingForLocation } from "@/features/inventory/hooks/use-clinic-batch-tracking";
import type { InternalOrder } from "@/features/inventory/types/inventory.types";
import type { InternalOrderLineDraft } from "@/features/inventory/types/internal-order-line-draft";
import { buildInternalOrderActivityItems } from "@/features/inventory/utils/internal-order-activity";
import { cn } from "@/lib/utils";

type InternalOrderDetailTabsProps = {
  order: InternalOrder;
  canEditLines: boolean;
  autoAddLine?: boolean;
  onUpdateClick?: () => void;
  onOrderUpdated: (order: InternalOrder) => void;
  onError: (message: string) => void;
  onLinesStateChange?: (state: {
    lineCount: number;
    isDirty: boolean;
    draftLines: InternalOrderLineDraft[];
    validationIssueCount: number;
  }) => void;
};

type DetailTabId = "lines" | "notes" | "activity";

export function InternalOrderDetailTabs({
  order,
  canEditLines,
  autoAddLine = false,
  onUpdateClick,
  onOrderUpdated,
  onError,
  onLinesStateChange,
}: InternalOrderDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<DetailTabId>("lines");
  const [showSummaryPanel, setShowSummaryPanel] = useState(false);
  const [lineCount, setLineCount] = useState(order.lines.length);
  const [draftLines, setDraftLines] = useState<InternalOrderLineDraft[] | null>(null);
  const [validationIssueCount, setValidationIssueCount] = useState(0);
  const { batchTrackingEnabled } = useClinicBatchTrackingForLocation(order.source_location);

  const activityCount = useMemo(
    () => buildInternalOrderActivityItems(order).length,
    [order],
  );

  const handleLinesStateChange = useCallback(
    (state: {
      lineCount: number;
      isDirty: boolean;
      draftLines: InternalOrderLineDraft[];
      validationIssueCount: number;
    }) => {
      setLineCount(state.lineCount);
      setDraftLines(state.draftLines);
      setValidationIssueCount(state.validationIssueCount);
      onLinesStateChange?.(state);
    },
    [onLinesStateChange],
  );

  const summaryPanel = (
    <div className={cn(!showSummaryPanel && "hidden xl:block")}>
      <InternalOrderSummarySidebar
        order={order}
        draftLines={draftLines ?? undefined}
        batchTrackingEnabled={batchTrackingEnabled}
        onEditClick={canEditLines ? onUpdateClick : undefined}
      />
    </div>
  );

  return (
    <DetailPageTabsSection>
      <DetailPageTabsNavSection aria-label="Internal order sections">
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
            <InternalOrderLinesEditor
              order={order}
              canEdit={canEditLines}
              batchTrackingEnabled={batchTrackingEnabled}
              autoAddLine={autoAddLine}
              onUpdated={onOrderUpdated}
              onError={onError}
              onStateChange={handleLinesStateChange}
            />
          ) : null}
          <InternalOrderDetailNotesTab
            order={order}
            canEdit={canEditLines}
            isActive={activeTab === "notes"}
            onUpdated={onOrderUpdated}
          />
          <InternalOrderDetailActivityTab
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
