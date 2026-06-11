"use client";

import { PanelRight } from "lucide-react";
import { useState } from "react";

import { FabButton } from "@/components/ui/fab-button";
import {
  DetailPageMainAsideGrid,
  DetailPageMainSection,
  DetailPageTabNavItem,
  DetailPageTabsNavSection,
  DetailPageTabsSection,
} from "@/features/app-shell/components/page-layout";
import { InventorySummaryPanel } from "@/features/inventory/components/InventorySummaryPanel";
import {
  InventoryListTable,
  type InventoryListTableColumn,
} from "@/features/inventory/components/list/InventoryListTable";
import type { StockAdjustment } from "@/features/inventory/types/inventory.types";
import {
  formatAdjustmentTypeLabel,
  formatDisplayDateTime,
  formatInventoryQuantity,
  formatStockAdjustmentStatusLabel,
} from "@/features/inventory/utils/format-inventory";
import { cn } from "@/lib/utils";

type StockAdjustmentDetailTabsProps = {
  adjustment: StockAdjustment;
};

type DetailTabId = "lines" | "summary";

const lineColumns: InventoryListTableColumn<StockAdjustment["lines"][number]>[] = [
  {
    key: "product",
    label: "Product",
    cellClassName: "font-mono font-medium text-brand-navy",
    render: (line) => line.odoo_product_id,
  },
  {
    key: "qty_delta",
    label: "Qty delta",
    headerClassName: "text-right",
    cellClassName: "text-right",
    render: (line) => formatInventoryQuantity(line.quantity_delta),
  },
];

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
}: StockAdjustmentDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<DetailTabId>("lines");
  const [showSummaryPanel, setShowSummaryPanel] = useState(false);

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
          {adjustment.lines.length > 0 ? ` (${adjustment.lines.length})` : ""}
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
            adjustment.lines.length === 0 ? (
              <div className="rounded-xl border border-dashed border-brand-border bg-white px-6 py-14 text-center">
                <p className="text-sm font-medium text-brand-navy">No line items</p>
                <p className="mt-2 text-sm text-brand-muted">
                  Line items will appear here once added to this adjustment.
                </p>
              </div>
            ) : (
              <InventoryListTable
                items={adjustment.lines}
                columns={lineColumns}
                getRowKey={(line) =>
                  String(line.id ?? `${line.odoo_product_id}-${line.quantity_delta}`)
                }
              />
            )
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
