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
import type { InternalOrder } from "@/features/inventory/types/inventory.types";
import {
  formatDisplayDateTime,
  formatInternalOrderStatusLabel,
  formatInventoryQuantity,
} from "@/features/inventory/utils/format-inventory";
import { cn } from "@/lib/utils";

type InternalOrderDetailTabsProps = {
  order: InternalOrder;
};

type DetailTabId = "lines" | "summary";

const lineColumns: InventoryListTableColumn<InternalOrder["lines"][number]>[] = [
  {
    key: "product",
    label: "Product",
    cellClassName: "font-mono font-medium text-brand-navy",
    render: (line) => line.odoo_product_id,
  },
  {
    key: "qty",
    label: "Qty",
    headerClassName: "text-right",
    cellClassName: "text-right",
    render: (line) => formatInventoryQuantity(line.quantity),
  },
];

function InternalOrderSummaryContent({ order }: { order: InternalOrder }) {
  return (
    <InventorySummaryPanel
      className="p-0"
      sections={[
        {
          title: "Order summary",
          fields: [
            { label: "Reference", value: order.reference_number },
            { label: "Status", value: formatInternalOrderStatusLabel(order.status) },
            { label: "Source location", value: order.source_location },
            { label: "Destination location", value: order.destination_location },
            { label: "Approved", value: formatDisplayDateTime(order.approved_at) },
            { label: "Dispatched", value: formatDisplayDateTime(order.dispatched_at) },
            { label: "Received", value: formatDisplayDateTime(order.received_at) },
            { label: "Created", value: formatDisplayDateTime(order.created_at) },
          ],
        },
      ]}
    />
  );
}

export function InternalOrderDetailTabs({ order }: InternalOrderDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<DetailTabId>("lines");
  const [showSummaryPanel, setShowSummaryPanel] = useState(false);

  const summaryPanel = (
    <InventorySummaryPanel
      className={cn(!showSummaryPanel && "hidden xl:block")}
      sections={[
        {
          title: "Order summary",
          fields: [
            { label: "Reference", value: order.reference_number },
            { label: "Status", value: formatInternalOrderStatusLabel(order.status) },
            { label: "Source location", value: order.source_location },
            { label: "Destination location", value: order.destination_location },
            { label: "Approved", value: formatDisplayDateTime(order.approved_at) },
            { label: "Dispatched", value: formatDisplayDateTime(order.dispatched_at) },
            { label: "Received", value: formatDisplayDateTime(order.received_at) },
            { label: "Created", value: formatDisplayDateTime(order.created_at) },
          ],
        },
      ]}
    />
  );

  return (
    <DetailPageTabsSection>
      <DetailPageTabsNavSection aria-label="Internal order sections">
        <DetailPageTabNavItem
          isActive={activeTab === "lines"}
          onClick={() => setActiveTab("lines")}
        >
          Line items{order.lines.length > 0 ? ` (${order.lines.length})` : ""}
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
            order.lines.length === 0 ? (
              <div className="rounded-xl border border-dashed border-brand-border bg-white px-6 py-14 text-center">
                <p className="text-sm font-medium text-brand-navy">No line items</p>
                <p className="mt-2 text-sm text-brand-muted">
                  Line items will appear here once added to this order.
                </p>
              </div>
            ) : (
              <InventoryListTable
                items={order.lines}
                columns={lineColumns}
                getRowKey={(line) =>
                  String(line.id ?? `${line.odoo_product_id}-${line.quantity}`)
                }
              />
            )
          ) : (
            <div className="rounded-xl border border-brand-border bg-white p-6 xl:hidden">
              <InternalOrderSummaryContent order={order} />
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
