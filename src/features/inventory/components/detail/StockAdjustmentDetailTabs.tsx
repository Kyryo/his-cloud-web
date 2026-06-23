"use client";

import { PanelRight } from "lucide-react";
import { useCallback, useState } from "react";

import { FabButton } from "@/components/ui/fab-button";
import {
  DetailPageMainAsideGrid,
  DetailPageMainSection,
  DetailPageTabNavItem,
  DetailPageTabsNavSection,
  DetailPageTabsSection,
} from "@/features/app-shell/components/page-layout";
import { StockAdjustmentLinesEditor } from "@/features/inventory/components/detail/StockAdjustmentLinesEditor";
import { InventorySummaryPanel } from "@/features/inventory/components/InventorySummaryPanel";
import type { StockAdjustment } from "@/features/inventory/types/inventory.types";
import type { StockAdjustmentLineDraft } from "@/features/inventory/types/stock-adjustment-line-draft";
import {
  formatAdjustmentTypeLabel,
  formatDisplayDateTime,
  formatStockAdjustmentStatusLabel,
} from "@/features/inventory/utils/format-inventory";
import { cn } from "@/lib/utils";

type StockAdjustmentDetailTabsProps = {
  adjustment: StockAdjustment;
  canEditLines: boolean;
  autoAddLine?: boolean;
  onAdjustmentUpdated: (adjustment: StockAdjustment) => void;
  onError: (message: string) => void;
  onLinesStateChange?: (state: {
    lineCount: number;
    isDirty: boolean;
    draftLines: StockAdjustmentLineDraft[];
    validationIssueCount: number;
  }) => void;
};

type DetailTabId = "lines" | "summary";

function StockAdjustmentSummaryContent({
  adjustment,
}: {
  adjustment: StockAdjustment;
}) {
  return (
    <InventorySummaryPanel
      className="p-0"
      sections={[
        {
          title: "Adjustment summary",
          fields: [
            { label: "Reference", value: adjustment.reference_number },
            {
              label: "Status",
              value: formatStockAdjustmentStatusLabel(adjustment.status),
            },
            {
              label: "Type",
              value: formatAdjustmentTypeLabel(adjustment.adjustment_type),
            },
            { label: "Location", value: adjustment.location },
            { label: "Reason", value: adjustment.reason ?? "—" },
            { label: "Approved", value: formatDisplayDateTime(adjustment.approved_at) },
            { label: "Applied", value: formatDisplayDateTime(adjustment.applied_at) },
            { label: "Created", value: formatDisplayDateTime(adjustment.created_at) },
          ],
        },
      ]}
    />
  );
}

export function StockAdjustmentDetailTabs({
  adjustment,
  canEditLines,
  autoAddLine = false,
  onAdjustmentUpdated,
  onError,
  onLinesStateChange,
}: StockAdjustmentDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<DetailTabId>("lines");
  const [showSummaryPanel, setShowSummaryPanel] = useState(false);
  const [lineCount, setLineCount] = useState(adjustment.lines.length);

  const handleLinesStateChange = useCallback(
    (state: {
      lineCount: number;
      isDirty: boolean;
      draftLines: StockAdjustmentLineDraft[];
      validationIssueCount: number;
    }) => {
      setLineCount(state.lineCount);
      onLinesStateChange?.(state);
    },
    [onLinesStateChange],
  );

  const summaryPanel = (
    <InventorySummaryPanel
      className={cn(!showSummaryPanel && "hidden xl:block")}
      sections={[
        {
          title: "Adjustment summary",
          fields: [
            { label: "Reference", value: adjustment.reference_number },
            {
              label: "Status",
              value: formatStockAdjustmentStatusLabel(adjustment.status),
            },
            {
              label: "Type",
              value: formatAdjustmentTypeLabel(adjustment.adjustment_type),
            },
            { label: "Location", value: adjustment.location },
            { label: "Reason", value: adjustment.reason ?? "—" },
            { label: "Approved", value: formatDisplayDateTime(adjustment.approved_at) },
            { label: "Applied", value: formatDisplayDateTime(adjustment.applied_at) },
            { label: "Created", value: formatDisplayDateTime(adjustment.created_at) },
          ],
        },
      ]}
    />
  );

  return (
    <DetailPageTabsSection>
      <DetailPageTabsNavSection aria-label="Stock adjustment sections">
        <DetailPageTabNavItem
          isActive={activeTab === "lines"}
          onClick={() => setActiveTab("lines")}
        >
          Line items
          {lineCount > 0 ? ` (${lineCount})` : ""}
        </DetailPageTabNavItem>
        <DetailPageTabNavItem
          isActive={activeTab === "summary"}
          onClick={() => setActiveTab("summary")}
        >
          Summary
        </DetailPageTabNavItem>
      </DetailPageTabsNavSection>

      <DetailPageMainAsideGrid>
        <DetailPageMainSection>
          {activeTab === "lines" ? (
            <StockAdjustmentLinesEditor
              adjustment={adjustment}
              canEdit={canEditLines}
              autoAddLine={autoAddLine}
              onUpdated={onAdjustmentUpdated}
              onError={onError}
              onStateChange={handleLinesStateChange}
            />
          ) : (
            <div className="rounded-xl border border-brand-border bg-white p-6 xl:hidden">
              <StockAdjustmentSummaryContent adjustment={adjustment} />
            </div>
          )}
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
