"use client";

import { PanelRight } from "lucide-react";
import { useCallback, useState } from "react";

import { Button } from "@/components/ui/button";
import { FabButton } from "@/components/ui/fab-button";
import {
  DetailPageMainAsideGrid,
  DetailPageMainSection,
  DetailPageTabNavItem,
  DetailPageTabsNavSection,
  DetailPageTabsSection,
} from "@/features/app-shell/components/page-layout";
import { AnimatedPurchaseOrderTotal } from "@/features/inventory/components/detail/AnimatedPurchaseOrderTotal";
import { PurchaseOrderDetailActivityTab } from "@/features/inventory/components/detail/PurchaseOrderDetailActivityTab";
import { PurchaseOrderDetailNotesTab } from "@/features/inventory/components/detail/PurchaseOrderDetailNotesTab";
import { PurchaseOrderLinesEditor } from "@/features/inventory/components/detail/PurchaseOrderLinesEditor";
import { InventorySummaryPanel } from "@/features/inventory/components/InventorySummaryPanel";
import type { PurchaseOrder } from "@/features/inventory/types/inventory.types";
import type { PurchaseOrderLineDraft } from "@/features/inventory/types/purchase-order-line-draft";
import {
  formatDisplayDate,
  formatDisplayDateTime,
  formatPurchaseStatusLabel,
} from "@/features/inventory/utils/format-inventory";
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

  const handleLinesStateChange = useCallback(
    (state: {
      lineCount: number;
      totalValue: number;
      isDirty: boolean;
      draftLines: PurchaseOrderLineDraft[];
    }) => {
      setLineCount(state.lineCount);
      setTotalValue(state.totalValue);
      onLinesStateChange?.(state);
    },
    [onLinesStateChange],
  );

  const sidebarUpdateAction =
    canEditLines && onUpdateClick ? (
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-7 px-2 text-brand-primary hover:text-brand-navy"
        onClick={onUpdateClick}
        data-testid="purchase-order-sidebar-update-button"
      >
        Update
      </Button>
    ) : null;

  const summaryPanel = (
    <div className={cn(!showSummaryPanel && "hidden xl:block")}>
      <InventorySummaryPanel
        highlight={
          <dl className="space-y-2.5">
            <div className="flex items-center justify-between gap-3 text-sm">
              <dt className="text-brand-muted">Total value</dt>
              <dd className="font-semibold text-brand-navy">
                <AnimatedPurchaseOrderTotal value={totalValue} currency={currency} />
              </dd>
            </div>
          </dl>
        }
        sections={[
          {
            title: "Order summary",
            action: sidebarUpdateAction,
            fields: [
              { label: "Reference", value: order.reference_number },
              { label: "Vendor", value: order.vendor_name },
              { label: "Status", value: formatPurchaseStatusLabel(order.status) },
              { label: "Delivery date", value: formatDisplayDate(order.delivery_date) },
              { label: "LPO number", value: order.lpo_number ?? "—" },
              { label: "GRN number", value: order.grn_number ?? "—" },
              { label: "Created", value: formatDisplayDateTime(order.created_at) },
            ],
          },
        ]}
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
          <span className="inline-flex items-center gap-2">
            Line items
            {lineCount > 0 ? (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-brand-muted">
                {lineCount}
              </span>
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
          Activity
        </DetailPageTabNavItem>
      </DetailPageTabsNavSection>

      <DetailPageMainAsideGrid>
        <DetailPageMainSection>
          {activeTab === "lines" ? (
            <PurchaseOrderLinesEditor
              order={order}
              canEdit={canEditLines}
              currency={currency}
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
