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
import { AnimatedPurchaseOrderTotal } from "@/features/inventory/components/detail/AnimatedPurchaseOrderTotal";
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
  onOrderUpdated: (order: PurchaseOrder) => void;
  onError: (message: string) => void;
  onLinesStateChange?: (state: {
    lineCount: number;
    totalValue: number;
    isDirty: boolean;
    draftLines: PurchaseOrderLineDraft[];
  }) => void;
};

type DetailTabId = "lines" | "summary";

function PurchaseOrderSummaryContent({
  order,
  currency,
  totalValue,
}: {
  order: PurchaseOrder;
  currency: string;
  totalValue: number;
}) {
  return (
    <InventorySummaryPanel
      className="p-0"
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
  );
}

export function PurchaseOrderDetailTabs({
  order,
  canEditLines,
  currency,
  autoAddLine = false,
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

  const summaryPanel = (
    <InventorySummaryPanel
      className={cn(!showSummaryPanel && "hidden xl:block")}
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
          isActive={activeTab === "summary"}
          onClick={() => setActiveTab("summary")}
        >
          Summary
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
          ) : (
            <div className="rounded-xl border border-brand-border bg-white p-6 xl:hidden">
              <PurchaseOrderSummaryContent
                order={order}
                currency={currency}
                totalValue={totalValue}
              />
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
